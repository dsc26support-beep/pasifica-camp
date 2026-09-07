/**
 * Pasifika Campus — Sign in.
 */
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LogoMark } from '../../components/ui/Logo';
import { signIn } from '../../lib/auth';
import { signInSchema } from '../../lib/validation';
import { Spacing } from '../../constants/layout';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setFormError(null);
    const parsed = signInSchema.safeParse({ email, password });
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
    const { error } = await signIn(parsed.data);
    setLoading(false);
    if (error) setFormError(error.message);
    // On success the AuthGate redirects automatically.
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}>
            <LogoMark size={72} />
            <Text variant="h1" style={styles.heading}>
              Pasifika Campus
            </Text>
            <Text variant="body" color="secondary">
              Find. Discover. Contact.
            </Text>
          </View>

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
            <Text variant="label" color="danger" style={styles.formError}>
              {formError}
            </Text>
          ) : null}

          <Button label="Sign in" onPress={onSubmit} loading={loading} />

          <View style={styles.links}>
            <Link href="/auth/reset-password">
              <Text variant="label" color="accent">
                Forgot password?
              </Text>
            </Link>
            <Link href="/auth/sign-up">
              <Text variant="label" color="accent">
                Create an account
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
  logo: { alignItems: 'center', marginBottom: Spacing.xxl },
  heading: { marginTop: Spacing.md },
  formError: { marginBottom: Spacing.md },
  links: { marginTop: Spacing.xl, flexDirection: 'row', justifyContent: 'space-between' },
});
