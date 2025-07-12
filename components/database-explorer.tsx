"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Database, TableIcon, Eye, RefreshCw, Plus, ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react"
import { useConnections } from "@/hooks/use-connections"
import { ConnectionCreationModal } from "@/components/connection-creation-modal"
import { SchemaEditorModal } from "@/components/schema-editor-modal"

interface DatabaseExplorerProps {
  onTableSelect: (tableName: string) => void
  selectedTable?: string
}

export function DatabaseExplorer({ onTableSelect, selectedTable }: DatabaseExplorerProps) {
  const { activeConnection, refreshTables, isLoading } = useConnections()
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false)
  const [isSchemaEditorOpen, setIsSchemaEditorOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["tables"]))

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const handleRefresh = async () => {
    if (activeConnection) {
      await refreshTables(activeConnection.id)
    }
  }

  const handleSchemaChange = () => {
    if (activeConnection) {
      refreshTables(activeConnection.id)
    }
  }

  if (!activeConnection) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Database Explorer</h3>
          <Button size="sm" onClick={() => setIsConnectionModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Connect
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No database connected</h3>
            <p className="text-muted-foreground mb-4">Connect to a database to explore its structure.</p>
            <Button onClick={() => setIsConnectionModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Connection
            </Button>
          </div>
        </div>

        <ConnectionCreationModal open={isConnectionModalOpen} onOpenChange={setIsConnectionModalOpen} />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">{activeConnection.name}</h3>
            <p className="text-xs text-muted-foreground">{activeConnection.type}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {activeConnection.type === "sqlite" && (
            <Button size="sm" variant="outline" onClick={() => setIsSchemaEditorOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Tables Section */}
          <div className="mb-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start p-2 h-auto"
              onClick={() => toggleSection("tables")}
            >
              {expandedSections.has("tables") ? (
                <ChevronDown className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              {expandedSections.has("tables") ? (
                <FolderOpen className="h-4 w-4 mr-2" />
              ) : (
                <Folder className="h-4 w-4 mr-2" />
              )}
              <span className="font-medium">Tables</span>
              <Badge variant="secondary" className="ml-auto">
                {activeConnection.tables?.length || 0}
              </Badge>
            </Button>

            {expandedSections.has("tables") && (
              <div className="ml-4 mt-1 space-y-1">
                {activeConnection.tables?.map((table) => (
                  <Button
                    key={table.name}
                    variant={selectedTable === table.name ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start p-2 h-auto"
                    onClick={() => onTableSelect(table.name)}
                  >
                    <TableIcon className="h-4 w-4 mr-2" />
                    <span className="flex-1 text-left">{table.name}</span>
                    {table.rowCount !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        {table.rowCount.toLocaleString()}
                      </Badge>
                    )}
                  </Button>
                ))}

                {(!activeConnection.tables || activeConnection.tables.length === 0) && (
                  <div className="text-center py-4 text-muted-foreground">
                    <TableIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tables found</p>
                    {activeConnection.type === "sqlite" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 bg-transparent"
                        onClick={() => setIsSchemaEditorOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Table
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Views Section */}
          <div className="mb-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start p-2 h-auto"
              onClick={() => toggleSection("views")}
            >
              {expandedSections.has("views") ? (
                <ChevronDown className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              {expandedSections.has("views") ? (
                <FolderOpen className="h-4 w-4 mr-2" />
              ) : (
                <Folder className="h-4 w-4 mr-2" />
              )}
              <span className="font-medium">Views</span>
              <Badge variant="secondary" className="ml-auto">
                0
              </Badge>
            </Button>

            {expandedSections.has("views") && (
              <div className="ml-4 mt-1">
                <div className="text-center py-4 text-muted-foreground">
                  <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No views found</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{activeConnection.connected ? "Connected" : "Disconnected"}</span>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${activeConnection.connected ? "bg-green-500" : "bg-red-500"}`} />
            <span>{activeConnection.type}</span>
          </div>
        </div>
      </div>

      <SchemaEditorModal
        open={isSchemaEditorOpen}
        onOpenChange={setIsSchemaEditorOpen}
        onSchemaChange={handleSchemaChange}
      />
    </div>
  )
}
