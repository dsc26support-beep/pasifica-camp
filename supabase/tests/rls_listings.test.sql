-- =============================================================================
-- RLS tests: listings — visibility, ownership, and self-approval guard.
-- Run with: supabase test db
-- =============================================================================
begin;
select plan(8);

-- ---- Fixtures (as the privileged role) ------------------------------------
select tests.as_service();

-- Two users + an admin. profiles reference auth.users, so insert both.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'seller@test.dev'),
  ('00000000-0000-0000-0000-0000000000a2', 'other@test.dev'),
  ('00000000-0000-0000-0000-0000000000a9', 'admin@test.dev')
on conflict do nothing;

-- handle_new_user() may have created profiles; ensure roles/fields are set.
insert into profiles (id, full_name, role) values
  ('00000000-0000-0000-0000-0000000000a1', 'Seller', 'user'),
  ('00000000-0000-0000-0000-0000000000a2', 'Other',  'user'),
  ('00000000-0000-0000-0000-0000000000a9', 'Admin',  'admin')
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;

insert into categories (id, name, type) values
  ('00000000-0000-0000-0000-0000000000c1', 'Food', 'product')
on conflict do nothing;

-- A pending and an approved listing owned by the seller.
insert into listings (id, owner_id, category_id, listing_type, title, price, price_type, status)
values
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000a1',
   '00000000-0000-0000-0000-0000000000c1', 'product', 'Pending item', 5, 'fixed', 'pending'),
  ('00000000-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-0000000000a1',
   '00000000-0000-0000-0000-0000000000c1', 'product', 'Approved item', 5, 'fixed', 'approved')
on conflict do nothing;

-- ---- anon sees only approved -----------------------------------------------
select tests.as_anon();
select is(
  (select count(*)::int from listings where id in
     ('00000000-0000-0000-0000-0000000000d1','00000000-0000-0000-0000-0000000000d2')),
  1,
  'anon sees only the approved listing'
);

-- ---- other authenticated user also sees only approved ----------------------
select tests.as_user('00000000-0000-0000-0000-0000000000a2');
select is(
  (select count(*)::int from listings where id = '00000000-0000-0000-0000-0000000000d1'),
  0,
  'a non-owner cannot see another user''s pending listing'
);

-- non-owner cannot update someone else's listing
select throws_ok(
  $$ update listings set title = 'hacked' where id = '00000000-0000-0000-0000-0000000000d2' $$,
  NULL,
  'non-owner update of another user''s listing is blocked'
);
select is(
  (select title from listings where id = '00000000-0000-0000-0000-0000000000d2'),
  'Approved item',
  'the listing title is unchanged after the blocked update'
);

-- ---- owner can see + edit own pending listing ------------------------------
select tests.as_user('00000000-0000-0000-0000-0000000000a1');
select is(
  (select count(*)::int from listings where id = '00000000-0000-0000-0000-0000000000d1'),
  1,
  'owner can see their own pending listing'
);
select lives_ok(
  $$ update listings set title = 'Pending item v2' where id = '00000000-0000-0000-0000-0000000000d1' $$,
  'owner can edit their own listing content'
);

-- ---- owner CANNOT self-approve (guard trigger) -----------------------------
select throws_ok(
  $$ update listings set status = 'approved' where id = '00000000-0000-0000-0000-0000000000d1' $$,
  NULL,
  'owner cannot self-approve their own listing'
);

-- ---- admin CAN approve -----------------------------------------------------
select tests.as_admin('00000000-0000-0000-0000-0000000000a9');
select lives_ok(
  $$ update listings set status = 'approved' where id = '00000000-0000-0000-0000-0000000000d1' $$,
  'an admin can approve a pending listing'
);

select * from finish();
rollback;
