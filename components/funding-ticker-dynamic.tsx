"use client"

import dynamic from "next/dynamic"
import { FundingTickerSkeleton } from "@/components/funding-ticker-skeleton"

export const FundingTicker = dynamic(() => import("@/components/funding-ticker"), {
  ssr: false,
  loading: () => <FundingTickerSkeleton />,
})
