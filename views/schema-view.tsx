"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Key, Plus, Edit, Database, Settings } from "lucide-react"
import { useConnections } from "@/hooks/use-connections"
import { SchemaEditorModal } from "@/components/schema-editor-modal"

interface SchemaViewProps {
  tableName: string
}

export function SchemaView({ tableName }: SchemaViewProps) {
  const { activeConnection } = useConnections()
  const [isSchemaEditorOpen, setIsSchemaEditorOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const currentTable = activeConnection?.tables?.find((table) => table.name === tableName)
  const schema = currentTable?.columns || []

  const handleSchemaChange = () => {
    setRefreshKey((prev) => prev + 1)
  }

  if (schema.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Table Structure</h3>
          <div className="flex gap-2">
            {activeConnection?.type === "sqlite" && (
              <>
                <Button size="sm" onClick={() => setIsSchemaEditorOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsSchemaEditorOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Table
                </Button>
              </>
            )}
            {activeConnection?.type !== "sqlite" && (
              <>
                <Button size="sm" disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Table
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No schema available</h3>
            <p className="text-muted-foreground mb-4">
              {tableName ? `Table "${tableName}" schema is not available.` : "Select a table to view its structure."}
            </p>
            <p className="text-sm text-muted-foreground">Connect to a database to explore table schemas.</p>
          </div>
        </div>

        <SchemaEditorModal
          open={isSchemaEditorOpen}
          onOpenChange={setIsSchemaEditorOpen}
          tableName={tableName}
          onSchemaChange={handleSchemaChange}
        />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Table Structure</h3>
        <div className="flex gap-2">
          {activeConnection?.type === "sqlite" ? (
            <>
              <Button size="sm" onClick={() => setIsSchemaEditorOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Column
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsSchemaEditorOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Schema
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" disabled>
                <Plus className="h-4 w-4 mr-2" />
                Add Column
              </Button>
              <Button variant="outline" size="sm" disabled>
                <Edit className="h-4 w-4 mr-2" />
                Edit Table
              </Button>
            </>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Column</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Nullable</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Extra</TableHead>
              {activeConnection?.type === "sqlite" && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {schema.map((column) => (
              <TableRow key={column.name}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {column.primary && <Key className="h-4 w-4 text-yellow-500" />}
                    {column.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{column.type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={column.nullable ? "destructive" : "default"}>{column.nullable ? "YES" : "NO"}</Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">{column.default || "-"}</TableCell>
                <TableCell>
                  {column.primary && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      PRIMARY
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{/* Auto increment info would go here if available */}-</TableCell>
                {activeConnection?.type === "sqlite" && (
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setIsSchemaEditorOpen(true)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <div className="p-4 border-t bg-muted/20">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Engine:</span> SQLite
          </div>
          <div>
            <span className="font-medium">Collation:</span> -
          </div>
          <div>
            <span className="font-medium">Rows:</span> {currentTable?.rowCount || 0}
          </div>
          <div>
            <span className="font-medium">Columns:</span> {schema.length}
          </div>
        </div>
      </div>

      <SchemaEditorModal
        open={isSchemaEditorOpen}
        onOpenChange={setIsSchemaEditorOpen}
        tableName={tableName}
        onSchemaChange={handleSchemaChange}
      />
    </div>
  )
}
