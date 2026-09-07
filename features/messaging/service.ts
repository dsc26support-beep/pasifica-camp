/**
 * Pasifika Campus — Messaging data service (Supabase Realtime).
 * Customer <-> Seller and Customer <-> Business. A message may reference a
 * listing. Conversations/members/messages are all RLS-protected so private
 * conversations stay private (spec §34–35).
 */
import { supabase } from '../../lib/supabase';
import type { Message } from '../../types/database';

export interface ConversationSummary {
  id: string;
  listing_id: string | null;
  updated_at: string;
  last_message: string | null;
  other_member_name: string | null;
}

/** Create-or-reuse a 1:1 conversation with a seller/business via RPC. */
export async function startConversation(params: {
  recipientId: string;
  listingId?: string | null;
  businessId?: string | null;
}): Promise<string> {
  const { data, error } = await supabase.rpc('start_conversation', {
    p_recipient_id: params.recipientId,
    p_listing_id: params.listingId ?? null,
    p_business_id: params.businessId ?? null,
  });
  if (error) throw error;
  return data as string;
}

export async function listConversations(userId: string) {
  // Membership rows for the current user, with the conversation + latest message.
  const { data, error } = await supabase
    .from('conversation_members')
    .select(
      'conversation:conversations ( id, listing_id, business_id, updated_at )'
    )
    .eq('user_id', userId);
  if (error) throw error;
  const convos = (data ?? [])
    .map(
      (r) =>
        (r as unknown as { conversation: { id: string; updated_at: string } | null })
          .conversation
    )
    .filter((c): c is { id: string; updated_at: string } => !!c)
    .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
  return convos;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(params: {
  conversationId: string;
  senderId: string;
  text: string;
  listingId?: string | null;
}) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: params.conversationId,
      sender_id: params.senderId,
      message: params.text,
      listing_id: params.listingId ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Message;
}

/** Mark my membership as read (updates unread state). */
export async function markRead(conversationId: string, userId: string) {
  await supabase
    .from('conversation_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);
}

/**
 * Subscribe to new messages in a conversation via Supabase Realtime.
 * Returns an unsubscribe function.
 */
export function subscribeToMessages(
  conversationId: string,
  onInsert: (m: Message) => void
): () => void {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onInsert(payload.new as Message)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
