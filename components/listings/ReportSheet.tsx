/**
 * Pasifika Campus — Report modal.
 * Lets a user report a listing/business/user with a reason + optional detail.
 */
import React, { useState } from 'react';
import { Modal, View, Pressable, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { createReport } from '../../features/reports/service';
import { useAuth } from '../../features/account/AuthProvider';
import type { ReportReason, ReportTarget } from '../../types/database';
import { Theme } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/layout';

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'scam', label: 'Scam' },
  { value: 'incorrect_information', label: 'Incorrect information' },
  { value: 'prohibited_item', label: 'Prohibited item' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'offensive_content', label: 'Offensive content' },
  { value: 'other', label: 'Other' },
];

export function ReportSheet({
  visible,
  onClose,
  targetType,
  targetId,
}: {
  visible: boolean;
  onClose: () => void;
  targetType: ReportTarget;
  targetId: string;
}) {
  const { session } = useAuth();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!session || !reason) return;
    setLoading(true);
    try {
      await createReport(session.user.id, {
        target_type: targetType,
        target_id: targetId,
        reason,
        description,
      });
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setReason(null);
    setDescription('');
    setDone(false);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {done ? (
            <>
              <Text variant="h3">Thank you</Text>
              <Text variant="body" color="secondary" style={{ marginVertical: Spacing.md }}>
                Our team will review this report.
              </Text>
              <Button label="Close" onPress={close} />
            </>
          ) : (
            <>
              <Text variant="h3">Report</Text>
              <View style={styles.reasons}>
                {REASONS.map((r) => (
                  <Pressable
                    key={r.value}
                    onPress={() => setReason(r.value)}
                    style={[styles.chip, reason === r.value && styles.chipActive]}
                  >
                    <Text variant="label" color={reason === r.value ? 'onGold' : 'primary'}>
                      {r.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Input
                label="Details (optional)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
              <Button label="Submit report" onPress={submit} loading={loading} disabled={!reason} />
              <Pressable onPress={close} style={styles.cancel}>
                <Text variant="label" color="muted">
                  Cancel
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Theme.surface,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.xl,
  },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginVertical: Spacing.lg },
  chip: {
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: 999,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  chipActive: { backgroundColor: Theme.accent, borderColor: Theme.accent },
  cancel: { alignItems: 'center', paddingVertical: Spacing.md },
});
