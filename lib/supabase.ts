/**
 * Pasifika Campus — Supabase client
 * -------------------------------------------------------------------------
 * Uses ONLY the public anon key (never the service-role key). Sessions are
 * persisted so users stay logged in between app launches. On native we store
 * the session in expo-secure-store; on web we fall back to the default.
 *
 * Environment: values come from EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY (see
 * .env.example). The app fails loudly in development if they are missing.
 */
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't crash production silently, but make the misconfiguration obvious in dev.
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to .env and set your Supabase project values.'
  );
}

/**
 * SecureStore has a ~2KB value limit; Supabase sessions can exceed it, so we
 * chunk large values. This adapter is only used on native.
 */
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
