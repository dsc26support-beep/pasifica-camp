/**
 * Pasifika Campus — Card surface.
 * Dark premium surface, moderate radius, subtle border, minimal shadow.
 */
import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Theme } from '../../constants/colors';
import { Radius, Spacing, Elevation } from '../../constants/layout';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padded?: boolean;
}

export function Card({ children, onPress, style, padded = true }: CardProps) {
  const content = (
    <View style={[styles.card, padded && styles.padded, style]}>{children}</View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => pressed && styles.pressed}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Theme.border,
    ...Elevation.card,
  },
  padded: { padding: Spacing.lg },
  pressed: { opacity: 0.9 },
});
