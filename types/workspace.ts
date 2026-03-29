export type AppState = "empty" | "survey" | "loading"
export type WorkspaceView = "new" | "history" | "research"

export interface SurveyAnswers {
  stage: string
  technical: string
  budget: string
  time: string
  network: string
  geography: string
}

export interface SavedReport {
  id: string
  idea: string
  date: string
  verdict: string
  viabilityScore: number
  report: object
  survey: object
  starred?: boolean
}

export const DEFAULT_SURVEY: SurveyAnswers = {
  stage: "Just an idea",
  technical: "Non-technical",
  budget: "Under $1K",
  time: "None — complete outsider",
  network: "No connections",
  geography: "United States",
}

export const SURVEY_QUESTIONS: {
  key: keyof SurveyAnswers
  label: string
  options: string[]
}[] = [
  {
    key: "stage",
    label: "Where are you in the journey?",
    options: ["Just an idea", "Building MVP", "Have early users", "Pre-revenue", "Generating revenue"],
  },
  {
    key: "technical",
    label: "Technical background?",
    options: ["Non-technical", "Some technical skills", "Technical / developer", "Technical co-founder"],
  },
  {
    key: "budget",
    label: "Starting budget?",
    options: ["Under $1K", "$1K – $10K", "$10K – $50K", "$50K – $100K", "$100K+"],
  },
  {
    key: "time",
    label: "Industry experience?",
    options: ["None — complete outsider", "Some — adjacent or hobbyist", "Strong — worked in this space", "Expert — 5+ years"],
  },
  {
    key: "network",
    label: "Network in this space?",
    options: ["No connections", "A few contacts", "Active network in this space", "Deep domain expertise"],
  },
  {
    key: "geography",
    label: "Target geography?",
    options: ["United States", "North America", "Europe", "Asia Pacific", "Global", "Other"],
  },
]

export const LOADING_STEPS = [
  "Analyzing idea",
  "Sizing market",
  "Scanning competitors",
  "Scoring entry",
  "Synthesizing verdict",
  "Identifying failure patterns",
]

export const SUGGESTION_CHIPS = [
  { title: "Analyze a SaaS startup", category: "GROWTH & RETENTION", prompt: "Analyze a SaaS startup targeting SMBs with a subscription model, focusing on growth levers and retention risks." },
  { title: "Evaluate a marketplace idea", category: "LIQUIDITY ANALYSIS", prompt: "Evaluate a two-sided marketplace concept, assessing liquidity challenges, supply-demand balance, and monetization strategy." },
  { title: "Score a deeptech concept", category: "IP & TECH READINESS", prompt: "Score a deeptech concept on IP defensibility, technology readiness level, and path to commercialization." },
]

export const MAX_CHARS = 200
export const BORDER = "#2a2a2a"
export const TEXT_MUTED = "#555"
export const ACCENT = "#2dd4bf"

export function verdictTone(verdict: string) {
  if (verdict === "GO")
    return "border border-teal-500/40 bg-teal-500/10 text-teal-400"
  if (verdict === "CONDITIONAL GO")
    return "border border-amber-500/40 bg-amber-500/10 text-amber-400"
  return "bg-red-500/10 text-red-400 border border-red-500/30"
}

export function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    const day = d.getUTCDate().toString().padStart(2, "0")
    const month = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase()
    const year = d.getUTCFullYear()
    return `${day} ${month} ${year}`
  } catch {
    return ""
  }
}

export function formatArchiveHeaderDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()
  } catch {
    return "—"
  }
}
