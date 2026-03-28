/**
 * Viability uses a 0–10 scale (API + report UI). See `app/api/validate/route.ts`.
 */

export function viabilityFromVerdict(verdict: unknown): number | null {
  if (!verdict || typeof verdict !== "object") return null
  const v = verdict as Record<string, unknown>
  if (v.error === true) return null
  const raw = v.viabilityScore
  const n = typeof raw === "string" ? parseFloat(raw) : Number(raw)
  if (!Number.isNaN(n)) return Math.min(10, Math.max(0, Math.round(n * 10) / 10))
  const keys = ["demandScore", "founderFitScore", "defensibilityScore", "monetizationScore"]
  const dims = keys.map((k) => Number(v[k])).filter((x) => !Number.isNaN(x))
  if (dims.length === 4) {
    const avg = dims.reduce((a, b) => a + b, 0) / 4
    return Math.min(10, Math.max(0, Math.round(avg * 10) / 10))
  }
  return null
}

/** Prefer full report; fall back to the number stored on SavedReport. */
export function viabilityForLedgerEntry(report: object, storedViability: number): number {
  const fromReport = viabilityFromVerdict((report as { verdict?: unknown }).verdict)
  if (fromReport !== null) return fromReport
  return storedViability
}

/** Persisted score when saving the report to the ledger (avoid treating “missing” as 0). */
export function viabilityWhenSaving(verdict: unknown): number {
  return viabilityFromVerdict(verdict) ?? 5
}
