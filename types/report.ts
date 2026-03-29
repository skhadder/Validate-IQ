export interface ReportData {
  snapshot: {
    oneLiner: string
    problem: string
    targetCustomer: string
    clarityScore: number
  }
  market: {
    tam: string
    tamSource: string
    tamMethodology: string
    sam: string
    samMethodology: string
    som: string
    somMethodology: string
    growthRate: string
    marketTiming: "Early" | "Peak" | "Late"
    marketTimingReason: string
  }
  competitors: {
    competitors: {
      name: string
      website: string
      funding: string
      pricing: string
      lastActivity: string
    }[]
    gapStatement: string
  }
  entryScore: {
    entryScore: number
    barrierLevel: "Low" | "Medium" | "High" | "Very High"
    barriers: string[]
    advantages: string[]
    fastestEntryPath: string
  }
  verdict: {
    verdict: "GO" | "CONDITIONAL GO" | "NO-GO"
    viabilityScore: number
    topReasons: string[]
    topRisks: string[]
    nextAction: string
  }
  devilsAdvocate: {
    failures: {
      name: string
      what: string
      why: string
      year: string
    }[]
    thePattern: string
    survivalRule: string
  }
  confidence: Record<string, string>
  citations?: {
    snapshot?: string[]
    market?: string[]
    competitors?: string[]
    entryScore?: string[]
    verdict?: string[]
    devilsAdvocate?: string[]
  }
  sources?: { url: string; section: string }[]
}

export interface Survey {
  stage: string
  technical: string
  budget: string
  time: string
  network: string
  geography: string
}

export interface ChatMessage {
  role: "user" | "bot"
  content: string
}

export const SURVEY_OPTIONS: Record<keyof Survey, string[]> = {
  stage: ["Just an idea", "Building MVP", "Have early users", "Pre-revenue", "Generating revenue"],
  technical: ["Non-technical", "Some technical skills", "Technical / developer", "Technical co-founder"],
  budget: ["Under $1K", "$1K – $10K", "$10K – $50K", "$50K – $100K", "$100K+"],
  time: ["A few hours a week", "Nights and weekends", "Part-time (20hrs/week)", "Full-time"],
  network: ["No connections", "A few contacts", "Active network in this space", "Deep domain expertise"],
  geography: ["United States", "North America", "Europe", "Asia Pacific", "Global", "Other"],
}
