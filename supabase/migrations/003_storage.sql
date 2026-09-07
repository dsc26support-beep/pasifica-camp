-- =============================================================================
-- Pasifika Campus — V1 Storage buckets & policies
-- Migration: 003_storage.sql
-- =============================================================================
-- Buckets:
--   avatars    — public read; users write their own folder (avatars/<uid>/...)
--   businesses — public read; owner writes their own folder (businesses/<uid>/)
--   listings   — public read; owner writes their own folder (listings/<uid>/...)
--   tips       — public read; admin write only
--
-- We use a per-user top-level folder convention so ownership can be enforced by
-- comparing the first path segment to auth.uid(). Public READ is allowed so the
-- mobile app can render images via public URLs; visibility of the *listing*
-- itself is still gated by RLS (an image URL is only surfaced once its parent
-- listing/business/tip is approved & published).
-- =============================================================================

insert into storage.buckets (id, name, public)
values
  ('avatars',    'avatars',    true),
  ('businesses', 'businesses', true),
  ('listings',   'listings',   true),
  ('tips',       'tips',       true)
on conflict (id) do nothing;

-- Helper: first folder segment of an object name (the owner uid by convention).
-- storage.foldername(name) returns text[]; element 1 is the top-level folder.

-- ---- avatars ---------------------------------------------------------------
create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars: owner write"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars: owner update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars: owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---- businesses ------------------------------------------------------------
create policy "businesses storage: public read"
  on storage.objects for select
  using (bucket_id = 'businesses');

create policy "businesses storage: owner write"
  on storage.objects for insert
  with check (
    bucket_id = 'businesses'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "businesses storage: owner update"
  on storage.objects for update
  using (
    bucket_id = 'businesses'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "businesses storage: owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'businesses'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---- listings --------------------------------------------------------------
create policy "listings storage: public read"
  on storage.objects for select
  using (bucket_id = 'listings');

create policy "listings storage: owner write"
  on storage.objects for insert
  with check (
    bucket_id = 'listings'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "listings storage: owner update"
  on storage.objects for update
  using (
    bucket_id = 'listings'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "listings storage: owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'listings'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---- tips (admin-managed) --------------------------------------------------
create policy "tips storage: public read"
  on storage.objects for select
  using (bucket_id = 'tips');

create policy "tips storage: admin write"
  on storage.objects for insert
  with check (bucket_id = 'tips' and is_admin());

create policy "tips storage: admin update"
  on storage.objects for update
  using (bucket_id = 'tips' and is_admin());

create policy "tips storage: admin delete"
  on storage.objects for delete
  using (bucket_id = 'tips' and is_admin());
