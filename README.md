# Verdict

**AI-powered startup validation platform.** Verdict produces a structured first-pass diligence memo in about a minute using live web intelligence. Founders get market sizing, competitor intel, entry assessment, a Go / Conditional Go / No-Go synthesis, and a Devil's Advocate section with real failure patterns in the space.

---

## Stack

- **Frontend:** Next.js 15 + React + Tailwind CSS
- **AI:** Perplexity Sonar Pro + Sonar Reasoning Pro (6 parallel API calls)
- **Storage:** localStorage (Supabase auth coming soon)
- **Export:** PDF via html-to-image + jsPDF
- **Infra:** Vercel

---

## Features

- **Workspace** — ChatGPT/Claude-style layout with sidebar, recent analyses, and suggestion chips
- **Founder Profile Survey** — 6-dimension profile (stage, technical skill, budget, experience, network, geography) that personalizes every report
- **Report Page** — Two-panel layout with 6 structured cards:
  - **Snapshot** — One-liner, core problem, target customer, clarity score
  - **Market Opportunity** — TAM / SAM / SOM with chain-of-thought methodology, CAGR, market timing, trend chart
  - **Competitors** — Divider list with impact labels, gap statement
  - **Entry Strategy** — Score (0–10), barrier level pill, barriers vs advantages grid, fastest entry path, next action
  - **Kill Criteria** — Top risks that would change the verdict
  - **Devil's Advocate** — Historical failure cases, pattern analysis, survival rule
- **Dossier AI** — Sidebar chatbot powered by Perplexity, contextual to the open report
- **Score System** — Viability score (demand, founder fit, defensibility, monetization) and entry score (regulatory, capital, technical, competition) each built from 4 sub-dimensions
- **PDF Export** — Full report export via html-to-image + jsPDF
- **History** — Saved reports with verdict badge and score, re-openable from sidebar

---

## Prompt Engineering

- **Market sizing:** 6-step chain-of-thought (category → TAM with cited source → SAM with narrowing logic → SOM tied to founder budget/stage → CAGR → timing). Returns `tamMethodology`, `samMethodology`, `somMethodology` per section.
- **Scores:** 4-dimension sub-score system with explicit 0–10 anchors and reference calibration examples. Server-side fallback averages sub-scores if the model returns a lazy top-level score.
- **`<think>` block stripping:** `sonar-reasoning-pro` outputs `<think>...</think>` before JSON — stripped before extraction to prevent parse failures.
- **Verdict re-derivation:** GO / CONDITIONAL GO / NO-GO re-derived from computed viabilityScore after normalization, not trusted from raw model output.

---

## Project Structure

```
app/
  api/
    validate/        # 6 parallel Perplexity calls, SSE streaming
    chat/            # Dossier AI chatbot endpoint
  report/            # Report page (orchestration only)
  workspace/         # Workspace page (orchestration only)
components/
  report/            # CardSnapshot, CardMarket, CardCompetitors, CardEntryScore,
                     # CardKillCriteria, CardDevilsAdvocate, ReportHero,
                     # IdeaProfileTab, SourcesTab, Chatbot, CardShell
  workspace/         # Sidebar, EmptyState, SurveyScreen, LoadingScreen, HistoryScreen
  funding-ticker     # Live funded startups ticker on homepage
lib/
  report-utils.tsx   # renderMarkdown, extractMarketValue, TrendChart, score helpers
  viability-score.ts # Viability score normalization utilities
types/
  report.ts          # ReportData, Survey, ChatMessage interfaces
  workspace.ts       # Workspace types, constants, helpers
```

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set your environment variable:

```
PERPLEXITY_API_KEY=your_key_here
```

---

Built for HackHayward 2026.
