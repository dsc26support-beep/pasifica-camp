/**
 * Pasifika Campus — Logo components.
 * Renders the APPROVED Logo Option 1 artwork (P-monogram + wordmark) shipped in
 * assets/branding. `LogoMark` is the P-monogram alone (headers/compact);
 * `LogoFull` is the stacked mark + PASIFIKA CAMPUS wordmark (auth/splash-like);
 * `LogoHorizontal` pairs the mark with a text wordmark for top bars.
 * The artwork is used as provided — not recoloured or distorted.
 */
import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from './Text';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MARK = require('../../assets/branding/logo-mark.png');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FULL = require('../../assets/branding/pasifika-campus-logo-primary.png');

/** P-monogram only (the strongest recognizable brand element). */
export function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <Image
      source={MARK}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessibilityLabel="Pasifika Campus"
    />
  );
}

/** Stacked full logo: mark + PASIFIKA CAMPUS wordmark. */
export function LogoFull({ size = 200 }: { size?: number }) {
  return (
    <Image
      source={FULL}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessibilityLabel="Pasifika Campus"
    />
  );
}

/** Horizontal lockup for headers: mark + text wordmark. */
export function LogoHorizontal({ size = 40 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <LogoMark size={size} />
      <View>
        <Text variant="title" style={{ letterSpacing: 1 }}>
          PASIFIKA
        </Text>
        <Text variant="label" color="accent" style={{ letterSpacing: 4, marginTop: -2 }}>
          CAMPUS
        </Text>
      </View>
    </View>
  );
}
