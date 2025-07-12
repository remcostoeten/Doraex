"use client"

import { useSession } from "next-auth/react"
import { AuthForm } from "@/components/auth-form"
import { ProfessionalIconSidebar } from "@/components/professional-icon-sidebar"
import { ProfessionalSidebar } from "@/components/professional-sidebar"
import { TabBar } from "@/components/tab-bar"
import { TabContent } from "@/components/tab-content"
import { useState } from "react"

export default function Home() {
  const { data: session, status } = useSession()
  const [activeSection, setActiveSection] = useState("tables")

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
    <div className="flex h-screen bg-background">
      {/* Icon Sidebar Navigation */}
      <ProfessionalIconSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      {/* Secondary Sidebar (only for tables section) */}
      <ProfessionalSidebar activeSection={activeSection} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Bar */}
        <TabBar />

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          <TabContent />
        </div>
      </div>
    </div>
  )
}
