/**
 * Pasifika Campus — Loading / Empty / Error states.
 * Every major screen wraps its content so all four states (loading, error,
 * empty, content) are handled consistently (spec §48).
 */
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { Theme, Palette } from '../../constants/colors';
import { Spacing } from '../../constants/layout';

export function LoadingState({ message }: { message?: string }) {
  return (
    <View style={styles.center} accessibilityLabel="Loading">
      <ActivityIndicator color={Palette.gold} />
      {message ? (
        <Text variant="body" color="secondary" style={styles.msg}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.center}>
      <Text variant="h3" style={styles.emptyTitle}>
        {title}
      </Text>
      {message ? (
        <Text variant="body" color="secondary" style={styles.msg}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} fullWidth={false} style={styles.action} />
      ) : null}
    </View>
  );
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.center}>
      <Text variant="h3" color="danger" style={styles.emptyTitle}>
        Oops
      </Text>
      <Text variant="body" color="secondary" style={styles.msg}>
        {message}
      </Text>
      {onRetry ? (
        <Button label="Try again" variant="secondary" onPress={onRetry} fullWidth={false} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    backgroundColor: Theme.background,
  },
  emptyTitle: { textAlign: 'center' },
  msg: { textAlign: 'center', marginTop: Spacing.sm },
  action: { marginTop: Spacing.xl },
});
