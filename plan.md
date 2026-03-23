# Verdict — Product & Strategy Plan

> Living document. Update this whenever direction changes.

---

## What We're Building

Verdict validates startup ideas in 60 seconds using live web intelligence powered by Perplexity Sonar Pro. Founders get a full report: market sizing, competitor intel, entry score, Go/No-Go verdict, and a Devil's Advocate section showing real companies that failed in their space.

---

## Current Stack

- **Frontend:** Next.js 15 + React + Tailwind CSS + Framer Motion
- **AI:** Perplexity Sonar Pro (6 parallel API calls)
- **Storage:** localStorage (no auth yet)
- **Export:** Native browser print-to-PDF
- **Infra:** Vercel

---

## Immediate Fixes (Ship This Week)

- [ ] Add Supabase auth (Google OAuth)
- [ ] Replace localStorage with DB-backed report storage
- [ ] Real-time progress indicator during validation (show which of 6 calls completed)
- [ ] Animated score reveal on report load
- [ ] Share link — read-only report URL

---

## Feature Roadmap

### Ship Now
| Feature | Description | Tier |
|---------|-------------|------|
| Idea history + score timeline | Re-validate and see scores change over time | Pro |
| Real-time validation progress | Show which API call completed live | Free |
| Investor-ready PDF mode | Reformatted export designed for investor emails | Pro |

### Next 30 Days
| Feature | Description | Tier |
|---------|-------------|------|
| Compare mode | Validate 2-3 ideas side by side, same founder profile | Pro |
| Share link | Read-only report URL — biggest viral loop | Pro |
| Competitor deep-dive | Click a competitor to get full breakdown | Pro |
| Notion export | One-click export report as structured Notion page | Pro |

### Next 90 Days
| Feature | Description | Tier |
|---------|-------------|------|
| Weekly re-scan alert | Auto re-run market + competitor sections, alert on changes | Pro |
| Benchmark score | "Your score is top 30% in EdTech this quarter" | Pro |
| Team mode | Add co-founders, leave inline comments on report sections | Team |
| Accelerator cohort dashboard | Admin view of all cohort founders' reports | Accelerator |
| YC application pre-fill | Auto-fill YC app questions from validation report | Pro |
| "Ideas like yours" section | Pattern matching from validation corpus | Pro |

---

## Pricing

### Current Recommendation: Modified Subscription

| Tier | Price | What's included |
|------|-------|-----------------|
| Free | $0 | 3 validations total (hard limit), basic report, watermarked PDF |
| Single Pro report | $4.99 one-time | Full report + PDF for 1 idea (upsell inside free report) |
| Founder Pro | $12/month | Unlimited validations, PDF, share links, idea history |
| Team | $49/month | 3 seats, compare mode, team comments |
| Accelerator | $399/month | 50 seats, cohort dashboard, white-label |

**Why $12 not $19:** Pre-revenue founders hit a wall at $19. $12 is under $150/year — below spontaneous purchase ceiling. Get to 500 paying users first, then raise prices.

**Why hard limit on free (not monthly reset):** Monthly resets train users to wait, not pay.

---

## Go-To-Market: 90-Day Plan

### Week 1–2: Launch
1. **Twitter/X thread** — "We validated 50 startup ideas with live AI. Here's what we learned." Real screenshots.
2. **Hacker News Show HN** — Be in comments for 6 hours. Highest quality traffic.
3. **Reddit** — r/startups, r/entrepreneur, r/SideProject. Tell the story, don't pitch.
4. **Product Hunt** — Tuesday morning 12:01am PT. Line up 30 upvotes in advance.
5. **IndieHackers** — Honest launch post with real numbers.

**Target: 200 sign-ups by end of week 2.**

### Week 3–4: Growth
- Double down on wherever week 1–2 traffic came from
- Join founder Slacks and Discords (Indie Hackers, On Deck, Founders Cafe)
- Email all sign-ups: "What did you build after your validation?" → find 3 case studies
- Reach out to 20 accelerators and university entrepreneurship programs
- Goal: 3 Zoom calls with accelerator directors booked

