/**
 * Pasifika Campus — Favourites list.
 */
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Screen } from '../components/ui/Screen';
import { ListingCard } from '../components/listings/ListingCard';
import { LoadingState, EmptyState, ErrorState } from '../components/ui/StateView';
import { useAsyncData } from '../hooks/useAsyncData';
import { listFavourites } from '../features/favourites/service';
import { useAuth } from '../features/account/AuthProvider';
import { Spacing } from '../constants/layout';

export default function FavouritesScreen() {
  const { session } = useAuth();
  const { data, loading, error, reload } = useAsyncData(
    () => (session ? listFavourites(session.user.id) : Promise.resolve([])),
    [session?.user.id]
  );

  useFocusEffect(
    React.useCallback(() => {
      reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  if (loading) return <Screen><LoadingState /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={reload} /></Screen>;

  return (
    <Screen edges={['bottom']}>
      {!data || data.length === 0 ? (
        <EmptyState title="No favourites yet" message="Tap the heart on any listing to save it here." />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(l) => l.id}
          numColumns={2}
          columnWrapperStyle={styles.grid}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ListingCard listing={item} width="48%" />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.lg },
  grid: { justifyContent: 'space-between', marginBottom: Spacing.lg },
});
