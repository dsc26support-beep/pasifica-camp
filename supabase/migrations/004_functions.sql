-- =============================================================================
-- Pasifika Campus — V1 Functions (search, notifications, moderation helpers)
-- Migration: 004_functions.sql
-- =============================================================================
-- The search_listings() RPC is intentionally the single search entry point.
-- V1 implements it with PostgreSQL (ILIKE + trigram). A future dedicated search
-- engine can replace the *body* of this function without any UI change, because
-- the app only ever calls this stable signature.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- search_listings — keyword + filter search over approved listings
-- -----------------------------------------------------------------------------
-- Covers: listing title, description, business name, category name, location.
-- All filters are optional (pass null to skip). Results are paginated.
create or replace function search_listings(
  p_query        text            default null,
  p_listing_type listing_type    default null,
  p_category_id  uuid            default null,
  p_country      text            default null,
  p_island       text            default null,
  p_community    text            default null,
  p_price_min    numeric         default null,
  p_price_max    numeric         default null,
  p_price_type   price_type      default null,
  p_available    boolean         default null,
  p_limit        integer         default 20,
  p_offset       integer         default 0
)
returns setof listings
language sql
stable
as $$
  select l.*
  from listings l
  left join businesses b on b.id = l.business_id
  left join categories c on c.id = l.category_id
  where l.status = 'approved'
    and (p_available is null
         or (p_available and l.availability_status = 'available')
         or (not p_available))
    and (p_listing_type is null or l.listing_type = p_listing_type)
    and (p_category_id  is null or l.category_id  = p_category_id)
    and (p_country   is null or l.country   = p_country)
    and (p_island    is null or l.island    = p_island)
    and (p_community is null or l.community = p_community)
    and (p_price_type is null or l.price_type = p_price_type)
    and (p_price_min  is null or l.price >= p_price_min)
    and (p_price_max  is null or l.price <= p_price_max)
    and (
      p_query is null
      or l.title       ilike '%' || p_query || '%'
      or l.description ilike '%' || p_query || '%'
      or b.name        ilike '%' || p_query || '%'
      or c.name        ilike '%' || p_query || '%'
      or l.community   ilike '%' || p_query || '%'
      or l.island      ilike '%' || p_query || '%'
    )
  order by l.is_featured desc, l.created_at desc
  limit greatest(1, least(coalesce(p_limit, 20), 50))
  offset greatest(0, coalesce(p_offset, 0));
$$;

-- -----------------------------------------------------------------------------
-- Messaging notification trigger
-- -----------------------------------------------------------------------------
-- On a new message, notify every OTHER member of the conversation. Runs as
-- SECURITY DEFINER so it can insert notifications for recipients (bypassing the
-- admin-only insert policy). A reply (conversation already had messages) is
-- typed 'message_reply', the first message is 'new_message'.
create or replace function notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_reply boolean;
  v_sender   text;
begin
  select count(*) > 1
    into v_is_reply
  from messages
  where conversation_id = new.conversation_id;

  select full_name into v_sender from profiles where id = new.sender_id;

  insert into notifications (user_id, type, title, body, reference_id)
  select cm.user_id,
         case when v_is_reply then 'message_reply'::notification_type
              else 'new_message'::notification_type end,
         coalesce(v_sender, 'Someone') || ' sent you a message',
         left(new.message, 140),
         new.conversation_id
  from conversation_members cm
  where cm.conversation_id = new.conversation_id
    and cm.user_id <> new.sender_id;

  return new;
end;
$$;

create trigger trg_notify_new_message
  after insert on messages
  for each row execute function notify_new_message();

-- -----------------------------------------------------------------------------
-- Listing moderation notification trigger
-- -----------------------------------------------------------------------------
-- When an admin approves/rejects a listing, notify the owner.
create or replace function notify_listing_moderation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if new.status = 'approved' then
    insert into notifications (user_id, type, title, body, reference_id)
    values (new.owner_id, 'listing_approved',
            'Your listing was approved',
            'Your listing "' || new.title || '" is now live.',
            new.id);
  elsif new.status = 'rejected' then
    insert into notifications (user_id, type, title, body, reference_id)
    values (new.owner_id, 'listing_rejected',
            'Your listing needs changes',
            coalesce(new.rejection_reason,
                     'Your listing "' || new.title || '" was not approved.'),
            new.id);
  end if;

  return new;
end;
$$;

create trigger trg_notify_listing_moderation
  after update of status on listings
  for each row execute function notify_listing_moderation();

-- -----------------------------------------------------------------------------
-- start_conversation — create-or-reuse a 1:1 conversation with a seller/business
-- -----------------------------------------------------------------------------
-- Returns the conversation id. Reuses an existing conversation between the two
-- users for the same listing when one already exists. SECURITY DEFINER so it can
-- add the counterparty as a member in a single authorized step.
create or replace function start_conversation(
  p_recipient_id uuid,
  p_listing_id   uuid default null,
  p_business_id  uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me   uuid := auth.uid();
  v_conv uuid;
begin
  if v_me is null then
    raise exception 'Not authenticated';
  end if;
  if p_recipient_id = v_me then
    raise exception 'Cannot start a conversation with yourself';
  end if;

  -- Reuse an existing conversation that has exactly these two members and the
  -- same listing context (null-safe).
  select c.id into v_conv
  from conversations c
  where coalesce(c.listing_id::text,'') = coalesce(p_listing_id::text,'')
    and exists (select 1 from conversation_members m
                where m.conversation_id = c.id and m.user_id = v_me)
    and exists (select 1 from conversation_members m
                where m.conversation_id = c.id and m.user_id = p_recipient_id)
  limit 1;

  if v_conv is not null then
    return v_conv;
  end if;

  insert into conversations (listing_id, business_id, created_by)
  values (p_listing_id, p_business_id, v_me)
  returning id into v_conv;

  insert into conversation_members (conversation_id, user_id)
  values (v_conv, v_me), (v_conv, p_recipient_id);

  return v_conv;
end;
$$;

-- -----------------------------------------------------------------------------
-- admin_dashboard_stats — counts for the admin dashboard
-- -----------------------------------------------------------------------------
create or replace function admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v jsonb;
begin
  if not is_admin() then
    raise exception 'Not authorized';
  end if;

  select jsonb_build_object(
    'total_users',       (select count(*) from profiles),
    'active_businesses', (select count(*) from businesses where status = 'approved'),
    'active_listings',   (select count(*) from listings   where status = 'approved'),
    'pending_listings',  (select count(*) from listings   where status = 'pending'),
    'open_reports',      (select count(*) from reports     where status = 'open')
  ) into v;

  return v;
end;
$$;