### Month 2: Scale
- SEO content targeting: "how to validate a startup idea", "startup idea validator", "is my startup idea good"
- One long-form post per week — specific, data-driven, not generic
- Newsletter sponsorships (start small: $200-500 per send)
- University partnership outreach (one partnership = 50-200 users per cohort)
- Referral mechanic: 2 extra validations for every referred user who signs up

### Month 3: Revenue → $5K MRR
- Hard paywall at 3 validations with real upgrade prompt
- 7-day Pro free trial, no credit card
- Convert one accelerator to paid pilot ($250/month, 20 seats, 3 months)
- Target: 263 Founder Pro subscribers OR 150 subscribers + 1 accelerator

---

## Competitive Moat

### What we accumulate that nobody else has
Every validation = labeled data point (idea + founder profile + scores + behavior).
After 10,000 validations: proprietary corpus for fine-tuning, industry benchmarks, pattern matching.
This is the moat. Start logging structured data now even if we don't use it yet.

### Network effects path
1. Benchmark comparisons (requires scale — build first, activate later)
2. Anonymous public idea board (opt-in validation results)
3. Accelerator cohorts (20 founders comparing scores internally)

### Switching costs to build
- Idea history (longer you use it, more valuable your history)
- Team state (comments, co-founder access)
- Integrations (Notion, Slack)
- Benchmark history (only exists in Verdict)

### Biggest threat
Perplexity or OpenAI ships a built-in startup validator. Assume this happens within 18 months.

**Defense:** Move faster. Build the things they won't bother to build — accelerator B2B channel, community, validation history, benchmark corpus. A product feature cannot replace 50 accelerator relationships.

---

## Fundraising (When Ready)

### Metrics needed before raising
- $3K–5K MRR
- 2+ accelerator pilots (even at $250/month)
- 1,000+ total validations run
- Clear retention: do users validate more than 1 idea?

### Target raise
**$750K pre-seed** on a SAFE at $5M cap. Target 10–15% dilution.

### Target investors
- Pre-seed funds: Hustle Fund, Catalyst Fund, Precursor Ventures
- Operator angels: ex-YC founders, accelerator directors
- University funds if applicable

### One-paragraph pitch
"Every year, 500 million people explore starting a business. Most waste months on manual market research before realizing the idea doesn't work. Verdict uses live AI search to give founders a complete validation report — real market data, real competitors, a Go/No-Go verdict — in 60 seconds, personalized to who they are as a founder. We're building the Bloomberg Terminal for early-stage founder decision-making, starting with idea validation and expanding into fundraising readiness, team formation, and ongoing market intelligence."

---

## 3-Year North Star

- **Users:** 50,000 active founders/month, 8,000 paying subscribers
- **Revenue:** $2.5M ARR ($1.2M individual, $900K accelerator/university, $400K enterprise)
- **Product:** Full founder operating system — validation → fundraising readiness → market monitoring → co-founder fit
- **Team:** 8 people (2 founders, 3 engineers, 1 designer, 1 growth, 1 partnerships)
- **Category owned:** "Founder Intelligence" — AI tools for founder decision-making

---

## Current Weaknesses (Be Honest)

1. **No auth = no retention.** If user clears cache, everything is gone. Fix this first.
2. **One-time tool, not a habit.** No reason to come back without re-scan, history, or team features.
3. **The report is a deliverable, not a relationship.** Chatbot is underused.
4. **Pricing asks for payment before trust is established.** Let users get full value first, then paywall.

---

## Biggest Opportunity

The B2B accelerator and university market. Captive audiences, real budgets, doing this manually today.
One accelerator contract at $6K/year = 500 individual subscribers.
**Go here faster than you think you need to.**

---

*Last updated: March 2026*
