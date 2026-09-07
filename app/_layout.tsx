/**
 * Pasifika Campus — Root layout.
 * Loads brand fonts, wraps the app in SafeArea + Auth context, and drives the
 * auth gate: unauthenticated users are redirected to the auth stack; everyone
 * else uses the tab navigator. The bottom tabs remain the only permanent nav.
 */
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { AuthProvider, useAuth } from '../features/account/AuthProvider';
import { LoadingState } from '../components/ui/StateView';
import { Theme } from '../constants/colors';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === 'auth';
    if (!session && !inAuthGroup) {
      router.replace('/auth/sign-in');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments, router]);

  if (loading) return <LoadingState message="Loading Pasifika Campus…" />;
  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
    Poppins_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) return <LoadingState />;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthGate>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: Theme.background },
              headerTintColor: Theme.textPrimary,
              headerTitleStyle: { color: Theme.textPrimary },
              contentStyle: { backgroundColor: Theme.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="listing/[id]" options={{ title: 'Listing' }} />
            <Stack.Screen name="business/[id]" options={{ title: 'Business' }} />
            <Stack.Screen name="conversation/[id]" options={{ title: 'Chat' }} />
            <Stack.Screen name="search" options={{ title: 'Search' }} />
            <Stack.Screen name="sell/index" options={{ title: 'Sell' }} />
            <Stack.Screen name="sell/new" options={{ title: 'New listing' }} />
            <Stack.Screen name="business/manage" options={{ title: 'My business' }} />
            <Stack.Screen name="admin/index" options={{ title: 'Admin' }} />
          </Stack>
        </AuthGate>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
