/**
 * Pasifika Campus — Sign up.
 * Minimal registration: full name, email, password. No business required.
 */
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { signUp } from '../../lib/auth';
import { signUpSchema } from '../../lib/validation';
import { Spacing } from '../../constants/layout';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setFormError(null);
    setNotice(null);
    const parsed = signUpSchema.safeParse({ full_name: fullName, email, password });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[String(i.path[0])] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    const { data, error } = await signUp(parsed.data);
    setLoading(false);
    if (error) {
      setFormError(error.message);
      return;
    }
    if (!data.session) {
      setNotice('Check your email to confirm your account, then sign in.');
    }
    // If email confirmation is disabled, AuthGate redirects automatically.
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text variant="h1" style={styles.heading}>
            Create your account
          </Text>
          <Text variant="body" color="secondary" style={styles.sub}>
            You can buy, sell, and message — creating a business is optional.
          </Text>

          <Input
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            error={errors.full_name}
            autoCapitalize="words"
            required
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            required
          />

          {formError ? (
            <Text variant="label" color="danger" style={styles.msg}>
              {formError}
            </Text>
          ) : null}
          {notice ? (
            <Text variant="label" color="success" style={styles.msg}>
              {notice}
            </Text>
          ) : null}

          <Button label="Create account" onPress={onSubmit} loading={loading} />

          <View style={styles.links}>
            <Link href="/auth/sign-in">
              <Text variant="label" color="accent">
                Already have an account? Sign in
              </Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.xl, flexGrow: 1, justifyContent: 'center' },
  heading: { marginBottom: Spacing.sm },
  sub: { marginBottom: Spacing.xl },
  msg: { marginBottom: Spacing.md },
  links: { marginTop: Spacing.xl, alignItems: 'center' },
});
