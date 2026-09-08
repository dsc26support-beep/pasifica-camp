-- =============================================================================
-- RLS tests: messaging — members only can read/send; non-members are blocked.
-- Run with: supabase test db
-- =============================================================================
begin;
select plan(4);

select tests.as_service();

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000b1', 'a@test.dev'),
  ('00000000-0000-0000-0000-0000000000b2', 'b@test.dev'),
  ('00000000-0000-0000-0000-0000000000b3', 'intruder@test.dev')
on conflict do nothing;

insert into profiles (id, full_name) values
  ('00000000-0000-0000-0000-0000000000b1', 'A'),
  ('00000000-0000-0000-0000-0000000000b2', 'B'),
  ('00000000-0000-0000-0000-0000000000b3', 'Intruder')
on conflict (id) do nothing;

-- A conversation between b1 and b2 with one message.
insert into conversations (id, created_by)
values ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000b1')
on conflict do nothing;
insert into conversation_members (conversation_id, user_id) values
  ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000b1'),
  ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000b2')
on conflict do nothing;
insert into messages (conversation_id, sender_id, message)
values ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000b1', 'hello')
on conflict do nothing;

-- ---- a member reads the message --------------------------------------------
select tests.as_user('00000000-0000-0000-0000-0000000000b2');
select is(
  (select count(*)::int from messages where conversation_id = '00000000-0000-0000-0000-0000000000e1'),
  1,
  'a conversation member can read messages'
);

-- ---- a member can send -----------------------------------------------------
select lives_ok(
  $$ insert into messages (conversation_id, sender_id, message)
     values ('00000000-0000-0000-0000-0000000000e1',
             '00000000-0000-0000-0000-0000000000b2', 'hi back') $$,
  'a conversation member can send a message'
);

-- ---- a non-member cannot read ----------------------------------------------
select tests.as_user('00000000-0000-0000-0000-0000000000b3');
select is(
  (select count(*)::int from messages where conversation_id = '00000000-0000-0000-0000-0000000000e1'),
  0,
  'a non-member cannot read a private conversation'
);

-- ---- a non-member cannot send ----------------------------------------------
select throws_ok(
  $$ insert into messages (conversation_id, sender_id, message)
     values ('00000000-0000-0000-0000-0000000000e1',
             '00000000-0000-0000-0000-0000000000b3', 'intrusion') $$,
  NULL,
  'a non-member cannot send into a conversation they are not part of'
);

select * from finish();
rollback;
