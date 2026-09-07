-- =============================================================================
-- Pasifika Campus — V1 Initial Schema
-- Migration: 001_initial_schema.sql
-- =============================================================================
-- A Pacific-focused marketplace & community platform. Launches in Kiribati,
-- with a Country -> Island -> Community geography that is NOT hard-coded to a
-- single country, so future Pacific expansion needs no schema rewrite.
--
-- Notes:
--   * All tables use UUID primary keys.
--   * profiles.id === auth.users.id (1:1 with Supabase Auth).
--   * Ownership columns (owner_id, user_id, sender_id, reporter_id) are used
--     consistently and are the basis for the RLS policies in 002.
--   * Enums model the approved status/type vocabularies from the spec.
-- =============================================================================

create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "pg_trgm";        -- trigram search (title/desc)

-- -----------------------------------------------------------------------------
-- Enumerated types (approved vocabularies)
-- -----------------------------------------------------------------------------
create type user_status        as enum ('active', 'suspended');
create type user_role          as enum ('user', 'admin');
create type business_status    as enum ('pending', 'approved', 'rejected', 'suspended');
-- 'verified' is reserved for a future phase; intentionally not added in V1.

create type category_type      as enum ('product', 'service', 'rental', 'business');

create type listing_type       as enum ('product', 'service', 'rental');
create type listing_status     as enum ('pending', 'approved', 'rejected', 'unavailable', 'removed');
create type price_type         as enum ('fixed', 'negotiable');
create type availability_status as enum ('available', 'unavailable');

create type notification_type  as enum (
  'new_message', 'message_reply', 'listing_approved',
  'listing_rejected', 'admin_announcement'
);

create type tip_status         as enum ('draft', 'published', 'unpublished');

create type report_target      as enum ('listing', 'business', 'user');
create type report_reason      as enum (
  'scam', 'incorrect_information', 'prohibited_item',
  'duplicate', 'offensive_content', 'other'
);
create type report_status      as enum ('open', 'reviewing', 'resolved', 'dismissed');

-- -----------------------------------------------------------------------------
-- updated_at helper (shared trigger function)
-- -----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles  (1:1 with auth.users)
-- -----------------------------------------------------------------------------
create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null check (char_length(full_name) between 1 and 120),
  phone       text,
  email       text,
  avatar_url  text,
  country     text not null default 'Kiribati',
  island      text,
  community   text,
  role        user_role   not null default 'user',
  status      user_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_profiles_updated
  before update on profiles
  for each row execute function set_updated_at();

-- Auto-create a profile row whenever a new auth user is created.
-- full_name / country are read from the sign-up metadata when supplied.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, country)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'New User'),
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'country', ''), 'Kiribati')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Convenience helper used throughout RLS: is the caller an admin?
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

-- -----------------------------------------------------------------------------
-- categories  (admin-managed, supports sub-categories via parent_id)
-- -----------------------------------------------------------------------------
create table categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 80),
  type        category_type not null,
  icon        text,
  parent_id   uuid references categories (id) on delete set null,
  sort_order  integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create index idx_categories_type   on categories (type) where active;
create index idx_categories_parent on categories (parent_id);

