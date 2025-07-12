"use client"

import { useTabs } from "@/hooks/use-tabs"
import { ProfessionalDataTable } from "@/components/professional-data-table"
import { ProfessionalQueryEditor } from "@/components/professional-query-editor"
import { HomeView } from "@/views/home-view"
import { ProfileView } from "@/views/profile-view"
import { EmptyAnalyticsState, EmptySchemaState, EmptySettingsState } from "@/components/empty-states"

export function TabContent() {
  const { tabs, activeTabId } = useTabs()

  const activeTab = tabs.find((tab) => tab.id === activeTabId)

  if (!activeTab) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">No active tab</h3>
          <p className="text-muted-foreground">Open a table or create a new query to get started</p>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab.type) {
      case "home":
        return <HomeView />
      case "table":
        return <ProfessionalDataTable tableName={activeTab.tableName || ""} />
      case "query":
        return <ProfessionalQueryEditor />
      case "schema":
        return <EmptySchemaState />
      case "analytics":
        return <EmptyAnalyticsState />
      case "settings":
        return <EmptySettingsState />
      case "profile":
        return <ProfileView />
      default:
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Unknown tab type</h3>
              <p className="text-muted-foreground">This tab type is not supported</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="h-full" style={{ viewTransitionName: `content-${activeTab.id}` }}>
      {renderTabContent()}
    </div>
  )
}
