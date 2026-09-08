/**
 * Pasifika Campus — Business management (create / edit / open-close).
 * Creating a business is optional. Owners can toggle OPEN/CLOSED manually and
 * see their approval status. Advanced verification/analytics are out of V1.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, Switch } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusPill } from '../../components/ui/StatusPill';
import { LoadingState } from '../../components/ui/StateView';
import {
  getMine,
  createBusiness,
  updateBusiness,
  setOpen,
} from '../../features/businesses/service';
import { businessSchema } from '../../lib/validation';
import { useAuth } from '../../features/account/AuthProvider';
import type { Business } from '../../types/database';
import { AppConfig } from '../../constants/config';
import { Theme, Palette } from '../../constants/colors';
import { Spacing } from '../../constants/layout';

export default function ManageBusinessScreen() {
  const { session } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [island, setIsland] = useState('');
  const [community, setCommunity] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!session) return;
      const b = await getMine(session.user.id);
      if (b) {
        setBusiness(b);
        setName(b.name);
        setDescription(b.description ?? '');
        setPhone(b.phone ?? '');
        setEmail(b.email ?? '');
        setIsland(b.island ?? '');
        setCommunity(b.community ?? '');
      }
      setLoading(false);
    })();
  }, [session]);

  async function save() {
    if (!session) return;
    setFormError(null);
    const parsed = businessSchema.safeParse({
      name,
      description,
      phone,
      email,
      country: AppConfig.defaultCountry,
      island,
      community,
    });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) fe[String(i.path[0])] = i.message;
      });
      setErrors(fe);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const payload = {
        name: parsed.data.name,
        description: parsed.data.description || null,
        phone: parsed.data.phone || null,
        email: parsed.data.email || null,
        country: parsed.data.country,
        island: parsed.data.island || null,
        community: parsed.data.community || null,
      };
      if (business) {
        const updated = await updateBusiness(business.id, payload);
        setBusiness(updated);
      } else {
        const created = await createBusiness(session.user.id, parsed.data);
        setBusiness(created);
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Could not save business.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleOpen(value: boolean) {
    if (!business) return;
    const updated = await setOpen(business.id, value);
    setBusiness(updated);
  }

  if (loading) return <Screen><LoadingState /></Screen>;

  return (
    <Screen edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="h2" style={styles.title}>
          {business ? 'My business' : 'Create a business'}
        </Text>

        {business ? (
          <Card style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View>
                <Text variant="label" color="muted">
                  Status
                </Text>
                <StatusPill status={business.status} />
              </View>
              <View style={styles.openToggle}>
                <Text variant="label" color={business.is_open ? 'success' : 'muted'}>
                  {business.is_open ? 'OPEN' : 'CLOSED'}
                </Text>
                <Switch
                  value={business.is_open}
                  onValueChange={toggleOpen}
                  trackColor={{ true: Palette.gold, false: Theme.border }}
                  thumbColor={Palette.white}
                  disabled={business.status !== 'approved'}
                />
              </View>
            </View>
            {business.status !== 'approved' ? (
              <Text variant="caption" color="muted" style={{ marginTop: Spacing.sm }}>
                You can set OPEN/CLOSED once your business is approved.
              </Text>
            ) : null}
          </Card>
        ) : null}

        <Input label="Business name" value={name} onChangeText={setName} error={errors.name} required />
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ minHeight: 96, textAlignVertical: 'top' }}
        />
        <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" error={errors.phone} />
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
        <Input label="Island" value={island} onChangeText={setIsland} placeholder="e.g. South Tarawa" />
        <Input label="Community / village" value={community} onChangeText={setCommunity} />

        {formError ? (
          <Text variant="label" color="danger" style={{ marginBottom: Spacing.md }}>
            {formError}
          </Text>
        ) : null}

        {!business ? (
          <Text variant="caption" color="muted" style={styles.notice}>
            New businesses are reviewed before they appear publicly.
          </Text>
        ) : null}
        <Button
          label={business ? 'Save changes' : 'Submit business'}
          onPress={save}
          loading={saving}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg },
  title: { marginBottom: Spacing.lg },
  statusCard: { marginBottom: Spacing.xl },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  openToggle: { alignItems: 'center', gap: 4 },
  notice: { marginBottom: Spacing.md },
});
