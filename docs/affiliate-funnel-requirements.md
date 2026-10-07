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

---

## 1. Offer & Affiliate Setup

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

## 2. Funnel Website

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

## 3. Lead Capture

Don't send every visitor directly to the affiliate offer.

- [ ] Email capture form
- [ ] Name/email fields
- [ ] Lead magnet
- [ ] Thank-you page
- [ ] Email confirmation/opt-in where required
- [ ] Lead database
- [ ] Segmentation/tags

## 4. Email Funnel

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

- [ ] Automated triggers
- [ ] Delays
- [ ] Segmentation
- [ ] Open/click tracking
- [ ] Unsubscribe handling
- [ ] Deliverability controls

## 5. Content Engine

The funnel needs traffic.

- [ ] Blog/article generator
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

## 6. Traffic Sources

Choose according to the affiliate program's rules. **Some programs prohibit
certain traffic methods, brand bidding, email promotion, or direct linking —
verify per offer.**

- [ ] Google/SEO
- [ ] TikTok
- [ ] YouTube
- [ ] Facebook
- [ ] Instagram
- [ ] Pinterest
- [ ] Reddit/community marketing (where permitted)
- [ ] Email
- [ ] Paid advertising (where permitted)

## 7. Tracking & Analytics

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

## 8. Conversion Optimization

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

## 9. Automation ("lazy affiliate system")

This is where the biggest leverage comes from.

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

## 10. Compliance & Trust

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

## 11. Technical Infrastructure

Low-cost architecture target:

| Layer | Choice |
|---|---|
| Frontend | GitHub → Cloudflare Pages |
| Backend/automation | Google Apps Script |
| Database (initial) | Google Sheets |
| Analytics | GA4 + custom campaign tracking |
| Email | Dedicated email provider/API (not Gmail as the marketing engine) |
| AI/content | AI API connected to Apps Script |
| Scheduler | Apps Script triggers |
| Dashboard | Web dashboard + Google Sheets administration |

- [ ] Frontend repo wired to Cloudflare Pages
- [ ] Apps Script backend/automation project
- [ ] Google Sheets as initial database
- [ ] GA4 + campaign tracking wired in
- [ ] Email provider/API integrated (separate from Gmail)
- [ ] AI API connected to Apps Script for content generation
- [ ] Apps Script time-based triggers for scheduling
- [ ] Web dashboard reading/writing Sheets

## 12. Affiliate Funnel Architecture

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

All items above are open (v1 scope not yet built). Check items off in PRs as
they land, and keep this file as the canonical scope reference for the
campaign-centric Affiliate Marketing Campaign Engine.
