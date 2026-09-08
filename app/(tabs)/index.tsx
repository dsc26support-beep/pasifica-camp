/**
 * Pasifika Campus — Home / discovery.
 * Header + search + 4 primary categories + Featured / Recent rails + a Tip.
 * Progressive disclosure: a few clean sections, not an overwhelming wall.
 */
import React from 'react';
import { View, ScrollView, Pressable, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { SearchBar } from '../../components/ui/SearchBar';
import { LogoHorizontal } from '../../components/ui/Logo';
import { Card } from '../../components/ui/Card';
import { ListingCard } from '../../components/listings/ListingCard';
import { ListingCardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/StateView';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getFeatured, getRecent } from '../../features/listings/service';
import { listPublishedTips } from '../../features/tips/service';
import { PrimaryCategoryTypes } from '../../constants/config';
import { Theme } from '../../constants/colors';
import { Spacing } from '../../constants/layout';

export default function HomeScreen() {
  const router = useRouter();
  const featured = useAsyncData(() => getFeatured(), []);
  const recent = useAsyncData(() => getRecent(), []);
  const tips = useAsyncData(() => listPublishedTips(), []);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <LogoHorizontal size={34} />
        </View>

        {/* Search (tap to open full search screen) */}
        <View style={styles.section}>
          <SearchBar onPress={() => router.push('/search')} />
        </View>

        {/* Primary categories */}
        <View style={styles.categoryRow}>
          {PrimaryCategoryTypes.map((c) => (
            <Pressable
              key={c.key}
              onPress={() => router.push(`/search?type=${c.key}`)}
              style={styles.categoryChip}
              accessibilityRole="button"
              accessibilityLabel={c.label}
            >
              <Text variant="label" color="primary">
                {c.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Featured */}
        <Rail
          title="Featured"
          state={featured}
          emptyTitle="No featured listings yet"
        />

        {/* Recently added */}
        <Rail
          title="Recently added"
          state={recent}
          emptyTitle="No listings found."
          emptyAction={{ label: 'Be the first to sell', onPress: () => router.push('/sell') }}
        />

        {/* A tip / promo */}
        {tips.data && tips.data.length > 0 && tips.data[0] ? (
          <View style={styles.section}>
            <Text variant="h3" style={styles.railTitle}>
              Tip
            </Text>
            <Card onPress={() => router.push('/(tabs)/tips')}>
              <Text variant="title">{tips.data[0].title}</Text>
              {tips.data[0].description ? (
                <Text variant="body" color="secondary" numberOfLines={2} style={{ marginTop: 4 }}>
                  {tips.data[0].description}
                </Text>
              ) : null}
            </Card>
          </View>
        ) : null}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </Screen>
  );
}

type RailState = ReturnType<typeof useAsyncData<Awaited<ReturnType<typeof getRecent>>>>;

function Rail({
  title,
  state,
  emptyTitle,
  emptyAction,
}: {
  title: string;
  state: RailState;
  emptyTitle: string;
  emptyAction?: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.section}>
      <Text variant="h3" style={styles.railTitle}>
        {title}
      </Text>
      {state.loading ? (
        <View style={styles.rail}>
          <ListingCardSkeleton />
          <ListingCardSkeleton />
          <ListingCardSkeleton />
        </View>
      ) : state.error ? (
        <ErrorState message={state.error} onRetry={state.reload} />
      ) : !state.data || state.data.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          actionLabel={emptyAction?.label}
          onAction={emptyAction?.onPress}
        />
      ) : (
        <FlatList
          horizontal
          data={state.data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ListingCard listing={item} />}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg },
  header: { paddingVertical: Spacing.lg },
  section: { marginTop: Spacing.xl },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  categoryChip: {
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: 999,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  railTitle: { marginBottom: Spacing.md },
  rail: { flexDirection: 'row' },
});
