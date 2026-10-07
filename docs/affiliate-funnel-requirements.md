# Affiliate Marketing Funnel — Requirements Checklist

This is the master requirements checklist for pasifica-camp's affiliate marketing
engine: a lightweight, highly automated system for running affiliate campaigns
end-to-end. It is the source of truth for scope — new work should check items
off here (or add new ones) rather than drift from it.

**Design principle — campaign-centric:** every affiliate offer is a **Campaign**
containing `Offer → Audience → Landing Page → Lead Magnet → Emails → Content →
Social → Tracking → Analytics → Optimization`. This turns the project from a
single affiliate website into an Affiliate Marketing Campaign Engine capable of
managing many offers from one dashboard.

## Locked decisions (v1)

These are confirmed — don't re-litigate without a reason:

| Decision | Choice |
|---|---|
| V1 scope | **Core funnel only** — Phase 1 sections below. Content engine, full automation pipeline, and CRO testing are Phase 2, after one campaign proves it converts. |
| AI content API | **Google Gemini API** — same vendor as the Sheets/Drive/Apps Script stack, one Google Cloud billing account, called from Apps Script over HTTPS. |
| Email system | **Custom-built**, not a SaaS ESP — Apps Script owns the reusable-template, unsubscribe, and tagging/segmentation logic in-house. |
| Email send API | **Resend** — sends the actual messages; Apps Script calls its REST API over HTTPS. |

Each section below is tagged **Phase 1 (v1)** or **Phase 2 (later)**.

---

## 1. Offer & Affiliate Setup — Phase 1 (v1)

- [ ] Affiliate network/account
- [ ] Affiliate offer/product
- [ ] Affiliate tracking link
- [ ] Vendor landing/sales page URL
- [ ] Commission rate
- [ ] Cookie duration
- [ ] Target audience
- [ ] Geographic restrictions
- [ ] Allowed/prohibited traffic sources
- [ ] Affiliate disclosure requirements

## 2. Funnel Website — Phase 1 (v1)

- [ ] Custom domain
- [ ] Fast, mobile-first landing page
- [ ] Strong headline
- [ ] Problem/pain-point section
- [ ] Benefits
- [ ] Product/offer explanation
- [ ] Social proof/testimonials (only when legitimate)
- [ ] Comparison or evaluation section
- [ ] FAQ
- [ ] Strong CTA buttons
- [ ] Affiliate disclosure
- [ ] Privacy policy
- [ ] Terms of use
- [ ] Contact page

## 3. Lead Capture — Phase 1 (v1)

Don't send every visitor directly to the affiliate offer.

- [ ] Email capture form
- [ ] Name/email fields
- [ ] Lead magnet
- [ ] Thank-you page
- [ ] Email confirmation/opt-in where required
- [ ] Lead database
- [ ] Segmentation/tags

## 4. Email Funnel — Phase 1 (v1)

Custom-built on Apps Script + Resend (not a SaaS ESP). Apps Script owns the
logic below; Resend only sends.

- [ ] Reusable campaign/template system (write once, reuse across campaigns)
- [ ] Unsubscribe link + suppression list, honored on every send
- [ ] Tagging/segmentation (per-lead tags drive which sequence/step sends)

Basic automated sequence:

- [ ] Welcome email
- [ ] Problem/education email
- [ ] Solution email
- [ ] Product evaluation
- [ ] Benefits/use cases
- [ ] Objection handling
- [ ] Offer/CTA
- [ ] Follow-up
- [ ] Reminder
- [ ] Long-term nurture

Supporting infrastructure:

- [ ] Automated triggers (Apps Script time-based triggers)
- [ ] Delays (step scheduling per lead, tracked in Sheets)
- [ ] Segmentation (tags from above)
- [ ] Open/click tracking (via Resend webhooks/events)
- [ ] Unsubscribe handling (suppression list checked before every send)
- [ ] Deliverability controls (verified sending domain, SPF/DKIM via Resend)

## 5. Content Engine — Phase 2 (later)

The funnel needs traffic. Deferred until the core funnel (Phase 1) proves it
converts at least one offer.

- [ ] Blog/article generator (Gemini API)
- [ ] Product reviews
- [ ] Comparison articles
- [ ] How-to articles
- [ ] Problem/solution articles
- [ ] FAQs
- [ ] Short-form video scripts
- [ ] TikTok/Reels/Shorts content
- [ ] Pinterest content (where appropriate)
- [ ] Social captions
- [ ] SEO titles/descriptions
- [ ] Internal linking
- [ ] Content calendar

## 6. Traffic Sources — Phase 1 scoped, Phase 2 expanded

Choose according to the affiliate program's rules. **Some programs prohibit
certain traffic methods, brand bidding, email promotion, or direct linking —
verify per offer.** Phase 1 ships with one or two channels proven out; the
rest are Phase 2 expansion once the funnel converts.

