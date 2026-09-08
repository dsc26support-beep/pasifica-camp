# CLAUDE.md — Pasifika Campus

Guidance for working in this repo.

## What this is

**Pasifika Campus** — a Pacific-focused marketplace & community platform (V1,
Kiribati). Expo (React Native) + Expo Router + TypeScript on the client;
Supabase (Postgres + Auth + Storage + Realtime) on the backend.

Core flow: **Find → Discover → Contact → Buy / Sell / Arrange**. No payments,
maps, or AI in V1 (architecture leaves room for later phases).

## Commands

```bash
npm start        # Expo dev server (press 'a' for Android)
npm run typecheck# tsc --noEmit
npm run lint     # eslint
npm test         # jest unit tests
```

CI (`.github/workflows/ci.yml`) runs typecheck + lint + test on every push/PR.
RLS policy tests live in `supabase/tests/` and run against a local stack with
`supabase test db` (not in the JS CI job — they need a database).

## Architecture & conventions

- **Screens** are in `app/` (Expo Router). The five permanent tabs live in
  `app/(tabs)/` — do not add a sixth permanent tab.
- **Data access** goes through `features/<domain>/service.ts` — never call
  Supabase table names directly from screens. Search always goes through the
  `search_listings` RPC (the swap point for a future search engine).
- **UI** uses `components/ui/*` (themed `Text`, `Button`, `Card`, states…).
  Never hard-code colors/fonts — use `constants/` (`Theme`, `TextStyles`).
- **Brand:** charcoal `#0D0D0D` + Pacific gold `#D4AF37` + greys. Gold is an
  accent (~10–15%), not the whole UI. Logos in `assets/branding/` — use as
  provided; regenerate app icons with `node scripts/gen-branding.js`.
- **Validation:** client-side Zod in `lib/validation.ts`, but the **database**
  (constraints + RLS + guard triggers) is the source of truth.

## Security (do not weaken)

- The app ships **only** the Supabase anon key. RLS is the enforcement boundary.
  Never bundle the service-role key into the client.
- Self-approval and role/status escalation are blocked by DB triggers as well as
  RLS. If you change a policy, update `supabase/tests/` to match.
- All schema changes are version-controlled migrations in `supabase/migrations/`
  (ordered `001…`). Don't mutate a live schema out of band.

## Scope discipline

V1 is intentionally small. Before adding a feature or dependency, check it's in
the V1 spec; if not, note it as a future idea and move on. Keep commits small,
logical, and descriptive.
