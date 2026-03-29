"use client"

export function CardShell({
  sectionNum,
  title,
  confidence,
  onEdit,
  children,
  dangerBorder,
  anchorId,
  showConfidencePill = true,
}: {
  sectionNum?: string
  title: string
  confidence?: string
  onEdit?: () => void
  children: React.ReactNode
  dangerBorder?: boolean
  anchorId?: string
  showConfidencePill?: boolean
}) {
  const heading = sectionNum ? `${sectionNum} | ${title.toUpperCase()}` : title
  return (
    <div
      id={anchorId}
      className={`mb-4 flex flex-col rounded-2xl border border-[#1e1e1e] bg-[#111] p-6 print:break-inside-avoid ${
        dangerBorder ? "ring-1 ring-red-500/25" : ""
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-white">{heading}</span>
      </div>
      {confidence && showConfidencePill ? (
        <div className="-mt-2 mb-4">
          <span className="inline-block rounded-full border border-[#2a2a2a] px-3 py-1 text-[10px] text-[#666]">
            CONFIDENCE · {confidence.toUpperCase()}
          </span>
        </div>
      ) : null}
      {children}
    </div>
  )
}
