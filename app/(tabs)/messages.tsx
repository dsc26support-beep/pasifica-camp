/**
 * Pasifika Campus — Messages tab (conversation list).
 */
import React from 'react';
import { FlatList, View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/StateView';
import { useAsyncData } from '../../hooks/useAsyncData';
import { listConversations } from '../../features/messaging/service';
import { useAuth } from '../../features/account/AuthProvider';
import { Theme } from '../../constants/colors';
import { Spacing } from '../../constants/layout';
import { timeAgo } from '../../utils/format';

export default function MessagesScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const { data, loading, error, reload } = useAsyncData(
    () => (session ? listConversations(session.user.id) : Promise.resolve([])),
    [session?.user.id]
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="h1">Messages</Text>
      </View>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          message="Message a seller from any listing to start a conversation."
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => router.push(`/conversation/${item.id}`)}
              accessibilityRole="button"
            >
              <Text variant="title">Conversation</Text>
              <Text variant="caption" color="muted">
                {timeAgo(item.updated_at)}
              </Text>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg },
  row: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.divider,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
