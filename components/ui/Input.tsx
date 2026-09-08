/**
 * Pasifika Campus — Text input with label + error state.
 */
import React from 'react';
import { View, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Theme } from '../../constants/colors';
import { Radius, Spacing } from '../../constants/layout';
import { FontFamily, FontSize } from '../../constants/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  required?: boolean;
}

export function Input({ label, error, required, style, ...rest }: InputProps) {
  return (
    <View style={styles.wrapper}>
      {label && (
        <Text variant="label" color="secondary" style={styles.label}>
          {label}
          {required ? ' *' : ''}
        </Text>
      )}
      <TextInput
        placeholderTextColor={Theme.textMuted}
        style={[styles.input, !!error && styles.inputError, style]}
        {...rest}
      />
      {!!error && (
        <Text variant="caption" color="danger" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.lg },
  label: { marginBottom: Spacing.xs },
  input: {
    backgroundColor: Theme.inputBackground,
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    color: Theme.textPrimary,
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
  },
  inputError: { borderColor: Theme.danger },
  error: { marginTop: Spacing.xs },
});
