# Pasifika Campus — V1 Implementation Report

**Scope of this build:** a complete, coherent V1 **foundation** — full database
layer (schema, RLS, storage, functions, seed), the Expo/TypeScript app
architecture, brand system, branding assets, and end-to-end screens for every
V1 domain. It follows the approved specification's development order and the
black/gold/grey identity.

**What this environment could and could not verify** (stated plainly, per the
spec's "do not claim something works unless tested"):

- ✅ Verified here: `tsc --noEmit` clean, `eslint` clean, `jest` 23/23 passing,
  `npm ci` lockfile in sync. A GitHub Actions workflow now runs these three
  checks on every push/PR.
- ⚠️ Not verifiable here: running the Expo app on an Android device/emulator,
  and executing the SQL migrations / RLS against a live Supabase project. Those
  require a provisioned Supabase project + device and are the next step before
  the acceptance tests can be signed off. The code is written to run, but the
  runtime acceptance tests in §60–63 of the spec are **not yet executed**.

---

## 1. What was built

A mobile-first marketplace with authentication, profiles, universal listings
(product/service/rental), businesses, categories, PostgreSQL search + filters,
favourites, a lightweight (no-payment) cart, realtime customer↔seller/business
messaging, notifications (schema + triggers), admin-controlled Tips, reporting,
and an admin moderation dashboard — all on a Pacific-ready geography and secured
with Supabase RLS.

## 2. Files created (high level)

- **Config:** `package.json`, `tsconfig.json`, `app.json`, `babel.config.js`,
  `.eslintrc.js`, `jest.config.js`, `jest.setup.js`, `.gitignore`, `.env.example`
- **Database:** `supabase/migrations/001–004`, `supabase/seed/seed.sql`
- **Constants:** `constants/{colors,typography,layout,config,index}.ts`
- **Types:** `types/{database,index}.ts`
- **Lib:** `lib/{supabase,auth,validation}.ts`
- **Utils:** `utils/{format,storage}.ts`
- **Services:** `features/{listings,businesses,favourites,cart,messaging,notifications,tips,categories,reports,account,admin}/service.ts`, `features/account/AuthProvider.tsx`
- **Hooks:** `hooks/useAsyncData.ts`
- **Components:** `components/ui/*` (Text, Button, Input, Card, StatusPill,
  StateView, Skeleton, Screen, SearchBar, Logo), `components/listings/*`
  (ListingCard, ReportSheet, ImagePickerRow, CategorySelect)
- **Screens:** `app/_layout`, `app/(tabs)/*` (index/tips/messages/cart/account),
  `app/auth/*`, `app/listing/[id]`, `app/business/[id]`, `app/business/manage`,
  `app/search`, `app/sell/{index,new}`, `app/conversation/[id]`,
  `app/favourites`, `app/admin/index`
- **Branding:** `assets/branding/*` (3 SVG logos, colour tokens, README)
- **Tests:** `__tests__/{format,validation}.test.ts`
- **Docs:** `README.md`, this report

## 3. Files modified

`README.md` (replaced the placeholder). Everything else is new (greenfield repo).

## 4. Database tables

`profiles`, `categories`, `businesses`, `listings`, `listing_images`,
`favourites`, `cart_items`, `conversations`, `conversation_members`, `messages`,
`notifications`, `tips`, `reports`.

## 5. Migrations

`001_initial_schema`, `002_rls_policies`, `003_storage`, `004_functions`
(+ `seed/seed.sql`).

## 6. RLS policies

RLS enabled on all 13 tables. Public reads restricted to approved/published
content; owner-scoped writes; conversation-member-only messaging; admin-only
moderation. Additional **trigger guards** block self-approval and role/status
escalation (`guard_profile_admin_fields`, `guard_business_status`,
`guard_listing_moderation_fields`).

## 7. Storage buckets

`avatars`, `businesses`, `listings`, `tips` — public read, per-user-folder
ownership on write; `tips` is admin-write only.

## 8. Branding assets

The **approved** logo artwork is in `assets/branding/source/` (Logo Option 1
P-monogram, Options 1&2, brand board) and is used as provided. App assets are
generated from it by `scripts/gen-branding.js`: `app-icon.png` (P-monogram),
`adaptive-icon.png`, `splash.png`, plus in-app `pasifika-campus-logo-primary.png`
and `logo-mark.png`. `components/ui/Logo.tsx` renders the real artwork
throughout the app (icon/splash/adaptive PNGs referenced by `app.json` now
exist). `brand-colours.json` holds the colour tokens.

## 9. Required environment variables

`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (client).
Server-only (never in app): `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`.

## 10. Dependencies added

Runtime: `expo`, `expo-router`, `@supabase/supabase-js`, `expo-image`,
`expo-image-picker`, `expo-image-manipulator`, `expo-notifications`,
`expo-secure-store`, `react-native-svg`, `@expo-google-fonts/{poppins,inter}`,
`zod`, safe-area/screens/url-polyfill. Dev: TypeScript, ESLint, Jest, jest-expo.
No Meilisearch / MapLibre / PostGIS / AI — deferred per spec.

## 11. Tests performed

- Unit (jest): formatting (price, location, subtotal, status, relative time) and
  validation (auth, product/service/rental discriminated union, report, image
  type/size).
- Static: `tsc --noEmit`, `eslint`, `npm ci` lockfile sync.
- CI: `.github/workflows/ci.yml` runs typecheck + lint + test on push/PR.
- RLS policy suite (pgTAP) authored in `supabase/tests/` covering listing
  visibility/ownership/self-approval, messaging membership, and privacy/role
  escalation — runs with `supabase test db` against a local stack.

## 12. Tests passed

`jest`: **23/23**. `tsc --noEmit`: **clean**. `eslint`: **clean**. `npm ci`:
**clean**. (RLS pgTAP suite: authored, runs on a local Supabase stack — not
executed in this environment; see §13.)

## 13. Known limitations

- Runtime acceptance tests (§60–63) require a live Supabase project + Android
  device/emulator; **not executed in this environment**.
- The RLS pgTAP suite is authored to match the migrations but has **not** been
  executed against a running database yet — run `supabase test db` locally.
- Expo push notifications: notification **rows/triggers** exist; wiring device
  push-token registration + a send path is a small follow-up.
- Search uses `ILIKE`/trigram (fine for launch volumes); the `search_listings`
  RPC is the swap point for a dedicated engine later.
- One business per owner is assumed in the UI (schema allows more).

## 14. Decisions requiring human approval

- **Auth method:** V1 uses **email/password** (Supabase-native) per the spec's
  "smallest reasonable decision"; `profiles.phone` is retained for later phone
  auth. Confirm if phone auth is required at launch.
- **Currency:** prices display in **AUD** (Kiribati's currency). Confirm.
- **Supabase project:** provision a dev project, run migrations, and add a live
  RLS policy-test suite before production.
- Provide final approved logo artwork to replace the direction-faithful SVG
  placeholders.

## 15. Recommended Phase 2 items

Ratings & reviews, nearby discovery + maps, business verification, booking
calendar for rentals, an image CDN/thumbnail pipeline, a dedicated search
engine, and device push delivery — all designed for without being built now.

---

### V1 completion status

Foundation and screens: **complete and statically verified.** End-to-end
acceptance sign-off is **pending** a live Supabase project + Android device, as
noted above. Per the spec, Phase 2 work should not begin until the acceptance
tests pass.
