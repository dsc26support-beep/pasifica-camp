# LIVE handoff — pasifica-camp affiliate funnel

## Goal
Build a lightweight, highly-automated affiliate marketing campaign engine
(campaign-centric: Offer→Audience→Landing→Lead Magnet→Emails→Content→
Social→Tracking→Analytics→Optimization). Repo started empty; this is v1.

## State
- PR #2 (draft, open, subscribed): docs/affiliate-funnel-requirements.md +
  README update. No app code yet — pure requirements/scope doc.
- Checklist locked with user across two Q&A rounds (see Decisions).
- Branch ccr-e873757b-o6d23a pushed; no CI configured on repo yet.
- Session crossed long-context threshold; user chose "keep going here"
  over a fresh-session handoff when asked.

## Decisions (locked, don't re-ask)
- V1 scope = Phase 1 only: offer setup, funnel site, lead capture, email
  funnel, tracking, compliance, infra (sections 1-4,7,10,11). Content
  engine, full auto-generate-from-URL pipeline, CRO testing = Phase 2,
  deferred until one campaign proves it converts.
- AI content API = **Google Gemini** (same vendor as Sheets/Drive/Apps
  Script stack, one billing account).
- Email = **custom-built**, not a SaaS ESP. Apps Script owns reusable
  templates, unsubscribe/suppression, and tagging logic in-house.
- Email send API = **Resend** (user explicitly corrected an earlier
  Gmail pick mid-conversation — Resend is final).
- Stack (section 11): GitHub→Cloudflare Pages frontend, Google Apps
  Script backend, Google Sheets as initial DB, GA4 analytics.

## Next steps
1. Scaffold Phase 1: Apps Script project, Sheets schema (offers, leads,
   email sequence state), Cloudflare Pages repo wiring.
2. Wire Resend API calls from Apps Script (UrlFetchApp) for send +
   webhook-based open/click tracking.
3. Wire Gemini API from Apps Script (not needed until Phase 2 content
   engine, but note the pattern now).
4. Blocked: asked user for a real affiliate offer (network, product,
   tracking link) to build the first campaign/Sheets schema against,
   rather than scaffolding with a placeholder. Awaiting reply.

## Gotchas
- User's raw answers in AskUserQuestion were sometimes garbled/non-
  literal ("Goggles Drive API", a feature description instead of a
  vendor name) — always re-confirm rather than take verbatim text at
  face value when it doesn't parse as a real choice.
- User interrupted mid-answer once to correct Gmail→Resend; that
  correction is authoritative over the earlier tool-result text.

## Open questions
Waiting on user: do they have a specific affiliate offer lined up to
build the first campaign around, or scaffold with a placeholder offer?
