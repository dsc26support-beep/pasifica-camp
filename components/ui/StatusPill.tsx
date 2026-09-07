/**
 * Pasifika Campus — Status pill.
 * Status is communicated with BOTH text and colour (never colour alone —
 * spec §51). Used for listing/business/report statuses and OPEN/CLOSED.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Theme } from '../../constants/colors';
import { Radius, Spacing } from '../../constants/layout';
import { statusLabel } from '../../utils/format';

type Tone = 'neutral' | 'positive' | 'warning' | 'danger';

const toneColor: Record<Tone, string> = {
  neutral: Theme.textSecondary,
  positive: Theme.success,
  warning: Theme.warning,
  danger: Theme.danger,
};

function toneForStatus(status: string): Tone {
  switch (status) {
    case 'approved':
    case 'resolved':
    case 'open': // business "open"
      return 'positive';
    case 'pending':
    case 'reviewing':
    case 'unavailable':
      return 'warning';
    case 'rejected':
    case 'removed':
    case 'suspended':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function StatusPill({
  status,
  label,
  tone,
}: {
  status?: string;
  label?: string;
  tone?: Tone;
}) {
  const resolvedTone = tone ?? (status ? toneForStatus(status) : 'neutral');
  const text = label ?? (status ? statusLabel(status) : '');
  const color = toneColor[resolvedTone];
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="caption" style={{ color }}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    gap: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
