-- =============================================================================
-- RLS tests: privacy of personal data + role-escalation guard + tip visibility.
-- Run with: supabase test db
-- =============================================================================
begin;
select plan(5);

select tests.as_service();

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000f1', 'owner@test.dev'),
  ('00000000-0000-0000-0000-0000000000f2', 'snooper@test.dev')
on conflict do nothing;

insert into profiles (id, full_name, role) values
  ('00000000-0000-0000-0000-0000000000f1', 'Owner', 'user'),
  ('00000000-0000-0000-0000-0000000000f2', 'Snooper', 'user')
on conflict (id) do update set role = excluded.role;

-- A private notification for the owner.
insert into notifications (id, user_id, type, title)
values ('00000000-0000-0000-0000-0000000000f9',
        '00000000-0000-0000-0000-0000000000f1', 'admin_announcement', 'Private')
on conflict do nothing;

-- A draft (unpublished) tip.
insert into tips (id, title, status)
values ('00000000-0000-0000-0000-000000000ff1', 'Secret draft', 'draft')
on conflict do nothing;

-- ---- another user cannot read the owner's notifications --------------------
select tests.as_user('00000000-0000-0000-0000-0000000000f2');
select is(
  (select count(*)::int from notifications where id = '00000000-0000-0000-0000-0000000000f9'),
  0,
  'a user cannot read another user''s notifications'
);

-- ---- the owner can read their own notifications ----------------------------
select tests.as_user('00000000-0000-0000-0000-0000000000f1');
select is(
  (select count(*)::int from notifications where id = '00000000-0000-0000-0000-0000000000f9'),
  1,
  'a user can read their own notifications'
);

-- ---- a non-admin cannot escalate their own role (guard trigger) ------------
select throws_ok(
  $$ update profiles set role = 'admin' where id = '00000000-0000-0000-0000-0000000000f1' $$,
  NULL,
  'a non-admin cannot promote themselves to admin'
);
select is(
  (select role::text from profiles where id = '00000000-0000-0000-0000-0000000000f1'),
  'user',
  'the role is unchanged after the blocked escalation'
);

-- ---- draft tips are not publicly visible -----------------------------------
select tests.as_anon();
select is(
  (select count(*)::int from tips where id = '00000000-0000-0000-0000-000000000ff1'),
  0,
  'draft (unpublished) tips are not visible to the public'
);

select * from finish();
rollback;
