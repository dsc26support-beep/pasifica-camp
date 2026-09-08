/**
 * Pasifika Campus — Business page.
 * Logo, name, description, category, location, contact, OPEN/CLOSED status,
 * and its listings, plus Message Business and Report actions.
 */
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusPill } from '../../components/ui/StatusPill';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/StateView';
import { ListingCard } from '../../components/listings/ListingCard';
import { ReportSheet } from '../../components/listings/ReportSheet';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getById, getBusinessListings } from '../../features/businesses/service';
import { startConversation } from '../../features/messaging/service';
import { useAuth } from '../../features/account/AuthProvider';
import { Spacing } from '../../constants/layout';

export default function BusinessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const router = useRouter();
  const [reportOpen, setReportOpen] = useState(false);

  const biz = useAsyncData(() => getById(id!), [id]);
  const listings = useAsyncData(() => getBusinessListings(id!), [id]);

  if (biz.loading) return <Screen><LoadingState /></Screen>;
  if (biz.error || !biz.data)
    return (
      <Screen>
        <ErrorState message={biz.error ?? 'Business not found.'} onRetry={biz.reload} />
      </Screen>
    );

  const b = biz.data;
  const isOwner = session?.user.id === b.owner_id;

  async function messageBusiness() {
    const convId = await startConversation({
      recipientId: b.owner_id,
      businessId: b.id,
    });
    router.push(`/conversation/${convId}`);
  }

  return (
    <Screen edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text variant="h2" style={{ flex: 1 }}>
            {b.name}
          </Text>
          <StatusPill
            status={b.is_open ? 'open' : 'suspended'}
            label={b.is_open ? 'Open now' : 'Closed'}
            tone={b.is_open ? 'positive' : 'danger'}
          />
        </View>

        <Text variant="caption" color="muted">
          {[b.community, b.island, b.country].filter(Boolean).join(', ')}
        </Text>

        {b.description ? (
          <Text variant="body" color="secondary" style={styles.desc}>
            {b.description}
          </Text>
        ) : null}

        <Card style={styles.contact}>
          {b.phone ? <Text variant="body">📞 {b.phone}</Text> : null}
          {b.email ? <Text variant="body">✉ {b.email}</Text> : null}
          {!b.phone && !b.email ? (
            <Text variant="body" color="muted">
              Use Message Business to get in touch.
            </Text>
          ) : null}
        </Card>

        {!isOwner ? (
          <View style={styles.actions}>
            <Button label="Message business" onPress={messageBusiness} />
            <Button
              label="Report"
              variant="danger"
              onPress={() => setReportOpen(true)}
            />
          </View>
        ) : (
          <Button
            label="Manage my business"
            variant="secondary"
            onPress={() => router.push('/business/manage')}
            style={styles.manage}
          />
        )}

        <Text variant="h3" style={styles.listingsTitle}>
          Listings
        </Text>
        {listings.loading ? (
          <LoadingState />
        ) : !listings.data || listings.data.length === 0 ? (
          <EmptyState title="No listings yet" />
        ) : (
          <FlatList
            horizontal
            data={listings.data}
            keyExtractor={(l) => l.id}
            renderItem={({ item }) => <ListingCard listing={item} />}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </ScrollView>

      <ReportSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="business"
        targetId={b.id}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  desc: { marginTop: Spacing.lg, lineHeight: 22 },
  contact: { marginTop: Spacing.xl, gap: 6 },
  actions: { marginTop: Spacing.xl, gap: Spacing.md },
  manage: { marginTop: Spacing.xl },
  listingsTitle: { marginTop: Spacing.xxl, marginBottom: Spacing.md },
});
