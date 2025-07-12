"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/data-table"
import { SchemaView } from "@/components/schema-view"
import { SqlEditor } from "@/components/sql-editor"
import { ExportImport } from "@/components/export-import"
import { AnalyticsView } from "@/components/analytics-view"
import { SettingsView } from "@/components/settings-view"
import { HomeView } from "@/components/home-view"

interface MainContentProps {
  selectedTable: string
  activeTab: string
  onTabChange: (tab: string) => void
  activeSection: string
  connectedDatabases: any[]
  onDatabasesChange: (databases: any[]) => void
}

export function MainContent({
  selectedTable,
  activeTab,
  onTabChange,
  activeSection,
  connectedDatabases,
  onDatabasesChange,
}: MainContentProps) {
  // Handle home section
  if (activeSection === "home") {
    return <HomeView connectedDatabases={connectedDatabases} onDatabasesChange={onDatabasesChange} />
  }

  // For SQL Editor and other single-view sections, don't show tabs
  if (activeSection === "sql") {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b px-4 py-3">
          <h1 className="text-xl font-semibold">SQL Editor</h1>
          <p className="text-sm text-muted-foreground">Write and execute SQL queries</p>
        </div>
        <SqlEditor />
      </div>
    )
  }

  if (activeSection === "analytics") {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b px-4 py-3">
          <h1 className="text-xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Database insights and performance metrics</p>
        </div>
        <AnalyticsView />
      </div>
    )
  }

  if (activeSection === "settings") {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b px-4 py-3">
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your database connections and preferences</p>
        </div>
        <SettingsView />
      </div>
    )
  }

  // Default tables view with tabs
  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-4 py-2">
        <h1 className="text-xl font-semibold capitalize">{selectedTable}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2 w-fit">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="export">Export/Import</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="browse" className="h-full m-0">
            <DataTable tableName={selectedTable} />
          </TabsContent>

          <TabsContent value="structure" className="h-full m-0">
            <SchemaView tableName={selectedTable} />
          </TabsContent>

          <TabsContent value="export" className="h-full m-0">
            <ExportImport tableName={selectedTable} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
