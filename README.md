# Pasifika Campus

A modern, Pacific-focused **marketplace & community platform**. V1 launches in
**Kiribati 🇰🇮**, with a geography model (`Country → Island → Community`) built
for future expansion across the Pacific.

> **Find → Discover → Contact → Buy / Sell / Arrange**

- **Mobile:** React Native · Expo · Expo Router · TypeScript
- **Backend:** Supabase (PostgreSQL · Auth · Storage · Realtime)
- **Design:** Charcoal + Pacific Gold + Grey — premium, clean, mobile-first

---

## 1. Quick start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env
#   -> set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY

# 3. Apply the database (see §2)

# 4. Run
npm start          # Expo dev server (press 'a' for Android)
```

Quality gates:

```bash
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm test           # jest unit tests
```

## 2. Database setup (Supabase)

Migrations are plain SQL in `supabase/migrations/`, applied **in order**:

| File | What it creates |
|------|-----------------|
| `001_initial_schema.sql` | All tables, enums, indexes, `updated_at` & auth-profile triggers |
| `002_rls_policies.sql` | Row Level Security + moderation-field guards |
| `003_storage.sql` | Storage buckets (`avatars`, `businesses`, `listings`, `tips`) + policies |
| `004_functions.sql` | `search_listings` RPC, notification triggers, `start_conversation`, `admin_dashboard_stats` |

Apply them with the Supabase CLI (recommended) or by pasting each file into the
Supabase SQL editor in order:

```bash
# with the Supabase CLI + a linked project
supabase db push
# or run the seed for local dev (reference data + guarded demo rows)
psql "$DATABASE_URL" -f supabase/seed/seed.sql
```

### Make yourself an admin

Admin access is driven by `profiles.role = 'admin'` and enforced by RLS. After
signing up once, promote your account (run in the Supabase SQL editor):

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

## 3. Project structure

```
app/                 Expo Router screens
  (tabs)/            Home · Tips · Messages · Cart · Account (the 5 permanent tabs)
  auth/              sign-in · sign-up · reset-password
  listing/[id]       listing detail       business/[id]  business page
  sell/              type chooser + create form
  conversation/[id]  realtime chat        admin/         moderation dashboard
components/          ui/ (Text, Button, Input, Card, StatusPill, states…) + listings/
features/            data services per domain (listings, businesses, messaging…)
lib/                 supabase client · auth · zod validation
hooks/ utils/ types/ constants/   shared building blocks
assets/branding/     approved-direction logos + colour tokens
supabase/            migrations/ + seed/
__tests__/           unit tests
```

## 4. Brand

Exact palette (see `constants/colors.ts` / `assets/branding/brand-colours.json`):

| Token | Hex | Use |
|-------|-----|-----|
| Charcoal Black | `#0D0D0D` | Backgrounds, nav, headers |
| Pacific Gold | `#D4AF37` | Primary CTAs, active nav, accents (**accent only, ~10–15%**) |
| Dark Grey | `#252525` | Cards, surfaces |
| Medium Grey | `#6B6B6B` | Secondary text, borders |
| Light Grey | `#F2F2F2` | Light surfaces |
| White | `#FFFFFF` | Text on dark |

Fonts: **Poppins** (headings) · **Inter** (body).

---

## 5. Security notes

- The app ships **only** the Supabase **anon key**. RLS is the enforcement
  boundary. The service-role key must never be bundled into the client.
- Users manage only their own rows; **self-approval and role escalation are
  blocked** by DB triggers in addition to RLS policies.
- Public reads are limited to **approved** listings/businesses and **published,
  unexpired** tips.

See `IMPLEMENTATION_REPORT.md` for the full V1 build report, test results, and
known limitations.
