/**
 * Pasifika Campus — Auth service.
 * Thin wrapper over Supabase Auth: sign-up, sign-in, sign-out, reset.
 * Session persistence is handled by the client (lib/supabase).
 */
import { supabase } from './supabase';
import type { SignInInput, SignUpInput } from './validation';

export async function signUp({ full_name, email, password }: SignUpInput) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      // full_name/country flow into the handle_new_user() trigger metadata.
      data: { full_name, country: 'Kiribati' },
    },
  });
}

export async function signIn({ email, password }: SignInInput) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'pasifikacampus://reset-password',
  });
}

export async function getSession() {
  return supabase.auth.getSession();
}
