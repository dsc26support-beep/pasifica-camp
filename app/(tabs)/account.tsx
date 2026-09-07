/**
 * Pasifika Campus — Account tab.
 * Profile summary + entry points: Sell, My listings, My business, Favourites,
 * Admin (only if role = admin), and Sign out.
 */
import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../features/account/AuthProvider';
import { signOut } from '../../lib/auth';
import { Theme } from '../../constants/colors';
import { Spacing } from '../../constants/layout';

export default function AccountScreen() {
  const { profile, isAdmin } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  const links: { label: string; onPress: () => void; adminOnly?: boolean }[] = [
    { label: 'Sell an item, service or rental', onPress: () => router.push('/sell') },
    { label: 'My listings', onPress: () => router.push('/sell?mine=1') },
    { label: 'My business', onPress: () => router.push('/business/manage') },
    { label: 'Favourites', onPress: () => router.push('/favourites') },
    { label: 'Admin dashboard', onPress: () => router.push('/admin'), adminOnly: true },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="h1" style={styles.title}>
          Account
        </Text>

        <Card style={styles.profileCard}>
          <Text variant="title">{profile?.full_name ?? 'Your profile'}</Text>
          {profile?.email ? (
            <Text variant="body" color="secondary">
              {profile.email}
            </Text>
          ) : null}
          <Text variant="caption" color="muted" style={{ marginTop: 4 }}>
            {[profile?.community, profile?.island, profile?.country]
              .filter(Boolean)
              .join(', ')}
          </Text>
        </Card>

        <View style={styles.links}>
          {links
            .filter((l) => !l.adminOnly || isAdmin)
            .map((l) => (
              <Pressable key={l.label} onPress={l.onPress} style={styles.link}>
                <Text variant="body">{l.label}</Text>
                <Text variant="body" color="muted">
                  ›
                </Text>
              </Pressable>
            ))}
        </View>

        <Button
          label="Sign out"
          variant="danger"
          onPress={handleSignOut}
          style={{ marginTop: Spacing.xl }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg },
  title: { marginBottom: Spacing.lg },
  profileCard: { marginBottom: Spacing.xl },
  links: {},
  link: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.divider,
  },
});
