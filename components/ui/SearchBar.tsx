/**
 * Pasifika Campus — Search bar (tap to open full search, or inline).
 */
import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Theme } from '../../constants/colors';
import { Radius, Spacing } from '../../constants/layout';
import { FontFamily, FontSize } from '../../constants/typography';

interface Props {
  value?: string;
  onChangeText?: (t: string) => void;
  onSubmit?: () => void;
  onPress?: () => void; // when used as a button (Home)
  placeholder?: string;
  editable?: boolean;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onPress,
  placeholder = 'Search products, services, businesses…',
  editable = true,
  autoFocus,
}: Props) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.wrap} accessibilityRole="search">
        <Text variant="caption" color="accent" style={styles.icon}>
          ⌕
        </Text>
        <Text variant="body" color="muted">
          {placeholder}
        </Text>
      </Pressable>
    );
  }
  return (
    <View style={styles.wrap}>
      <Text variant="caption" color="accent" style={styles.icon}>
        ⌕
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={Theme.textMuted}
        editable={editable}
        autoFocus={autoFocus}
        returnKeyType="search"
        style={styles.input}
        accessibilityLabel="Search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.inputBackground,
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.lg,
    height: 46,
  },
  icon: { fontSize: 18, marginRight: Spacing.sm },
  input: {
    flex: 1,
    color: Theme.textPrimary,
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    paddingVertical: 0,
  },
});
