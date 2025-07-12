"use client"

import { SessionProvider } from "next-auth/react"
import { TabsProvider } from "@/hooks/use-tabs"
import type { Session } from "next-auth"

type TProps = {
  children: React.ReactNode
  session: Session | null
}

export function ClientSessionProvider({ children, session }: TProps) {
  return (
    <SessionProvider session={session}>
      <TabsProvider>
        {children}
      </TabsProvider>
    </SessionProvider>
  )
}
