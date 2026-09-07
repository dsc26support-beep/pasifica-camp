/**
 * Pasifika Campus — Tips tab.
 * Admin-curated deals, promotions, featured content and community info.
 */
import React from 'react';
import { FlatList, View, StyleSheet, Linking } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/StateView';
import { useAsyncData } from '../../hooks/useAsyncData';
import { listPublishedTips } from '../../features/tips/service';
import { Spacing } from '../../constants/layout';

export default function TipsScreen() {
  const { data, loading, error, reload } = useAsyncData(() => listPublishedTips(), []);

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="h1">Tips</Text>
        <Text variant="body" color="secondary">
          Deals, features and community info
        </Text>
      </View>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No tips yet" message="Check back soon for deals and updates." />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card
              style={styles.card}
              onPress={item.link_url ? () => Linking.openURL(item.link_url!) : undefined}
            >
              {item.category ? (
                <Text variant="caption" color="accent">
                  {item.category.toUpperCase()}
                </Text>
              ) : null}
              <Text variant="title" style={{ marginTop: 4 }}>
                {item.title}
              </Text>
              {item.description ? (
                <Text variant="body" color="secondary" style={{ marginTop: 4 }}>
                  {item.description}
                </Text>
              ) : null}
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  card: { marginBottom: Spacing.md },
});
