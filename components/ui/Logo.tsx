/**
 * Pasifika Campus — Logo mark rendered natively via react-native-svg.
 * Mirrors assets/branding/pasifika-campus-icon.svg so the brand mark shows in
 * the app before PNG exports exist. Follows the approved direction (P monogram
 * + sun + palm + waves, gold on charcoal).
 */
import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Circle, Path, Line, G } from 'react-native-svg';
import { Palette } from '../../constants/colors';

export function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect width={512} height={512} rx={112} fill={Palette.charcoal} />
      <Circle cx={256} cy={150} r={46} fill={Palette.gold} />
      <G stroke={Palette.gold} strokeWidth={8} strokeLinecap="round" opacity={0.85}>
        <Line x1={256} y1={70} x2={256} y2={52} />
        <Line x1={316} y1={90} x2={328} y2={76} />
        <Line x1={196} y1={90} x2={184} y2={76} />
      </G>
      <Path
        d="M176 196 h96 a70 70 0 0 1 0 140 h-52 v92 h-44 z M220 236 v60 h52 a30 30 0 0 0 0 -60 z"
        fill={Palette.gold}
      />
      <G stroke={Palette.gold} strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.9}>
        <Path d="M198 210 q-34 -30 -78 -22" />
        <Path d="M198 210 q-22 -40 -62 -54" />
        <Path d="M198 210 q6 -46 -18 -78" />
      </G>
      <G stroke={Palette.mediumGrey} strokeWidth={10} strokeLinecap="round" fill="none">
        <Path d="M96 404 q40 -26 80 0 t80 0 t80 0 t80 0" />
      </G>
      <G stroke={Palette.gold} strokeWidth={10} strokeLinecap="round" fill="none">
        <Path d="M96 440 q40 -26 80 0 t80 0 t80 0 t80 0" />
      </G>
    </Svg>
  );
}

/** Horizontal lockup: mark + wordmark, for headers. */
export function LogoHorizontal({ size = 32 }: { size?: number }) {
  const { Text } = require('./Text') as typeof import('./Text');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <LogoMark size={size} />
      <View>
        <Text variant="title" style={{ letterSpacing: 0.5 }}>
          PASIFIKA
        </Text>
        <Text variant="label" color="accent" style={{ letterSpacing: 3, marginTop: -2 }}>
          CAMPUS
        </Text>
      </View>
    </View>
  );
}
