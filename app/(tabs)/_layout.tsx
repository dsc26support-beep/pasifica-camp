/**
 * Pasifika Campus — Bottom tab navigator.
 * EXACTLY five permanent destinations: Home, Tips, Messages, Cart, Account.
 * Charcoal surface, gold active icon/label, grey inactive. Minimal animation.
 * Icons are simple text glyphs to avoid an icon-font dependency; swap for a
 * rounded icon set (e.g. Feather) when one is added.
 */
import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { Theme } from '../../constants/colors';

function TabIcon({ glyph, color }: { glyph: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{glyph}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.navActive,
        tabBarInactiveTintColor: Theme.navInactive,
        tabBarStyle: {
          backgroundColor: Theme.navBackground,
          borderTopColor: Theme.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon glyph="⌂" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tips"
        options={{
          title: 'Tips',
          tabBarIcon: ({ color }) => <TabIcon glyph="★" color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <TabIcon glyph="✉" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color }) => <TabIcon glyph="▤" color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <TabIcon glyph="◕" color={color} />,
        }}
      />
    </Tabs>
  );
}
