import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign in · Verdict",
  description: "Access secure investment intelligence.",
}

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children
}
