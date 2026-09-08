/**
 * Pasifika Campus — Sell landing + My listings.
 * Progressive disclosure: choose what to sell (Product / Service / Rental),
 * with no business required. Below, the seller sees their own listings with
 * status and can pause / mark unavailable / delete.
 */
import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { StatusPill } from '../../components/ui/StatusPill';
import { Button } from '../../components/ui/Button';
import { LoadingState, EmptyState } from '../../components/ui/StateView';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getMine, setAvailability, removeListing } from '../../features/listings/service';
import { useAuth } from '../../features/account/AuthProvider';
import { formatPrice } from '../../utils/format';
import { Spacing } from '../../constants/layout';

const OPTIONS = [
  { type: 'product', title: 'Product', desc: 'Sell an item — new or used' },
  { type: 'service', title: 'Service', desc: 'Offer a service to your community' },
  { type: 'rental', title: 'Rental', desc: 'List something to rent' },
] as const;

export default function SellScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const mine = useAsyncData(
    () => (session ? getMine(session.user.id) : Promise.resolve([])),
    [session?.user.id]
  );

  useFocusEffect(
    React.useCallback(() => {
      mine.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  async function togglePause(id: string, available: boolean) {
    await setAvailability(id, available);
    mine.reload();
  }

  function confirmDelete(id: string) {
    Alert.alert('Delete listing', 'This will remove your listing. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeListing(id);
          mine.reload();
        },
      },
    ]);
  }

  return (
    <Screen edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="h2" style={styles.title}>
          What would you like to sell?
        </Text>

        <View style={styles.options}>
          {OPTIONS.map((o) => (
            <Card
              key={o.type}
              onPress={() => router.push(`/sell/new?type=${o.type}`)}
              style={styles.option}
            >
              <Text variant="title">{o.title}</Text>
              <Text variant="caption" color="secondary">
                {o.desc}
              </Text>
            </Card>
          ))}
        </View>

        <Text variant="h3" style={styles.myTitle}>
          Your listings
        </Text>
        {mine.loading ? (
          <LoadingState />
        ) : !mine.data || mine.data.length === 0 ? (
          <EmptyState title="You have no listings yet" />
        ) : (
          mine.data.map((l) => (
            <Card key={l.id} style={styles.listing}>
              <View style={styles.listingHead}>
                <Text variant="title" style={{ flex: 1 }} numberOfLines={1}>
                  {l.title}
                </Text>
                <StatusPill status={l.status} />
              </View>
              <Text variant="label" color="accent">
                {formatPrice(l.price, l.price_type)}
              </Text>
              {l.status === 'rejected' && l.rejection_reason ? (
                <Text variant="caption" color="danger" style={{ marginTop: 4 }}>
                  Reason: {l.rejection_reason}
                </Text>
              ) : null}
              <View style={styles.listingActions}>
                {l.status !== 'removed' ? (
                  <Button
                    label={l.availability_status === 'available' ? 'Pause' : 'Reactivate'}
                    variant="secondary"
                    onPress={() => togglePause(l.id, l.availability_status !== 'available')}
                    style={{ flex: 1 }}
                  />
                ) : null}
                <Button
                  label="Delete"
                  variant="danger"
                  onPress={() => confirmDelete(l.id)}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg },
  title: { marginBottom: Spacing.lg },
  options: { gap: Spacing.md },
  option: {},
  myTitle: { marginTop: Spacing.xxl, marginBottom: Spacing.md },
  listing: { marginBottom: Spacing.md },
  listingHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  listingActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
});