- [ ] Google/SEO
- [ ] TikTok
- [ ] YouTube
- [ ] Facebook
- [ ] Instagram
- [ ] Pinterest
- [ ] Reddit/community marketing (where permitted)
- [ ] Email
- [ ] Paid advertising (where permitted)

## 7. Tracking & Analytics — Phase 1 (v1)

Know exactly what produces commissions.

- [ ] Visitor tracking
- [ ] UTM parameters
- [ ] Campaign IDs
- [ ] Affiliate click tracking
- [ ] Outbound-click tracking
- [ ] Conversion tracking
- [ ] Email conversion tracking
- [ ] Traffic-source attribution
- [ ] Device/location reporting
- [ ] Revenue tracking
- [ ] EPC (earnings-per-click) tracking
- [ ] ROI tracking for paid traffic

## 8. Conversion Optimization — Phase 2 (later)

- [ ] A/B testing
- [ ] CTA testing
- [ ] Headline testing
- [ ] Landing-page testing
- [ ] Lead magnet testing
- [ ] Email subject testing
- [ ] Offer positioning
- [ ] Exit-intent strategy (where appropriate)
- [ ] Mobile optimization
- [ ] Page-speed optimization

## 9. Automation ("lazy affiliate system") — Phase 2 (later)

This is where the biggest leverage comes from, once Phase 1 proves the funnel
converts. Powered by the Gemini API connected to Apps Script.

**Input:** affiliate URL + vendor information

**System automatically creates:**

- [ ] Offer record
- [ ] Affiliate campaign
- [ ] Landing page
- [ ] Product/evaluation content
- [ ] FAQ
- [ ] SEO metadata
- [ ] Lead magnet
- [ ] Email sequence
- [ ] Social posts
- [ ] Short-video scripts
- [ ] Tracking links
- [ ] Campaign dashboard
- [ ] Publishing schedule

**Then automation handles:**

- [ ] Scheduled content
- [ ] Lead capture
- [ ] Email sequences
- [ ] Analytics
- [ ] Performance monitoring
- [ ] Content refreshes
- [ ] Underperforming campaign alerts

## 10. Compliance & Trust — Phase 1 (v1)

Don't skip this.

- [ ] Affiliate disclosure
- [ ] Privacy policy
- [ ] Cookie/consent handling where applicable
- [ ] Terms
- [ ] Email unsubscribe
- [ ] Advertising disclosures
- [ ] No fabricated reviews
- [ ] No fake scarcity
- [ ] No misleading earnings/health claims
- [ ] Respect vendor affiliate terms
- [ ] Respect platform advertising policies

## 11. Technical Infrastructure — Phase 1 (v1)

Low-cost architecture, locked:

| Layer | Choice |
|---|---|
| Frontend | GitHub → Cloudflare Pages |
| Backend/automation | Google Apps Script |
| Database (initial) | Google Sheets |
| Analytics | GA4 + custom campaign tracking |
| Email sending | Resend API (custom templates/unsubscribe/tagging owned in Apps Script, not Gmail) |
| AI/content | Google Gemini API, connected to Apps Script |
| Scheduler | Apps Script triggers |
| Dashboard | Web dashboard + Google Sheets administration |

- [ ] Frontend repo wired to Cloudflare Pages
- [ ] Apps Script backend/automation project
- [ ] Google Sheets as initial database
- [ ] GA4 + campaign tracking wired in
- [ ] Resend API integrated via Apps Script (custom template/unsubscribe/tagging logic, separate from Gmail)
- [ ] Gemini API connected to Apps Script for content generation
- [ ] Apps Script time-based triggers for scheduling
- [ ] Web dashboard reading/writing Sheets

## 12. Affiliate Funnel Architecture

The end-state funnel shape once Phase 1 and Phase 2 are both built:

```
Traffic
  ↓
SEO / TikTok / YouTube / Social / Other permitted sources
  ↓
Content/Advertorial
  ↓
Landing Page
  ↓
Lead Magnet
  ↓
Email Capture
  ↓
Automated Email Sequence
  ↓
Product Review / Comparison
  ↓
Affiliate CTA
  ↓
Vendor Sales Page
  ↓
Commission
  ↓
Tracking + Analytics
  ↓
Optimization
  ↓
More content automatically generated around winning topics
```

---

## Status

**Locked:** scope (Phase 1/Phase 2 split above), AI API (Gemini), email
approach (custom-built via Apps Script + Resend). All checklist items are
still open — v1 (Phase 1) not yet built. Check items off in PRs as they land,
and keep this file as the canonical scope reference for the campaign-centric
Affiliate Marketing Campaign Engine.
