# Verdict — Product & Strategy Plan

> Living document. Update this whenever direction changes.

---

## What We're Building

Verdict produces a **structured first-pass diligence memo in about a minute** using live web intelligence (Perplexity Sonar Pro). Founders get market sizing, competitor intel, entry assessment, a Go / Conditional / No-Go synthesis, and a Devil's Advocate section (real failures + patterns in the space). **Positioning:** research and synthesis from public information and the founder profile — **not** a substitute for talking to customers, running experiments, or legal/financial advice.

---

## Report: Market Research Standards

What to **add** to the report (product + prompts + UX copy):

- **Bottom-up sizing path** — Short "how we estimated" (buyers × price, seats × ARPU, or equivalent) so TAM/SAM/SOM isn't only top-down industry percentages.
- **ICP + job-to-be-done** — Tight paragraph: who pays, what job they hire the product for, what they use today instead.
- **Substitutes & "good enough"** — Beyond named competitors: spreadsheets, services, incumbents' partial solutions, status quo.
- **Demand signals (explicitly not measured)** — What would count as *strong* vs *weak* validation in *this* category (pilots, LOIs, preorders, inbound) without claiming we observed them.
- **Kill criteria** — "We'd change our mind if…" (specific competitor, regulation, channel, or unit-economics fact).
- **Uncertainty** — Per section or global callout where the web is thin or conflicting; avoid uniform confidence.
- **Methodology blurb** — On the report: what each block means, that sources can be wrong or dated, link to citations.

What to **remove or tighten**:

- **Repeated narrative** — If market, verdict, and Devil's Advocate say the same thing, collapse to one sharp takeaway.
- **Wide shallow competitor tables** — Prefer fewer rows with *why they matter for your entry* over many empty rows.
- **Failure stories without transfer** — Cut or shorten cases that don't tie to *this* founder's stage, budget, and geography.

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
- [ ] Rate-limit and protect API routes (validate + chat) — cost and abuse control alongside auth
- [ ] Real-time progress indicator during validation (show which of 6 calls completed)
- [ ] Animated score reveal on report load
- [ ] Share link — read-only report URL *(also the main viral loop; not duplicated later in roadmap)*

---

## Feature Roadmap

### Ship Now
| Feature | Description | Tier |
|---------|-------------|------|
| Idea history + score timeline | Re-validate and see scores change over time | Pro |
| Investor-ready PDF mode | Reformatted export designed for investor emails | Pro |

*Real-time validation progress is listed under Immediate Fixes above.*

### Next 30 Days
| Feature | Description | Tier |
|---------|-------------|------|
| Compare mode | Validate 2-3 ideas side by side, same founder profile | Pro |
| Competitor deep-dive | Click a competitor to get full breakdown | Pro |
| Notion export | One-click export report as structured Notion page | Pro |

*Share link: ship in Immediate Fixes; don't rebuild as a separate roadmap item.*

**Sequencing:** Ship **Scenario mode** (profile change → re-validation, framed as "simulate a different version of yourself") before leaning hard into **Compare mode** + **Multi-Persona Analyst** in the same release window — avoid three parallel "comparison" concepts at once.

### Next 90 Days
| Feature | Description | Tier |
|---------|-------------|------|
| Weekly re-scan alert | Auto re-run market + competitor sections, alert on changes | Pro |
| Team mode | Add co-founders, leave inline comments on report sections | Team |
| "Ideas like yours" section | Pattern matching from validation corpus | Pro |

**Defer until core loop + paid conversion are working** (high build cost vs. unproven payoff): benchmark score ("top X% in vertical"), accelerator cohort dashboard, YC application pre-fill — revisit after MRR traction.

---

## Stolen from MiroFish

Concepts adapted from MiroFish's multi-agent simulation engine into Verdict's founder validation context.

**1. Scenario Mode** *(from MiroFish's "God's-eye view variable injection")*
After getting a report, founder changes one variable ("what if my budget was $50K?" or "what if I targeted Europe?") and only the affected sections re-run instantly. Frame it as "Simulate a different version of yourself."
Already partially built — founder profile edit triggers re-validation. Just needs UX framing.
- Complexity: Easy | Tier: Pro | Priority: **Ship now**

**2. Upload Seed Materials** *(from MiroFish's "seed extraction from real world")*
Founders upload a pitch deck, market research PDF, or business plan doc. Verdict extracts the idea + context automatically — removes blank-page friction entirely.
- Complexity: Medium (PDF parsing + extraction prompt) | Tier: Pro | Priority: **Next 30 days**

**3. Multi-Persona Analyst Panel** *(from MiroFish's "agents with independent personalities")*
Instead of one generic chatbot, 3 named AI analyst personas the founder chats with independently:
- **"The Investor"** — skeptical, asks hard questions about moat and unit economics
- **"The Operator"** — execution-focused, asks about GTM, hiring, and timelines
- **"The Devil"** — finds every reason it will fail, no sugarcoating
Each gives different answers to the same question based on their lens.
- Complexity: Medium (different system prompts per persona, same report context) | Tier: Pro | Priority: **Next 30 days** — *after Scenario mode + compare positioning are clear*

**4. Scenario Comparison** *(from MiroFish's "dual-platform parallel simulation")*
"Run this idea as 3 different founders" — same idea, 3 founder profiles side by side (e.g., technical solo founder with $0 vs funded team with $50K). Shows how dramatically entry score and verdict change based on who's building.
- Complexity: Medium (3x API calls, comparison layout) | Tier: Team | Priority: **Next 90 days**

**5. Temporal Re-scan + Change Detection** *(from MiroFish's "dynamic temporal memory updates")*
Weekly auto re-scan of market + competitor sections. Alert founder if a new competitor launched, a funding round closed, or market size estimates shifted materially. "Your competitor Y just raised $10M — this changes your entry score."
- Complexity: Hard (auth, scheduled jobs, notifications) | Tier: Pro | Priority: **Next 90 days**

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
"Every year, hundreds of millions of people explore starting a business. Most waste weeks on scattered Googling before they have a coherent picture of the market. Verdict uses live AI search to deliver a structured diligence memo — sizing, competitors, entry dynamics, a clear Go/Conditional/No-Go synthesis, and failure patterns in the space — in about a minute, personalized to the founder's profile. We're building the Bloomberg Terminal for early-stage founder judgment: fast structured research first, then deeper validation and monitoring as we grow."

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
5. **Report can overclaim "validation."** Without bottom-up sizing, substitutes, kill criteria, and uncertainty, the memo reads more definitive than the evidence supports — address via **Report: Market Research Standards** above.

---

## Biggest Opportunity

The B2B accelerator and university market. Captive audiences, real budgets, doing this manually today.
One accelerator contract at $6K/year = 500 individual subscribers.
**Go here faster than you think you need to.**

---

*Last updated: March 2025*