-- -----------------------------------------------------------------------------
-- businesses
-- -----------------------------------------------------------------------------
create table businesses (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references profiles (id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 120),
  description   text,
  category_id   uuid references categories (id) on delete set null,
  logo_url      text,
  phone         text,
  email         text,
  country       text not null default 'Kiribati',
  island        text,
  community     text,
  latitude      double precision,
  longitude     double precision,
  opening_hours jsonb,               -- flexible; no automated open/close logic in V1
  is_open       boolean not null default false,
  status        business_status not null default 'pending',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger trg_businesses_updated
  before update on businesses
  for each row execute function set_updated_at();

create index idx_businesses_owner  on businesses (owner_id);
create index idx_businesses_status on businesses (status);
create index idx_businesses_geo    on businesses (country, island, community);

-- -----------------------------------------------------------------------------
-- listings  (universal: product | service | rental)
-- -----------------------------------------------------------------------------
create table listings (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references profiles (id) on delete cascade,
  business_id         uuid references businesses (id) on delete set null,
  category_id         uuid references categories (id) on delete set null,
  listing_type        listing_type not null,
  title               text not null check (char_length(title) between 1 and 140),
  description         text,
  price               numeric(12,2) check (price is null or price >= 0),
  price_type          price_type not null default 'fixed',
  -- Optional product-only attributes (kept nullable to avoid large forms):
  condition           text,
  brand               text,
  quantity            integer check (quantity is null or quantity >= 0),
  country             text not null default 'Kiribati',
  island              text,
  community           text,
  latitude            double precision,
  longitude           double precision,
  availability_status availability_status not null default 'available',
  status              listing_status not null default 'pending',
  rejection_reason    text,
  is_featured         boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger trg_listings_updated
  before update on listings
  for each row execute function set_updated_at();

create index idx_listings_owner    on listings (owner_id);
create index idx_listings_business on listings (business_id);
create index idx_listings_category on listings (category_id);
create index idx_listings_status   on listings (status);
create index idx_listings_type     on listings (listing_type);
create index idx_listings_geo      on listings (country, island, community);
create index idx_listings_featured on listings (is_featured) where is_featured;
create index idx_listings_created  on listings (created_at desc);
-- Trigram indexes power the PostgreSQL keyword search used in V1.
create index idx_listings_title_trgm on listings using gin (title gin_trgm_ops);
create index idx_listings_desc_trgm  on listings using gin (description gin_trgm_ops);

-- -----------------------------------------------------------------------------
-- listing_images  (default max 5 per listing — limit enforced in app layer,
--                  configurable via constants; DB keeps display ordering)
-- -----------------------------------------------------------------------------
create table listing_images (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid not null references listings (id) on delete cascade,
  storage_path  text not null,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

create index idx_listing_images_listing on listing_images (listing_id, display_order);

-- -----------------------------------------------------------------------------
-- favourites  (no duplicate favourites per user+listing)
-- -----------------------------------------------------------------------------
create table favourites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles (id) on delete cascade,
  listing_id  uuid not null references listings (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index idx_favourites_user on favourites (user_id);

-- -----------------------------------------------------------------------------
-- cart_items  (lightweight cart — no payments/checkout in V1)
-- -----------------------------------------------------------------------------
create table cart_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles (id) on delete cascade,
  listing_id  uuid not null references listings (id) on delete cascade,
  quantity    integer not null default 1 check (quantity between 1 and 999),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, listing_id)
);

create trigger trg_cart_items_updated
  before update on cart_items
  for each row execute function set_updated_at();

create index idx_cart_items_user on cart_items (user_id);

-- -----------------------------------------------------------------------------
-- Messaging: conversations / conversation_members / messages
-- -----------------------------------------------------------------------------
create table conversations (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid references listings (id) on delete set null,
  business_id uuid references businesses (id) on delete set null,
  created_by  uuid not null references profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_conversations_updated
  before update on conversations
  for each row execute function set_updated_at();

create table conversation_members (
  conversation_id uuid not null references conversations (id) on delete cascade,
  user_id         uuid not null references profiles (id) on delete cascade,
  last_read_at    timestamptz,
  created_at      timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index idx_conv_members_user on conversation_members (user_id);

create table messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references conversations (id) on delete cascade,
  sender_id        uuid not null references profiles (id) on delete cascade,
  listing_id       uuid references listings (id) on delete set null,
  message          text not null check (char_length(message) between 1 and 4000),
  read_at          timestamptz,
  deleted_at       timestamptz,
  created_at       timestamptz not null default now()
);

create index idx_messages_conversation on messages (conversation_id, created_at);
create index idx_messages_sender       on messages (sender_id);

-- Bump the parent conversation's updated_at on each new message so
-- conversation lists can be ordered by most-recent activity.
create or replace function touch_conversation()
returns trigger
language plpgsql
as $$
begin
  update conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$;

create trigger trg_messages_touch_conversation
  after insert on messages
  for each row execute function touch_conversation();

-- Helper used by RLS: is the caller a member of this conversation?
create or replace function is_conversation_member(conv_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = conv_id and user_id = auth.uid()
  );
$$;

-- -----------------------------------------------------------------------------
-- notifications
-- -----------------------------------------------------------------------------
create table notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles (id) on delete cascade,
  type          notification_type not null,
  title         text not null,
  body          text,
  reference_id  uuid,              -- e.g. listing id / conversation id / tip id
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);

create index idx_notifications_user on notifications (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- tips  (admin-controlled promotional / informational content)
-- -----------------------------------------------------------------------------
create table tips (
  id            uuid primary key default gen_random_uuid(),
  title         text not null check (char_length(title) between 1 and 140),
  description   text,
  image_url     text,
  category      text,
  link_url      text,
  status        tip_status not null default 'draft',
  published_at  timestamptz,
  expires_at    timestamptz,
  created_by    uuid references profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger trg_tips_updated
  before update on tips
  for each row execute function set_updated_at();

create index idx_tips_status on tips (status, published_at desc);

-- -----------------------------------------------------------------------------
-- reports
-- -----------------------------------------------------------------------------
create table reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references profiles (id) on delete cascade,
  target_type  report_target not null,
  target_id    uuid not null,
  reason       report_reason not null,
  description  text,
  status       report_status not null default 'open',
  admin_note   text,
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz
);

create index idx_reports_status on reports (status, created_at desc);
create index idx_reports_target on reports (target_type, target_id);
