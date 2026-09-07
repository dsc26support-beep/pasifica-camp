/**
 * Pasifika Campus — Button.
 * Variants: primary (gold CTA), secondary (dark surface), ghost, danger.
 * Gold is reserved for primary actions to preserve the brand balance.
 * Shows a spinner + disables itself while loading (spec §49).
 */
import React from 'react';
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native';
import { Text } from './Text';
import { Theme, Palette } from '../../constants/colors';
import { Radius, Spacing, MIN_TAP_TARGET } from '../../constants/layout';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        variantStyles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? Palette.charcoal : Palette.gold}
            style={{ marginRight: Spacing.sm }}
          />
        )}
        <Text
          variant="bodyMedium"
          color={variant === 'primary' ? 'onGold' : variant === 'danger' ? 'danger' : 'primary'}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TAP_TARGET,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});

const variantStyles: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: Theme.accent },
  secondary: { backgroundColor: Theme.surface, borderWidth: 1, borderColor: Theme.border },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Theme.danger },
};
