/**
 * Pasifika Campus — Category selector (chips). Categories are loaded from the
 * DB (admin-managed), never hard-coded.
 */
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { LoadingState } from '../ui/StateView';
import { useAsyncData } from '../../hooks/useAsyncData';
import { listCategories } from '../../features/categories/service';
import type { CategoryType } from '../../types/database';
import { Theme } from '../../constants/colors';
import { Spacing } from '../../constants/layout';

export function CategorySelect({
  type,
  value,
  onChange,
  error,
}: {
  type: CategoryType;
  value: string | null;
  onChange: (id: string) => void;
  error?: string | null;
}) {
  const { data, loading } = useAsyncData(() => listCategories(type), [type]);

  return (
    <View style={styles.wrap}>
      <Text variant="label" color="secondary" style={styles.label}>
        Category *
      </Text>
      {loading ? (
        <LoadingState />
      ) : (
        <View style={styles.chips}>
          {(data ?? []).map((c) => (
            <Pressable
              key={c.id}
              onPress={() => onChange(c.id)}
              style={[styles.chip, value === c.id && styles.chipActive]}
            >
              <Text variant="label" color={value === c.id ? 'onGold' : 'primary'}>
                {c.name}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      {error ? (
        <Text variant="caption" color="danger" style={{ marginTop: 4 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: Spacing.lg },
  label: { marginBottom: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: 999,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  chipActive: { backgroundColor: Theme.accent, borderColor: Theme.accent },
});
