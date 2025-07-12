"use client"

import { MotionSidebar, MotionListItem, MotionCollapsible } from "@/lib/motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Database, Table, Search, Plus } from "lucide-react"
import { useState } from "react"
import { useConnections } from "@/hooks/use-connections"
import { useTabs } from "@/hooks/use-tabs"
import { NoConnectionState, NoTablesState, NoSearchResultsState } from "@/components/empty-states"
import { ConnectionCreationModal } from "@/components/connection-creation-modal"

interface ProfessionalSidebarProps {
  activeSection: string
}

export function ProfessionalSidebar({ activeSection }: ProfessionalSidebarProps) {
  const [expandedDatabases, setExpandedDatabases] = useState<string[]>(["main"])
  const [searchTerm, setSearchTerm] = useState("")
  const { activeConnection } = useConnections()
  const { openTab, activeTabId, tabs } = useTabs()
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false)

  // Only show sidebar for tables section
  if (activeSection !== "tables") {
    return null
  }

  const toggleDatabase = (dbName: string) => {
    setExpandedDatabases((prev) => (prev.includes(dbName) ? prev.filter((name) => name !== dbName) : [...prev, dbName]))
  }

  const filteredTables =
    activeConnection?.tables?.filter((table) => table.name.toLowerCase().includes(searchTerm.toLowerCase())) || []

  const hasSearchResults = searchTerm && filteredTables.length === 0
  const hasTables = activeConnection?.tables && activeConnection.tables.length > 0

  const handleTableSelect = (tableName: string) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        openTab({
          title: tableName,
          type: "table",
          tableName,
          isClosable: true,
        })
      })
    } else {
      openTab({
        title: tableName,
        type: "table",
        tableName,
        isClosable: true,
      })
    }
  }

  const isTableActive = (tableName: string) => {
    const activeTab = tabs.find((tab) => tab.id === activeTabId)
    return activeTab?.type === "table" && activeTab?.tableName === tableName
  }

  return (
    <MotionSidebar
      isExpanded={activeSection === "tables"}
      className="w-64 bg-background border-r border-border flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Tables</h2>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsConnectionModalOpen(true)}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tables"
            className="pl-9 h-8 bg-muted/30 border-border text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Database tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {!activeConnection ? (
            <div className="h-64 flex items-center justify-center">
              <NoConnectionState onAddConnection={() => setIsConnectionModalOpen(true)} />
            </div>
          ) : hasSearchResults ? (
            <div className="h-64 flex items-center justify-center">
              <NoSearchResultsState searchTerm={searchTerm} />
            </div>
          ) : !hasTables ? (
            <div className="h-64 flex items-center justify-center">
              <NoTablesState />
            </div>
          ) : (
            <Collapsible open={expandedDatabases.includes("main")} onOpenChange={() => toggleDatabase("main")}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-7 px-2 mb-1 text-sm font-normal hover:bg-muted/50"
                >
                  {expandedDatabases.includes("main") ? (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                  <Database className="h-4 w-4 mr-2" />
                  <span className="flex-1 text-left">{activeConnection.database || activeConnection.name}</span>
                  <Badge variant="outline" className="text-xs px-1">
                    {activeConnection.tables?.length || 0}
                  </Badge>
                </Button>
              </CollapsibleTrigger>
              <MotionCollapsible isOpen={expandedDatabases.includes("main")} className="ml-3">
                {filteredTables.map((table) => (
                  <MotionListItem
                    key={table.name}
                    layoutId={`table-${table.name}`}
                    isActive={isTableActive(table.name)}
                    className="mb-1"
                  >
                    <Button
                      variant={isTableActive(table.name) ? "secondary" : "ghost"}
                      className="w-full justify-start h-7 px-2 text-sm font-normal hover:bg-muted/50"
                      onClick={() => handleTableSelect(table.name)}
                    >
                      <Table className="h-4 w-4 mr-2" />
                      <span className="flex-1 text-left">{table.name}</span>
                      {table.rowCount && (
                        <Badge variant="outline" className="text-xs px-1">
                          {table.rowCount.toLocaleString()}
                        </Badge>
                      )}
                    </Button>
                  </MotionListItem>
                ))}
              </MotionCollapsible>
            </Collapsible>
          )}
        </div>
      </ScrollArea>

      {/* Connection info footer */}
      {activeConnection && (
        <div className="p-3 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center justify-between">
              <span>Connection:</span>
              <span className="font-medium">{activeConnection.type.toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tables:</span>
              <span className="font-medium">{activeConnection.tables?.length || 0}</span>
            </div>
          </div>
        </div>
      )}
      <ConnectionCreationModal open={isConnectionModalOpen} onOpenChange={setIsConnectionModalOpen} />
    </MotionSidebar>
  )
}
