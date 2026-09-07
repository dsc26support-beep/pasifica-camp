/**
 * Pasifika Campus — Listing card (used in Home rails, search, favourites).
 */
import React from 'react';
import { View, StyleSheet, Pressable, DimensionValue } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text } from '../ui/Text';
import { StatusPill } from '../ui/StatusPill';
import { Theme } from '../../constants/colors';
import { Radius, Spacing } from '../../constants/layout';
import { formatPrice, formatLocation } from '../../utils/format';
import { publicUrl } from '../../utils/storage';
import type { ListingWithRelations } from '../../types/database';

interface Props {
  listing: ListingWithRelations;
  width?: DimensionValue;
  showStatus?: boolean; // used in "My Listings" to show pending/approved
}

export function ListingCard({ listing, width = 180, showStatus = false }: Props) {
  const router = useRouter();
  const firstImage = listing.listing_images?.sort(
    (a, b) => a.display_order - b.display_order
  )[0];
  const uri = publicUrl('listings', firstImage?.storage_path);

  return (
    <Pressable
      onPress={() => router.push(`/listing/${listing.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${listing.title}, ${formatPrice(listing.price, listing.price_type)}`}
      style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}
    >
      <View style={styles.imageWrap}>
        {uri ? (
          <Image source={{ uri }} style={styles.image} contentFit="cover" transition={150} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text variant="caption" color="muted">
              No image
            </Text>
          </View>
        )}
        {listing.business?.name ? (
          <View style={styles.badge}>
            <Text variant="caption" color="onGold">
              {listing.business.name}
            </Text>
          </View>
        ) : null}
      </View>

      <Text variant="bodyMedium" numberOfLines={1} style={styles.title}>
        {listing.title}
      </Text>
      <Text variant="label" color="accent">
        {formatPrice(listing.price, listing.price_type)}
      </Text>
      <Text variant="caption" color="muted" numberOfLines={1}>
        {formatLocation(listing)}
      </Text>
      {showStatus ? (
        <View style={styles.statusRow}>
          <StatusPill status={listing.status} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginRight: Spacing.md },
  pressed: { opacity: 0.9 },
  imageWrap: { position: 'relative' },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.md,
    backgroundColor: Theme.surfaceAlt,
  },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Theme.accent,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  title: { marginTop: Spacing.sm },
  statusRow: { marginTop: Spacing.xs },
});
