/**
 * Pasifika Campus — Admin dashboard.
 * Access is gated here by role AND enforced by RLS on every query. Functional,
 * not decorative: stats, pending-listing moderation, and open reports. Uses the
 * Pasifika Campus brand identity while staying clearly usable.
 */
import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatusPill } from '../../components/ui/StatusPill';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/StateView';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useAuth } from '../../features/account/AuthProvider';
import {
  getStats,
  pendingListings,
  approveListing,
  rejectListing,
  openReports,
  resolveReport,
} from '../../features/admin/service';
import { statusLabel } from '../../utils/format';
import { Theme } from '../../constants/colors';
import { Spacing } from '../../constants/layout';

export default function AdminScreen() {
  const { isAdmin } = useAuth();
  const stats = useAsyncData(() => getStats(), []);
  const pending = useAsyncData(() => pendingListings(), []);
  const reports = useAsyncData(() => openReports(), []);
  const [rejectText, setRejectText] = useState<Record<string, string>>({});

  if (!isAdmin) {
    return (
      <Screen>
        <EmptyState
          title="Admins only"
          message="You don't have access to the admin dashboard."
        />
      </Screen>
    );
  }

  async function approve(id: string) {
    await approveListing(id);
    pending.reload();
    stats.reload();
  }
  async function reject(id: string) {
    await rejectListing(id, rejectText[id]?.trim() || 'Does not meet listing guidelines.');
    pending.reload();
    stats.reload();
  }
  async function resolve(id: string, dismiss: boolean) {
    await resolveReport(id, dismiss ? 'Dismissed by admin.' : 'Resolved by admin.', dismiss);
    reports.reload();
    stats.reload();
  }

  return (
    <Screen edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="h2" style={styles.title}>
          Admin
        </Text>

        {/* Stats */}
        {stats.loading ? (
          <LoadingState />
        ) : stats.error ? (
          <ErrorState message={stats.error} onRetry={stats.reload} />
        ) : stats.data ? (
          <View style={styles.statsGrid}>
            <Stat label="Users" value={stats.data.total_users} />
            <Stat label="Active businesses" value={stats.data.active_businesses} />
            <Stat label="Active listings" value={stats.data.active_listings} />
            <Stat label="Pending listings" value={stats.data.pending_listings} />
            <Stat label="Open reports" value={stats.data.open_reports} />
          </View>
        ) : null}

        {/* Pending listings */}
        <Text variant="h3" style={styles.section}>
          Pending listings
        </Text>
        {pending.loading ? (
          <LoadingState />
        ) : !pending.data || pending.data.length === 0 ? (
          <EmptyState title="Nothing pending" />
        ) : (
          pending.data.map((l) => (
            <Card key={l.id} style={styles.item}>
              <Text variant="title" numberOfLines={1}>
                {l.title}
              </Text>
              <Text variant="caption" color="muted">
                {l.listing_type} · {[l.community, l.island].filter(Boolean).join(', ')}
              </Text>
              {l.description ? (
                <Text variant="body" color="secondary" numberOfLines={3} style={{ marginTop: 4 }}>
                  {l.description}
                </Text>
              ) : null}
              <Input
                label="Rejection reason (optional)"
                value={rejectText[l.id] ?? ''}
                onChangeText={(t) => setRejectText((s) => ({ ...s, [l.id]: t }))}
                style={{ marginTop: Spacing.md }}
              />
              <View style={styles.actions}>
                <Button label="Approve" onPress={() => approve(l.id)} style={{ flex: 1 }} />
                <Button
                  label="Reject"
                  variant="danger"
                  onPress={() => reject(l.id)}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          ))
        )}

        {/* Open reports */}
        <Text variant="h3" style={styles.section}>
          Open reports
        </Text>
        {reports.loading ? (
          <LoadingState />
        ) : !reports.data || reports.data.length === 0 ? (
          <EmptyState title="No open reports" />
        ) : (
          reports.data.map((r) => (
            <Card key={r.id} style={styles.item}>
              <View style={styles.reportHead}>
                <Text variant="title">{statusLabel(r.reason)}</Text>
                <StatusPill status={r.status} />
              </View>
              <Text variant="caption" color="muted">
                {r.target_type} · {r.target_id.slice(0, 8)}…
              </Text>
              {r.description ? (
                <Text variant="body" color="secondary" style={{ marginTop: 4 }}>
                  {r.description}
                </Text>
              ) : null}
              <View style={styles.actions}>
                <Button label="Resolve" onPress={() => resolve(r.id, false)} style={{ flex: 1 }} />
                <Button
                  label="Dismiss"
                  variant="secondary"
                  onPress={() => resolve(r.id, true)}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card style={styles.stat} padded>
      <Text variant="h2" color="accent">
        {value}
      </Text>
      <Text variant="caption" color="secondary">
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg },
  title: { marginBottom: Spacing.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  stat: { minWidth: '30%', flexGrow: 1 },
  section: { marginTop: Spacing.xxl, marginBottom: Spacing.md },
  item: { marginBottom: Spacing.md },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  reportHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
