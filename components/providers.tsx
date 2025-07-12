"use client"

import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'
import { ConnectionsProvider } from '@/hooks/use-connections'
import { TabsProvider } from '@/hooks/use-tabs'
import { Toaster } from 'sonner'
import { Session } from 'next-auth'

type TProps = { children: React.ReactNode; session: Session | null }

export function Providers({ children, session }: TProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider session={session}>
        <ConnectionsProvider>
          <TabsProvider>
            {children}
            <Toaster richColors />
          </TabsProvider>
        </ConnectionsProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
