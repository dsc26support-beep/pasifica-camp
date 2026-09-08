/**
 * Pasifika Campus — Image picker row for listing creation.
 * Enforces the configurable max-images limit and validates type/size.
 */
import React from 'react';
import { View, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '../ui/Text';
import { AppConfig } from '../../constants/config';
import { validateImage } from '../../lib/validation';
import { Theme } from '../../constants/colors';
import { Radius, Spacing } from '../../constants/layout';

export function ImagePickerRow({
  uris,
  onChange,
}: {
  uris: string[];
  onChange: (uris: string[]) => void;
}) {
  async function pick() {
    if (uris.length >= AppConfig.maxImagesPerListing) {
      Alert.alert('Limit reached', `You can add up to ${AppConfig.maxImagesPerListing} images.`);
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to add images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const err = validateImage({ mimeType: asset.mimeType, fileSize: asset.fileSize });
    if (err) {
      Alert.alert('Invalid image', err);
      return;
    }
    onChange([...uris, asset.uri]);
  }

  function remove(uri: string) {
    onChange(uris.filter((u) => u !== uri));
  }

  return (
    <View style={styles.wrap}>
      <Text variant="label" color="secondary" style={styles.label}>
        Photos ({uris.length}/{AppConfig.maxImagesPerListing})
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {uris.map((uri) => (
          <Pressable key={uri} onPress={() => remove(uri)} style={styles.thumb}>
            <Image source={{ uri }} style={styles.image} contentFit="cover" />
            <View style={styles.removeBadge}>
              <Text variant="caption" color="onGold">
                ✕
              </Text>
            </View>
          </Pressable>
        ))}
        {uris.length < AppConfig.maxImagesPerListing ? (
          <Pressable onPress={pick} style={styles.addBtn} accessibilityLabel="Add photo">
            <Text variant="h2" color="accent">
              +
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: Spacing.lg },
  label: { marginBottom: Spacing.sm },
  thumb: { marginRight: Spacing.sm },
  image: { width: 88, height: 88, borderRadius: Radius.md, backgroundColor: Theme.surfaceAlt },
  removeBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Theme.accent,
    borderRadius: 999,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 88,
    height: 88,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Theme.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
