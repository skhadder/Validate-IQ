# Verdict · **HackHayward**

> Built for the **HackHayward** hackathon: a **working demo** you can click through, present to judges, and ship to your portfolio. This is not a commercial launch—no GTM, pricing, or long-term roadmap implied.

---

## One-line pitch

**Verdict** helps founders stress-test an idea **before** they over-invest: drop in a pitch plus a quick profile, and get back a **one-minute, citation-backed memo**—market, competitors, entry dynamics, a clear **Go / Conditional Go / No-Go** readout, and a **Devil’s Advocate** pass on how similar bets have failed.

Powered by **live web research** (Perplexity) and strict **structured outputs** so the UI stays predictable. Outputs are **synthesis from public information only**—not legal, tax, or investment advice, and not a substitute for talking to customers.

---

## Stack (judges & README)

| Layer        | Choice                                      |
| ------------ | ------------------------------------------- |
| UI           | Next.js, React, Tailwind                    |
| Intelligence | Perplexity (fan-out section calls + chat) |
| State        | `localStorage` (demo-friendly, no login)    |
| Export       | Print to PDF from the browser               |
| Deploy       | Vercel (typical)                            |

---

## What’s in the demo

- **Landing** — positioning, CTA into the flow, optional live funding ticker.
- **Workspace** — capture the idea, lightweight founder survey, run validation.
- **Report** — scrollable memo, sidebar (profile + sources), **Dossier AI** to ask follow-ups on the report.
- **APIs** — `validate`, `chat`, funded-startups feed as needed for the landing.

Post-hackathon nice-to-haves (auth, database, public share links, billing) stay **explicitly out of scope** unless you decide to keep building.

---

## After the hackathon

If the project continues, sensible next steps might include: real accounts + cloud storage, shareable read-only links, and eval-driven prompt hardening—not commitments, just a sensible backlog.

---

*Last updated: March 29, 2026 · HackHayward*
