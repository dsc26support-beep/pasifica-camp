/**
 * Pasifika Campus — Search & filter.
 * Keyword search plus type / category / price / availability filters, routed
 * through the swappable search_listings RPC (spec §18). Accepts an initial
 * `type` param from Home category chips.
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '../components/ui/Screen';
import { Text } from '../components/ui/Text';
import { SearchBar } from '../components/ui/SearchBar';
import { Input } from '../components/ui/Input';
import { ListingCard } from '../components/listings/ListingCard';
import { LoadingState, EmptyState, ErrorState } from '../components/ui/StateView';
import { searchListings } from '../features/listings/service';
import type { ListingType, Listing, ListingWithRelations } from '../types/database';
import { Theme } from '../constants/colors';
import { Spacing } from '../constants/layout';

const TYPES: { key: ListingType | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'product', label: 'Products' },
  { key: 'service', label: 'Services' },
  { key: 'rental', label: 'Rentals' },
];

export default function SearchScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const initialType = (params.type as ListingType | undefined) ?? 'all';

  const [query, setQuery] = useState('');
  const [type, setType] = useState<ListingType | 'all'>(
    (['product', 'service', 'rental'].includes(initialType) ? initialType : 'all') as
      | ListingType
      | 'all'
  );
  const [priceMax, setPriceMax] = useState('');
  const [results, setResults] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await searchListings({
        query: query.trim() || undefined,
        listingType: type === 'all' ? undefined : type,
        priceMax: priceMax ? Number(priceMax) : undefined,
        available: true,
      });
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed.');
    } finally {
      setLoading(false);
    }
  }, [query, type, priceMax]);

  return (
    <Screen edges={['bottom']}>
      <View style={styles.controls}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onSubmit={run}
          autoFocus
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
          {TYPES.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => setType(t.key)}
              style={[styles.typeChip, type === t.key && styles.typeChipActive]}
            >
              <Text variant="label" color={type === t.key ? 'onGold' : 'primary'}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.filterRow}>
          <View style={{ flex: 1 }}>
            <Input
              label="Max price"
              value={priceMax}
              onChangeText={setPriceMax}
              keyboardType="numeric"
              placeholder="Any"
              style={{ marginBottom: 0 }}
            />
          </View>
          <Pressable onPress={run} style={styles.applyBtn}>
            <Text variant="bodyMedium" color="onGold">
              Search
            </Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={run} />
      ) : searched && results.length === 0 ? (
        <EmptyState title="No listings found." message="Try a different keyword or filter." />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(l) => l.id}
          numColumns={2}
          columnWrapperStyle={styles.grid}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ListingCard listing={item as ListingWithRelations} width="48%" />
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  controls: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.divider,
  },
  typeRow: { marginTop: Spacing.md },
  typeChip: {
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: 999,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
  },
  typeChipActive: { backgroundColor: Theme.accent, borderColor: Theme.accent },
  filterRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.md, marginTop: Spacing.md },
  applyBtn: {
    backgroundColor: Theme.accent,
    borderRadius: 12,
    paddingHorizontal: Spacing.xl,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: Spacing.lg },
  grid: { justifyContent: 'space-between', marginBottom: Spacing.lg },
});
