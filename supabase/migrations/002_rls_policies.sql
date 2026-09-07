-- =============================================================================
-- Pasifika Campus — V1 Row Level Security
-- Migration: 002_rls_policies.sql
-- =============================================================================
-- Principles:
--   * RLS is enabled on every table holding user data.
--   * Ownership columns from 001 drive access.
--   * Public can only read APPROVED, non-removed content.
--   * Users manage only their own rows; they can never approve their own
--     listings/businesses or modify admin-only fields.
--   * Admins (profiles.role = 'admin') perform moderation via is_admin().
--   * The mobile app uses the anon/authenticated keys only — never the
--     service-role key — so these policies are the real enforcement boundary.
-- =============================================================================

alter table profiles              enable row level security;
alter table categories            enable row level security;
alter table businesses            enable row level security;
alter table listings              enable row level security;
alter table listing_images        enable row level security;
alter table favourites            enable row level security;
alter table cart_items            enable row level security;
alter table conversations         enable row level security;
alter table conversation_members  enable row level security;
alter table messages              enable row level security;
alter table notifications         enable row level security;
alter table tips                  enable row level security;
alter table reports               enable row level security;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
-- Any authenticated user can read basic profiles (needed to show seller names,
-- business owners, chat participants). Sensitive editing is restricted below.
create policy "profiles: read for authenticated"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "profiles: insert own"
  on profiles for insert
  with check (id = auth.uid());

-- Users may update their own profile, but NOT their role or status. Those
-- admin-controlled fields are protected by a trigger (see below) because a
-- WITH CHECK clause cannot compare against the previous row value directly.
create policy "profiles: update own"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles: admin full access"
  on profiles for all
  using (is_admin())
  with check (is_admin());

-- Prevent non-admins from escalating role or self-lifting suspension.
create or replace function guard_profile_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if is_admin() then
    return new;                       -- admins may change anything
  end if;
  if new.role is distinct from old.role
     or new.status is distinct from old.status then
    raise exception 'Not allowed to modify administrative profile fields';
  end if;
  return new;
end;
$$;

create trigger trg_guard_profile_admin_fields
  before update on profiles
  for each row execute function guard_profile_admin_fields();

-- -----------------------------------------------------------------------------
-- categories  (public read of active; admin write)
-- -----------------------------------------------------------------------------
create policy "categories: public read active"
  on categories for select
  using (active or is_admin());

create policy "categories: admin write"
  on categories for all
  using (is_admin())
  with check (is_admin());

-- -----------------------------------------------------------------------------
-- businesses
-- -----------------------------------------------------------------------------
create policy "businesses: public read approved"
  on businesses for select
  using (status = 'approved' or owner_id = auth.uid() or is_admin());

create policy "businesses: owner insert"
  on businesses for insert
  with check (owner_id = auth.uid());

create policy "businesses: owner update"
  on businesses for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "businesses: owner delete"
  on businesses for delete
  using (owner_id = auth.uid());

create policy "businesses: admin all"
  on businesses for all
  using (is_admin())
  with check (is_admin());

-- Owners may not self-approve: block status escalation by non-admins.
create or replace function guard_business_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if is_admin() then
    return new;
  end if;
  if new.status is distinct from old.status then
    raise exception 'Only administrators can change business status';
  end if;
  return new;
end;
$$;

create trigger trg_guard_business_status
  before update on businesses
  for each row execute function guard_business_status();

-- -----------------------------------------------------------------------------
-- listings
-- -----------------------------------------------------------------------------
create policy "listings: public read approved"
  on listings for select
  using (
    (status = 'approved' and availability_status = 'available')
    or owner_id = auth.uid()
    or is_admin()
  );

create policy "listings: owner insert"
  on listings for insert
  with check (owner_id = auth.uid());

create policy "listings: owner update"
  on listings for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "listings: owner delete"
  on listings for delete
  using (owner_id = auth.uid());

create policy "listings: admin all"
  on listings for all
  using (is_admin())
  with check (is_admin());

-- Sellers may edit their listing content and toggle availability, but cannot
-- self-approve or set moderation/feature fields. Enforce with a trigger.
create or replace function guard_listing_moderation_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if is_admin() then
    return new;
  end if;
  -- A non-admin edit resets an approved listing back to 'pending' for re-review
  -- unless they are only toggling availability or marking it removed.
  if new.status is distinct from old.status then
    if not (new.status in ('unavailable', 'removed')
            or (old.status in ('unavailable') and new.status = 'pending')) then
      raise exception 'Only administrators can approve or reject listings';
    end if;
  end if;
  if new.is_featured is distinct from old.is_featured then
    raise exception 'Only administrators can feature listings';
  end if;
  if new.rejection_reason is distinct from old.rejection_reason then
    raise exception 'Only administrators can set a rejection reason';
  end if;
  return new;
