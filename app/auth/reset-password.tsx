/**
 * Pasifika Campus — Password reset request.
 */
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { resetPassword } from '../../lib/auth';
import { emailSchema } from '../../lib/validation';
import { Spacing } from '../../constants/layout';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Enter a valid email');
      return;
    }
    setError(null);
    setLoading(true);
    const { error: err } = await resetPassword(parsed.data);
    setLoading(false);
    if (err) setError(err.message);
    else setSent(true);
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="h1" style={styles.heading}>
          Reset password
        </Text>
        {sent ? (
          <Text variant="body" color="success">
            If an account exists for {email}, a reset link is on its way.
          </Text>
        ) : (
          <>
            <Text variant="body" color="secondary" style={styles.sub}>
              Enter your email and we'll send you a reset link.
            </Text>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              error={error}
              autoCapitalize="none"
              keyboardType="email-address"
              required
            />
            <Button label="Send reset link" onPress={onSubmit} loading={loading} />
          </>
        )}
        <View style={styles.links}>
          <Link href="/auth/sign-in">
            <Text variant="label" color="accent">
              Back to sign in
            </Text>
          </Link>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.xl, flexGrow: 1, justifyContent: 'center' },
  heading: { marginBottom: Spacing.sm },
  sub: { marginBottom: Spacing.xl },
  links: { marginTop: Spacing.xl, alignItems: 'center' },
});
