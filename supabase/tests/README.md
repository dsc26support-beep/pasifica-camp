# RLS policy tests

These [pgTAP](https://pgtap.org/) tests exercise the **security guarantees** of
the Row Level Security policies in `supabase/migrations/002_rls_policies.sql`
and the moderation guard triggers. They are the safety net for the most
important promises Pasifika Campus makes: users only touch their own data, no
one self-approves their own content, and private conversations stay private.

## Requirements

They run against a **local Supabase / Postgres** stack with the migrations
applied — they are **not** run in the JS unit-test CI job (which has no
database). Run them locally or in a DB-enabled CI job:

```bash
# 1. Start the local stack (applies migrations from supabase/migrations)
supabase start

# 2. Run the pgTAP suite
supabase test db
```

`supabase test db` loads pgTAP and executes every `*.test.sql` in this folder.
`00_helpers.sql` installs small impersonation helpers used by the tests
(`tests.as_user(uuid)`, `tests.as_anon()`, `tests.as_admin(uuid)`).

## What's covered

| File | Guarantees |
|------|-----------|
| `rls_listings.test.sql` | anon/authenticated read only approved listings; owner can edit own; **non-owner cannot edit**; **owner cannot self-approve** (trigger); admin can approve |
| `rls_messaging.test.sql` | conversation members read/send; **non-members cannot read or send** |
| `rls_privacy.test.sql` | favourites/cart/notifications private to owner; **non-admin cannot escalate role**; tips visible only when published |

> Status: authored to match the migrations; execute them against a live local
> stack before relying on them in CI (see `IMPLEMENTATION_REPORT.md`).
