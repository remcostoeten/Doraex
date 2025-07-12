"use client"

import { useSession } from "next-auth/react"
import { AuthForm } from "@/components/auth-form"
import { ProfessionalTopBar } from "@/components/professional-top-bar"
import { ProfessionalSidebar } from "@/components/professional-sidebar"
import { ProfessionalIconSidebar } from "@/components/professional-icon-sidebar"
import { TabContent } from "@/components/tab-content"
import { TabBar } from "@/components/tab-bar"
import { useTabs } from "@/hooks/use-tabs"
import { useState } from "react"

export default function Home() {
  const { data: session, status } = useSession()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { tabs, activeTabId, openTab, closeTab, setActiveTab } = useTabs()

  // Show loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show auth form if not authenticated
  if (!session) {
    return <AuthForm />
  }

  // Show main application if authenticated
  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarCollapsed ? (
        <ProfessionalIconSidebar
          onExpand={() => setSidebarCollapsed(false)}
          activeTab={activeTabId}
          onTabChange={setActiveTab}
        />
      ) : (
        <ProfessionalSidebar
          onCollapse={() => setSidebarCollapsed(true)}
          activeTab={activeTabId}
          onTabChange={setActiveTab}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <ProfessionalTopBar onAddTab={openTab} user={session.user} />

        <TabBar tabs={tabs} activeTab={activeTabId} onTabChange={setActiveTab} onTabClose={closeTab} />

        <div className="flex-1 overflow-hidden">
          <TabContent tabs={tabs} activeTab={activeTabId} onAddTab={openTab} />
        </div>
      </div>
    </div>
  )
}
