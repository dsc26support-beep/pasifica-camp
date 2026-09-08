/**
 * Pasifika Campus — Conversation (realtime chat).
 * New messages appear without manual refresh via Supabase Realtime. Marks the
 * conversation read on open. RLS keeps private conversations private.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/StateView';
import {
  getMessages,
  sendMessage,
  subscribeToMessages,
  markRead,
} from '../../features/messaging/service';
import { useAuth } from '../../features/account/AuthProvider';
import type { Message } from '../../types/database';
import { Theme } from '../../constants/colors';
import { Radius, Spacing } from '../../constants/layout';
import { FontFamily, FontSize } from '../../constants/typography';
import { timeAgo } from '../../utils/format';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      try {
        const initial = await getMessages(id!);
        setMessages(initial);
        if (session) await markRead(id!, session.user.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load messages.');
      } finally {
        setLoading(false);
      }
      unsub = subscribeToMessages(id!, (m) => {
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      });
    })();
    return () => unsub();
  }, [id, session]);

  async function send() {
    if (!session || !text.trim()) return;
    const body = text.trim();
    setText('');
    setSending(true);
    try {
      const msg = await sendMessage({
        conversationId: id!,
        senderId: session.user.id,
        text: body,
      });
      setMessages((prev) => (prev.some((x) => x.id === msg.id) ? prev : [...prev, msg]));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Message failed to send.');
      setText(body);
    } finally {
      setSending(false);
    }
  }

  if (loading) return <Screen><LoadingState /></Screen>;
  if (error && messages.length === 0)
    return (
      <Screen>
        <ErrorState message={error} />
      </Screen>
    );

  return (
    <Screen edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {messages.length === 0 ? (
          <EmptyState title="Say hello" message="Send the first message to start the conversation." />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => {
              const mine = item.sender_id === session?.user.id;
              return (
                <View style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowTheirs]}>
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                    <Text variant="body" color={mine ? 'onGold' : 'primary'}>
                      {item.message}
                    </Text>
                    <Text variant="caption" color={mine ? 'onGold' : 'muted'} style={styles.time}>
                      {timeAgo(item.created_at)}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        <View style={styles.inputBar}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message…"
            placeholderTextColor={Theme.textMuted}
            style={styles.input}
            multiline
          />
          <Pressable
            onPress={send}
            disabled={sending || !text.trim()}
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendDisabled]}
            accessibilityLabel="Send message"
          >
            <Text variant="bodyMedium" color="onGold">
              Send
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.lg },
  bubbleRow: { marginBottom: Spacing.md, flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: Radius.md, padding: Spacing.md },
  bubbleMine: { backgroundColor: Theme.accent, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: Theme.surface, borderBottomLeftRadius: 4 },
  time: { marginTop: 4, alignSelf: 'flex-end' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.border,
    gap: Spacing.sm,
    backgroundColor: Theme.background,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: Theme.inputBackground,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Theme.border,
    color: Theme.textPrimary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
  },
  sendBtn: {
    backgroundColor: Theme.accent,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.5 },
});
