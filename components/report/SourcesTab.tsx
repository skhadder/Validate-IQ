"use client"

import type { ReportData } from "@/types/report"

const SECTION_LABELS: Record<string, string> = {
  snapshot: "Idea Snapshot",
  market: "Market",
  competitors: "Competitors",
  entryScore: "Entry Score",
  verdict: "Verdict",
  devilsAdvocate: "Devil's Advocate",
}

export function SourcesTab({ report }: { report: ReportData }) {
  const allSources: { url: string; section: string }[] = []

  if (report.citations) {
    for (const [key, urls] of Object.entries(report.citations)) {
      if (urls && urls.length > 0) {
        urls.forEach((url) => {
          if (url) allSources.push({ url, section: SECTION_LABELS[key] ?? key })
        })
      }
    }
  }

  if (allSources.length === 0 && report.sources && report.sources.length > 0) {
    report.sources.forEach((s) => allSources.push(s))
  }

  if (allSources.length === 0 && report.competitors?.competitors) {
    report.competitors.competitors.forEach((c) => {
      if (c.website) {
        const url = c.website.startsWith("http") ? c.website : `https://${c.website}`
        allSources.push({ url, section: "Competitors" })
      }
    })
  }

  if (allSources.length === 0) {
    return (
      <div className="px-4 py-4 text-[11px] text-[#555]">No sources available for this report.</div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
      {allSources.map((s, i) => {
        let domain = s.url
        try { domain = new URL(s.url).hostname } catch {}
        const truncatedUrl = s.url.length > 50 ? s.url.slice(0, 50) + "…" : s.url
        return (
          <div key={i} className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span
                className="text-[9px] font-bold rounded px-1 py-0.5 shrink-0"
                style={{ background: "var(--report-accent-dim)", color: "var(--report-orange)" }}
              >
                [{i + 1}]
              </span>
              <span className="text-[11px] font-semibold text-white">{domain}</span>
            </div>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] hover:underline pl-6"
              style={{ color: "var(--report-orange)" }}
            >
              {truncatedUrl}
            </a>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded self-start ml-6"
              style={{ background: "var(--report-accent-dim)", color: "var(--report-orange)" }}
            >
              {s.section}
            </span>
          </div>
        )
      })}
    </div>
  )
}
