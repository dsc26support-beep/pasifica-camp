/**
 * Pasifika Campus — Skeleton placeholder.
 * A simple static shimmer surface — no indefinite/heavy animation (spec §49).
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Theme } from '../../constants/colors';
import { Radius, Spacing } from '../../constants/layout';

export function Skeleton({ height = 16, width = '100%', style }: { height?: number; width?: ViewStyle['width']; style?: ViewStyle }) {
  return <View style={[styles.base, { height, width }, style]} />;
}

export function ListingCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton height={120} style={{ borderRadius: Radius.md }} />
      <Skeleton height={14} width="80%" style={{ marginTop: Spacing.md }} />
      <Skeleton height={12} width="50%" style={{ marginTop: Spacing.sm }} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: Theme.surfaceAlt, borderRadius: Radius.sm, opacity: 0.6 },
  card: { width: 180, marginRight: Spacing.md },
});