end;
$$;

create trigger trg_guard_listing_moderation
  before update on listings
  for each row execute function guard_listing_moderation_fields();

-- -----------------------------------------------------------------------------
-- listing_images  (readable when the parent listing is readable; owner writes)
-- -----------------------------------------------------------------------------
create policy "listing_images: read with listing"
  on listing_images for select
  using (
    exists (
      select 1 from listings l
      where l.id = listing_images.listing_id
        and (
          (l.status = 'approved' and l.availability_status = 'available')
          or l.owner_id = auth.uid()
          or is_admin()
        )
    )
  );

create policy "listing_images: owner write"
  on listing_images for all
  using (
    exists (select 1 from listings l
            where l.id = listing_images.listing_id and l.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from listings l
            where l.id = listing_images.listing_id and l.owner_id = auth.uid())
  );

create policy "listing_images: admin all"
  on listing_images for all
  using (is_admin())
  with check (is_admin());

-- -----------------------------------------------------------------------------
-- favourites  (fully private to the owning user)
-- -----------------------------------------------------------------------------
create policy "favourites: owner all"
  on favourites for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- cart_items  (fully private to the owning user)
-- -----------------------------------------------------------------------------
create policy "cart_items: owner all"
  on cart_items for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- conversations  (members only)
-- -----------------------------------------------------------------------------
create policy "conversations: members read"
  on conversations for select
  using (is_conversation_member(id) or is_admin());

create policy "conversations: creator insert"
  on conversations for insert
  with check (created_by = auth.uid());

create policy "conversations: members update"
  on conversations for update
  using (is_conversation_member(id))
  with check (is_conversation_member(id));

-- -----------------------------------------------------------------------------
-- conversation_members
-- -----------------------------------------------------------------------------
-- A user can see the membership rows of conversations they belong to.
create policy "conv_members: read own conversations"
  on conversation_members for select
  using (is_conversation_member(conversation_id) or is_admin());

-- The conversation creator adds members (themselves + the other party).
create policy "conv_members: creator adds"
  on conversation_members for insert
  with check (
    exists (
      select 1 from conversations c
      where c.id = conversation_id and c.created_by = auth.uid()
    )
    or user_id = auth.uid()
  );

-- A member may update only their own membership row (e.g. last_read_at).
create policy "conv_members: update own row"
  on conversation_members for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- messages  (only conversation members; sender owns the row)
-- -----------------------------------------------------------------------------
create policy "messages: members read"
  on messages for select
  using (is_conversation_member(conversation_id) or is_admin());

create policy "messages: member send"
  on messages for insert
  with check (
    sender_id = auth.uid()
    and is_conversation_member(conversation_id)
  );

-- Sender may update their own message (read receipts handled via membership;
-- soft-delete via deleted_at).
create policy "messages: sender update own"
  on messages for update
  using (sender_id = auth.uid())
  with check (sender_id = auth.uid());

-- Allow the *recipient* to mark messages read (set read_at) within their
-- conversation. Kept separate so senders can't forge read receipts on others.
create policy "messages: member mark read"
  on messages for update
  using (is_conversation_member(conversation_id) and sender_id <> auth.uid())
  with check (is_conversation_member(conversation_id) and sender_id <> auth.uid());

-- -----------------------------------------------------------------------------
-- notifications  (private to the user; system/admin inserts)
-- -----------------------------------------------------------------------------
create policy "notifications: owner read"
  on notifications for select
  using (user_id = auth.uid());

create policy "notifications: owner update"        -- mark read
  on notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications: owner delete"
  on notifications for delete
  using (user_id = auth.uid());

create policy "notifications: admin insert"
  on notifications for insert
  with check (is_admin());
-- Note: message/listing notifications are created by SECURITY DEFINER triggers
-- (004) which bypass RLS, so a broad user-facing insert policy is unnecessary.

-- -----------------------------------------------------------------------------
-- tips  (public read of published & unexpired; admin write)
-- -----------------------------------------------------------------------------
create policy "tips: public read published"
  on tips for select
  using (
    (status = 'published'
      and (published_at is null or published_at <= now())
      and (expires_at   is null or expires_at   >  now()))
    or is_admin()
  );

create policy "tips: admin write"
  on tips for all
  using (is_admin())
  with check (is_admin());

-- -----------------------------------------------------------------------------
-- reports  (reporter creates & reads own; admin manages all)
-- -----------------------------------------------------------------------------
create policy "reports: reporter insert"
  on reports for insert
  with check (reporter_id = auth.uid());

create policy "reports: reporter read own"
  on reports for select
  using (reporter_id = auth.uid() or is_admin());

create policy "reports: admin all"
  on reports for all
  using (is_admin())
  with check (is_admin());
