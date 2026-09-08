/**
 * Pasifika Campus — Cart tab (LIGHTWEIGHT).
 * No payments/checkout. Subtotal is indicative only; the user contacts the
 * seller to arrange purchase/payment. This is stated clearly on-screen so no
 * one thinks a transaction has completed (spec §33).
 */
import React from 'react';
import { FlatList, View, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/StateView';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getCart, updateQuantity, removeFromCart } from '../../features/cart/service';
import { startConversation } from '../../features/messaging/service';
import { useAuth } from '../../features/account/AuthProvider';
import { formatPrice, cartSubtotal } from '../../utils/format';
import { Theme } from '../../constants/colors';
import { Spacing } from '../../constants/layout';

export default function CartScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const { data, loading, error, reload } = useAsyncData(
    () => (session ? getCart(session.user.id) : Promise.resolve([])),
    [session?.user.id]
  );

  useFocusEffect(
    React.useCallback(() => {
      reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const subtotal = cartSubtotal(
    (data ?? []).map((r) => ({ quantity: r.quantity, price: r.listing.price }))
  );

  async function changeQty(itemId: string, qty: number) {
    await updateQuantity(itemId, qty);
    reload();
  }
  async function remove(itemId: string) {
    await removeFromCart(itemId);
    reload();
  }
  async function contactSeller(ownerId: string, listingId: string) {
    const convId = await startConversation({ recipientId: ownerId, listingId });
    router.push(`/conversation/${convId}`);
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="h1">Cart</Text>
      </View>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          message="Add listings you're interested in, then contact the seller to arrange purchase."
        />
      ) : (
        <>
          <FlatList
            data={data}
            keyExtractor={(r) => r.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Card style={styles.item}>
                <Text variant="title" numberOfLines={1}>
                  {item.listing.title}
                </Text>
                <Text variant="label" color="accent">
                  {formatPrice(item.listing.price, item.listing.price_type)}
                </Text>
                <View style={styles.qtyRow}>
                  <Pressable
                    onPress={() => changeQty(item.id, item.quantity - 1)}
                    style={styles.qtyBtn}
                    accessibilityLabel="Decrease quantity"
                  >
                    <Text variant="title">−</Text>
                  </Pressable>
                  <Text variant="body">{item.quantity}</Text>
                  <Pressable
                    onPress={() => changeQty(item.id, item.quantity + 1)}
                    style={styles.qtyBtn}
                    accessibilityLabel="Increase quantity"
                  >
                    <Text variant="title">+</Text>
                  </Pressable>
                  <Pressable onPress={() => remove(item.id)} style={styles.removeBtn}>
                    <Text variant="label" color="danger">
                      Remove
                    </Text>
                  </Pressable>
                </View>
                <Button
                  label="Contact seller"
                  variant="secondary"
                  onPress={() =>
                    item.listing.owner?.id &&
                    contactSeller(item.listing.owner.id, item.listing.id)
                  }
                  style={{ marginTop: Spacing.md }}
                />
              </Card>
            )}
          />
          <View style={styles.footer}>
            <View style={styles.subtotalRow}>
              <Text variant="body" color="secondary">
                Indicative subtotal
              </Text>
              <Text variant="h3" color="accent">
                {formatPrice(subtotal, 'fixed')}
              </Text>
            </View>
            <Text variant="caption" color="muted" style={styles.notice}>
              Pasifika Campus does not process payments. Contact the seller to
              arrange purchase and payment.
            </Text>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  item: { marginBottom: Spacing.md },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginTop: Spacing.md },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtn: { marginLeft: 'auto' },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Theme.border,
    padding: Spacing.lg,
    backgroundColor: Theme.surfaceAlt,
  },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notice: { marginTop: Spacing.sm },
});
