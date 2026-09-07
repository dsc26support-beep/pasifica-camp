-- =============================================================================
-- Pasifika Campus — V1 DEVELOPMENT SEED DATA  (DEMO ONLY — DO NOT RUN IN PROD)
-- =============================================================================
-- This file inserts example categories, tips, and (optionally) demo listings.
--
-- SAFETY:
--   * Categories are safe reference data and are always seeded.
--   * Demo businesses/listings/users are guarded behind a DO block that only
--     runs when a demo auth user already exists, so you never accidentally
--     insert fake production sellers. To load demo listings, first create a
--     test user in Supabase Auth, then set the email below.
--   * Every demo row is tagged with a '[DEMO]' marker in a text field so it is
--     trivially identifiable and removable.
--
-- Usage (local/dev only):
--   supabase db reset            # runs migrations + this seed
--   -- or --
--   psql "$DATABASE_URL" -f supabase/seed/seed.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Categories (reference data — safe for any environment)
-- -----------------------------------------------------------------------------
insert into categories (name, type, icon, sort_order) values
  -- Products
  ('Electronics',      'product', 'smartphone',  10),
  ('Home & Living',    'product', 'home',        20),
  ('Fashion',          'product', 'shirt',       30),
  ('Food & Produce',   'product', 'shopping-basket', 40),
  ('Vehicles',         'product', 'car',         50),
  ('Handicraft',       'product', 'palette',     60),
  -- Services
  ('Repairs',          'service', 'wrench',      10),
  ('Tutoring',         'service', 'book-open',   20),
  ('Transport',        'service', 'bus',         30),
  ('Events',           'service', 'calendar',    40),
  ('Fishing',          'service', 'anchor',      50),
  -- Rentals
  ('Accommodation',    'rental',  'bed',         10),
  ('Equipment Rental', 'rental',  'tool',        20),
  ('Boats',            'rental',  'sailboat',    30),
  -- Business categories
  ('Retail Shop',      'business','store',       10),
  ('Restaurant',       'business','utensils',    20),
  ('Services Provider','business','briefcase',   30)
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- Tips (admin content — safe example promos/announcements)
-- -----------------------------------------------------------------------------
insert into tips (title, description, category, status, published_at) values
  ('Welcome to Pasifika Campus',
   'Discover products, services, businesses and rentals across Kiribati. Find. Discover. Contact. Buy, sell or arrange.',
   'Announcement', 'published', now()),
  ('Selling is free',
   'List your first product, service or rental in minutes. Add a photo, set your price, and reach your community.',
   'Deal', 'published', now()),
  ('Stay safe when you buy',
   'Always meet in a public place, inspect items before paying, and report anything suspicious.',
   'Information', 'published', now())
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- Demo businesses & listings (guarded — only runs if a demo user exists)
-- -----------------------------------------------------------------------------
-- Set the email of an EXISTING test auth user to attach demo content to.
do $$
declare
  v_demo_email text := 'demo.seller@example.com';   -- <-- change to your test user
  v_owner  uuid;
  v_cat    uuid;
  v_biz    uuid;
  v_listing uuid;
begin
  select id into v_owner from auth.users where email = v_demo_email limit 1;

  if v_owner is null then
    raise notice '[seed] No demo user (%). Skipping demo businesses/listings.', v_demo_email;
    return;
  end if;

  -- Demo approved business
  select id into v_cat from categories where name = 'Retail Shop' limit 1;
  insert into businesses (owner_id, name, description, category_id, country, island, community, is_open, status)
  values (v_owner, '[DEMO] Tarawa Corner Store',
          'Everyday goods and fresh produce. [DEMO seed data]',
          v_cat, 'Kiribati', 'South Tarawa', 'Betio', true, 'approved')
  returning id into v_biz;

  -- Demo approved product listing
  select id into v_cat from categories where name = 'Food & Produce' limit 1;
  insert into listings (owner_id, business_id, category_id, listing_type, title, description,
                        price, price_type, country, island, community, status)
  values (v_owner, v_biz, v_cat, 'product', '[DEMO] Fresh Coconuts (bundle of 6)',
          'Locally harvested coconuts. [DEMO seed data]',
          5.00, 'fixed', 'Kiribati', 'South Tarawa', 'Betio', 'approved')
  returning id into v_listing;

  -- Demo approved service listing
  select id into v_cat from categories where name = 'Repairs' limit 1;
  insert into listings (owner_id, category_id, listing_type, title, description,
                        price_type, country, island, community, status)
  values (v_owner, v_cat, 'service', '[DEMO] Phone & Laptop Repairs',
          'Screen replacements and diagnostics. Contact to arrange. [DEMO seed data]',
          'negotiable', 'Kiribati', 'South Tarawa', 'Bairiki', 'approved');

  -- Demo approved rental listing
  select id into v_cat from categories where name = 'Accommodation' limit 1;
  insert into listings (owner_id, category_id, listing_type, title, description,
                        price, price_type, country, island, community, status)
  values (v_owner, v_cat, 'rental', '[DEMO] Guest Room near the lagoon',
          'Quiet room, contact owner to arrange dates. [DEMO seed data]',
          40.00, 'negotiable', 'Kiribati', 'South Tarawa', 'Bikenibeu', 'approved');

  raise notice '[seed] Demo business & listings created for %', v_demo_email;
end $$;
