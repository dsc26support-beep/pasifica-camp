/**
 * Pasifika Campus — Listing detail.
 * Gallery, title, price, availability, seller/business, location, and the four
 * actions: Favourite, Add to Cart, Message Seller, Report.
 */
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusPill } from '../../components/ui/StatusPill';
import { LoadingState, ErrorState } from '../../components/ui/StateView';
import { ReportSheet } from '../../components/listings/ReportSheet';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getById } from '../../features/listings/service';
import { addFavourite, removeFavourite, isFavourited } from '../../features/favourites/service';
import { addToCart } from '../../features/cart/service';
import { startConversation } from '../../features/messaging/service';
import { useAuth } from '../../features/account/AuthProvider';
import { formatPrice, formatLocation } from '../../utils/format';
import { publicUrl } from '../../utils/storage';
import { Theme } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/layout';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const router = useRouter();
  const [fav, setFav] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data: listing, loading, error, reload } = useAsyncData(async () => {
    const l = await getById(id!);
    if (l && session) setFav(await isFavourited(session.user.id, l.id));
    return l;
  }, [id]);

  if (loading) return <Screen><LoadingState /></Screen>;
  if (error || !listing)
    return (
      <Screen>
        <ErrorState message={error ?? 'Listing not found.'} onRetry={reload} />
      </Screen>
    );

  const images = [...(listing.listing_images ?? [])].sort(
    (a, b) => a.display_order - b.display_order
  );
  const isOwner = session?.user.id === listing.owner_id;

  async function toggleFav() {
    if (!session || !listing) return;
    if (fav) {
      await removeFavourite(session.user.id, listing.id);
      setFav(false);
    } else {
      await addFavourite(session.user.id, listing.id);
      setFav(true);
    }
  }

  async function handleAddToCart() {
    if (!session || !listing) return;
    setBusy(true);
    try {
      await addToCart(session.user.id, listing.id, 1);
      Alert.alert('Added to cart', 'Contact the seller from your cart to arrange purchase.');
    } finally {
      setBusy(false);
    }
  }

  async function handleMessage() {
    if (!listing?.owner?.id) return;
    const convId = await startConversation({
      recipientId: listing.owner.id,
      listingId: listing.id,
    });
    router.push(`/conversation/${convId}`);
  }

  return (
    <Screen edges={['bottom']}>
      <ScrollView>
        {/* Gallery */}
        {images.length > 0 ? (
          <FlatList
            horizontal
            pagingEnabled
            data={images}
            keyExtractor={(i) => i.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const uri = publicUrl('listings', item.storage_path);
              return uri ? (
                <Image source={{ uri }} style={styles.hero} contentFit="cover" />
              ) : null;
            }}
          />
        ) : (
          <View style={[styles.hero, styles.noImage]}>
            <Text color="muted">No image</Text>
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text variant="h2" style={{ flex: 1 }}>
              {listing.title}
            </Text>
            <StatusPill
              status={listing.availability_status}
              label={listing.availability_status === 'available' ? 'Available' : 'Unavailable'}
            />
          </View>

          <Text variant="h3" color="accent" style={styles.price}>
            {formatPrice(listing.price, listing.price_type)}
          </Text>

          <Text variant="caption" color="muted">
            {formatLocation(listing)}
          </Text>

          {listing.description ? (
            <Text variant="body" color="secondary" style={styles.desc}>
              {listing.description}
            </Text>
          ) : null}

          {/* Seller / business */}
          <Card style={styles.sellerCard}
            onPress={
              listing.business?.id
                ? () => router.push(`/business/${listing.business!.id}`)
                : undefined
            }
          >
            <Text variant="label" color="muted">
              {listing.business ? 'Business' : 'Seller'}
            </Text>
            <Text variant="title">
              {listing.business?.name ?? listing.owner?.full_name ?? 'Seller'}
            </Text>
            {listing.business ? (
              <View style={{ marginTop: 6 }}>
                <StatusPill
                  status={listing.business.is_open ? 'open' : 'suspended'}
                  label={listing.business.is_open ? 'Open now' : 'Closed'}
                  tone={listing.business.is_open ? 'positive' : 'danger'}
                />
              </View>
            ) : null}
          </Card>

          {/* Actions */}
          {!isOwner ? (
            <View style={styles.actions}>
              <View style={styles.actionRow}>
                <Button
                  label={fav ? '♥ Saved' : '♡ Favourite'}
                  variant="secondary"
                  onPress={toggleFav}
                  style={{ flex: 1 }}
                />
                {listing.listing_type === 'product' ? (
                  <Button
                    label="Add to cart"
                    variant="secondary"
                    onPress={handleAddToCart}
                    loading={busy}
                    style={{ flex: 1 }}
                  />
                ) : null}
              </View>
              <Button label="Message seller" onPress={handleMessage} />
              <Pressable onPress={() => setReportOpen(true)} style={styles.report}>
                <Text variant="label" color="danger">
                  Report this listing
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.actions}>
              <Text variant="caption" color="muted" style={{ textAlign: 'center' }}>
                This is your listing. Manage it from Account › My listings.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <ReportSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="listing"
        targetId={listing.id}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { width: 380, maxWidth: '100%', aspectRatio: 1, backgroundColor: Theme.surfaceAlt },
  noImage: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  body: { padding: Spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  price: { marginTop: Spacing.sm },
  desc: { marginTop: Spacing.lg, lineHeight: 22 },
  sellerCard: { marginTop: Spacing.xl },
  actions: { marginTop: Spacing.xl, gap: Spacing.md },
  actionRow: { flexDirection: 'row', gap: Spacing.md },
  report: { alignItems: 'center', paddingVertical: Spacing.md },
});
