-- =============================================================================
-- RLS test helpers — user impersonation for pgTAP tests.
-- =============================================================================
-- Supabase RLS reads auth.uid() from the request.jwt.claims GUC and runs queries
-- as the `authenticated` (or `anon`) role. These helpers set both so a test can
-- act as a specific user, an anonymous visitor, or an admin.
--
-- Loaded automatically by `supabase test db` before the *.test.sql files.
-- =============================================================================

create schema if not exists tests;

-- Impersonate an authenticated user with the given id.
create or replace function tests.as_user(uid uuid)
returns void
language plpgsql
as $$
begin
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', uid::text, 'role', 'authenticated')::text,
    true
  );
  execute 'set local role authenticated';
end;
$$;

-- Impersonate an admin: same as as_user, but the caller must have already set
-- profiles.role = 'admin' for this uid (is_admin() checks the table).
create or replace function tests.as_admin(uid uuid)
returns void
language plpgsql
as $$
begin
  perform tests.as_user(uid);
end;
$$;

-- Drop back to an anonymous visitor.
create or replace function tests.as_anon()
returns void
language plpgsql
as $$
begin
  perform set_config(
    'request.jwt.claims',
    json_build_object('role', 'anon')::text,
    true
  );
  execute 'set local role anon';
end;
$$;

-- Restore the privileged test role (postgres) for setup/teardown between cases.
create or replace function tests.as_service()
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', '', true);
  execute 'set local role postgres';
end;
$$;
