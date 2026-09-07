/**
 * Pasifika Campus — Themed Text.
 * Centralises typography + colour so screens never hard-code fonts/hex.
 */
import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { TextStyles } from '../../constants/typography';
import { Theme } from '../../constants/colors';

type Variant = keyof typeof TextStyles;
type Color = 'primary' | 'secondary' | 'muted' | 'accent' | 'onGold' | 'danger' | 'success';

const colorMap: Record<Color, string> = {
  primary: Theme.textPrimary,
  secondary: Theme.textSecondary,
  muted: Theme.textMuted,
  accent: Theme.accent,
  onGold: Theme.textOnGold,
  danger: Theme.danger,
  success: Theme.success,
};

export interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: Color;
}

export function Text({
  variant = 'body',
  color = 'primary',
  style,
  ...rest
}: AppTextProps) {
  return (
    <RNText
      style={[styles.base, TextStyles[variant], { color: colorMap[color] }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: { color: Theme.textPrimary },
});
