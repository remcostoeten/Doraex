"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2, Edit, Save, X } from "lucide-react"
import { useConnections } from "@/hooks/use-connections"
import { useToast } from "@/hooks/use-toast"

interface SchemaEditorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tableName?: string
  onSchemaChange?: () => void
}

interface ColumnFormData {
  name: string
  type: string
  nullable: boolean
  primary: boolean
  defaultValue: string
  autoIncrement: boolean
}

const SQLITE_TYPES = [
  "INTEGER",
  "TEXT",
  "REAL",
  "BLOB",
  "NUMERIC",
  "VARCHAR(255)",
  "VARCHAR(100)",
  "BOOLEAN",
  "DATE",
  "DATETIME",
  "TIMESTAMP",
]

export function SchemaEditorModal({ open, onOpenChange, tableName, onSchemaChange }: SchemaEditorModalProps) {
  const { activeConnection, refreshTables } = useConnections()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("columns")
  const [isLoading, setIsLoading] = useState(false)

  // Table form state
  const [newTableName, setNewTableName] = useState("")
  const [tableColumns, setTableColumns] = useState<ColumnFormData[]>([
    { name: "id", type: "INTEGER", nullable: false, primary: true, defaultValue: "", autoIncrement: true },
  ])

  // Column form state
  const [newColumn, setNewColumn] = useState<ColumnFormData>({
    name: "",
    type: "TEXT",
    nullable: true,
    primary: false,
    defaultValue: "",
    autoIncrement: false,
  })

  // Edit states
  const [editingColumn, setEditingColumn] = useState<string | null>(null)
  const [editColumnData, setEditColumnData] = useState<ColumnFormData | null>(null)
  const [newTableNameForRename, setNewTableNameForRename] = useState(tableName || "")

  const currentTable = activeConnection?.tables?.find((table) => table.name === tableName)

  const handleCreateTable = async () => {
    if (!activeConnection || !newTableName.trim() || tableColumns.length === 0) {
      toast({
        title: "Error",
        description: "Please provide a table name and at least one column",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/connections/${activeConnection.id}/schema/tables`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-connection-config": JSON.stringify({
            type: activeConnection.type,
            filePath: activeConnection.filePath,
            fileName: activeConnection.fileName,
          }),
        },
        body: JSON.stringify({
          name: newTableName,
          columns: tableColumns,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create table")
      }

      toast({
        title: "Success",
        description: "Table created successfully",
      })

      await refreshTables(activeConnection.id)
      onSchemaChange?.()
      onOpenChange(false)

      // Reset form
      setNewTableName("")
      setTableColumns([
        { name: "id", type: "INTEGER", nullable: false, primary: true, defaultValue: "", autoIncrement: true },
      ])
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create table",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRenameTable = async () => {
    if (!activeConnection || !tableName || !newTableNameForRename.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/connections/${activeConnection.id}/schema/tables/${tableName}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-connection-config": JSON.stringify({
            type: activeConnection.type,
            filePath: activeConnection.filePath,
            fileName: activeConnection.fileName,
          }),
        },
        body: JSON.stringify({
          newName: newTableNameForRename,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to rename table")
      }

      toast({
        title: "Success",
        description: "Table renamed successfully",
      })

      await refreshTables(activeConnection.id)
      onSchemaChange?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to rename table",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTable = async () => {
    if (!activeConnection || !tableName) return

    if (!confirm(`Are you sure you want to delete the table "${tableName}"? This action cannot be undone.`)) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/connections/${activeConnection.id}/schema/tables/${tableName}`, {
        method: "DELETE",
        headers: {
          "x-connection-config": JSON.stringify({
            type: activeConnection.type,
            filePath: activeConnection.filePath,
            fileName: activeConnection.fileName,
          }),
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete table")
      }

      toast({
        title: "Success",
        description: "Table deleted successfully",
      })

      await refreshTables(activeConnection.id)
      onSchemaChange?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete table",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddColumn = async () => {
    if (!activeConnection || !tableName || !newColumn.name.trim()) {
      toast({
        title: "Error",
        description: "Please provide a column name",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/connections/${activeConnection.id}/schema/tables/${tableName}/columns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-connection-config": JSON.stringify({
            type: activeConnection.type,
            filePath: activeConnection.filePath,
            fileName: activeConnection.fileName,
          }),
        },
        body: JSON.stringify({
          name: newColumn.name,
          type: newColumn.type,
          nullable: newColumn.nullable,
          primary: newColumn.primary,
          defaultValue: newColumn.defaultValue,
          autoIncrement: newColumn.autoIncrement,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add column")
      }

      toast({
        title: "Success",
        description: "Column added successfully",
      })

      await refreshTables(activeConnection.id)
      onSchemaChange?.()

      // Reset form
      setNewColumn({
        name: "",
        type: "TEXT",
        nullable: true,
        primary: false,
        defaultValue: "",
        autoIncrement: false,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add column",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditColumn = async (columnName: string) => {
    if (!activeConnection || !tableName || !editColumnData) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/connections/${activeConnection.id}/schema/tables/${tableName}/columns/${columnName}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-connection-config": JSON.stringify({
              type: activeConnection.type,
              filePath: activeConnection.filePath,
              fileName: activeConnection.fileName,
            }),
          },
          body: JSON.stringify({
            name: editColumnData.name,
            type: editColumnData.type,
            nullable: editColumnData.nullable,
            primary: editColumnData.primary,
            defaultValue: editColumnData.defaultValue,
            autoIncrement: editColumnData.autoIncrement,
          }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to modify column")
      }

      toast({
        title: "Success",
        description: "Column modified successfully",
      })

      await refreshTables(activeConnection.id)
      onSchemaChange?.()
      setEditingColumn(null)
      setEditColumnData(null)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to modify column",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteColumn = async (columnName: string) => {
    if (!activeConnection || !tableName) return

    if (!confirm(`Are you sure you want to delete the column "${columnName}"? This action cannot be undone.`)) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/connections/${activeConnection.id}/schema/tables/${tableName}/columns/${columnName}`,
        {
          method: "DELETE",
          headers: {
            "x-connection-config": JSON.stringify({
              type: activeConnection.type,
              filePath: activeConnection.filePath,
              fileName: activeConnection.fileName,
            }),
          },
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete column")
      }

      toast({
        title: "Success",
        description: "Column deleted successfully",
      })

      await refreshTables(activeConnection.id)
      onSchemaChange?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete column",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addColumnToNewTable = () => {
    setTableColumns([
      ...tableColumns,
      {
        name: "",
        type: "TEXT",
        nullable: true,
        primary: false,
        defaultValue: "",
        autoIncrement: false,
      },
    ])
  }

  const removeColumnFromNewTable = (index: number) => {
    if (tableColumns.length > 1) {
      setTableColumns(tableColumns.filter((_, i) => i !== index))
    }
  }

  const updateTableColumn = (index: number, field: keyof ColumnFormData, value: any) => {
    const updated = [...tableColumns]
    updated[index] = { ...updated[index], [field]: value }
    setTableColumns(updated)
  }

  if (activeConnection?.type !== "sqlite") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schema Editor</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Schema editing is only available for SQLite databases.</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{tableName ? `Edit Table: ${tableName}` : "Create New Table"}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="columns">{tableName ? "Manage Columns" : "Create Table"}</TabsTrigger>
            {tableName && <TabsTrigger value="table">Table Settings</TabsTrigger>}
          </TabsList>

          <TabsContent value="columns" className="space-y-4">
            {tableName ? (
              // Edit existing table columns
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Current Columns</h3>
                </div>

                <ScrollArea className="h-64 border rounded-md p-4">
                  <div className="space-y-2">
                    {currentTable?.columns?.map((column) => (
                      <div key={column.name} className="flex items-center justify-between p-3 border rounded-lg">
                        {editingColumn === column.name ? (
                          <div className="flex-1 grid grid-cols-6 gap-2 items-center">
                            <Input
                              value={editColumnData?.name || ""}
                              onChange={(e) =>
                                setEditColumnData((prev) => (prev ? { ...prev, name: e.target.value } : null))
                              }
                              placeholder="Column name"
                            />
                            <Select
                              value={editColumnData?.type || ""}
                              onValueChange={(value) =>
                                setEditColumnData((prev) => (prev ? { ...prev, type: value } : null))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {SQLITE_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={!editColumnData?.nullable}
                                onCheckedChange={(checked) =>
                                  setEditColumnData((prev) => (prev ? { ...prev, nullable: !checked } : null))
                                }
                              />
                              <Label className="text-xs">Required</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={editColumnData?.primary || false}
                                onCheckedChange={(checked) =>
                                  setEditColumnData((prev) => (prev ? { ...prev, primary: !!checked } : null))
                                }
                              />
                              <Label className="text-xs">Primary</Label>
                            </div>
                            <Input
                              value={editColumnData?.defaultValue || ""}
                              onChange={(e) =>
                                setEditColumnData((prev) => (prev ? { ...prev, defaultValue: e.target.value } : null))
                              }
                              placeholder="Default"
                              className="text-xs"
                            />
                            <div className="flex gap-1">
                              <Button size="sm" onClick={() => handleEditColumn(column.name)} disabled={isLoading}>
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingColumn(null)
                                  setEditColumnData(null)
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{column.name}</span>
                                <Badge variant="secondary">{column.type}</Badge>
                                {column.primary && <Badge variant="outline">PK</Badge>}
                                {!column.nullable && <Badge variant="outline">NOT NULL</Badge>}
                              </div>
                              {column.default && (
                                <p className="text-sm text-muted-foreground">Default: {column.default}</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingColumn(column.name)
                                  setEditColumnData({
                                    name: column.name,
                                    type: column.type,
                                    nullable: column.nullable,
                                    primary: column.primary,
                                    defaultValue: column.default || "",
                                    autoIncrement: false,
                                  })
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteColumn(column.name)}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Add New Column</h4>
                  <div className="grid grid-cols-6 gap-2 items-end">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={newColumn.name}
                        onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                        placeholder="Column name"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={newColumn.type}
                        onValueChange={(value) => setNewColumn({ ...newColumn, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SQLITE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={!newColumn.nullable}
                        onCheckedChange={(checked) => setNewColumn({ ...newColumn, nullable: !checked })}
                      />
                      <Label>Required</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={newColumn.primary}
                        onCheckedChange={(checked) => setNewColumn({ ...newColumn, primary: !!checked })}
                      />
                      <Label>Primary</Label>
                    </div>
                    <div>
                      <Label>Default</Label>
                      <Input
                        value={newColumn.defaultValue}
                        onChange={(e) => setNewColumn({ ...newColumn, defaultValue: e.target.value })}
                        placeholder="Default value"
                      />
                    </div>
                    <Button onClick={handleAddColumn} disabled={isLoading}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Create new table
              <div className="space-y-4">
                <div>
                  <Label>Table Name</Label>
                  <Input
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder="Enter table name"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Columns</Label>
                    <Button size="sm" onClick={addColumnToNewTable}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Column
                    </Button>
                  </div>

                  <ScrollArea className="h-64 border rounded-md p-4">
                    <div className="space-y-2">
                      {tableColumns.map((column, index) => (
                        <div key={index} className="grid grid-cols-7 gap-2 items-center p-2 border rounded">
                          <Input
                            value={column.name}
                            onChange={(e) => updateTableColumn(index, "name", e.target.value)}
                            placeholder="Name"
                          />
                          <Select
                            value={column.type}
                            onValueChange={(value) => updateTableColumn(index, "type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SQLITE_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex items-center space-x-1">
                            <Checkbox
                              checked={!column.nullable}
                              onCheckedChange={(checked) => updateTableColumn(index, "nullable", !checked)}
                            />
                            <Label className="text-xs">Required</Label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Checkbox
                              checked={column.primary}
                              onCheckedChange={(checked) => updateTableColumn(index, "primary", checked)}
                            />
                            <Label className="text-xs">Primary</Label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Checkbox
                              checked={column.autoIncrement}
                              onCheckedChange={(checked) => updateTableColumn(index, "autoIncrement", checked)}
                              disabled={!column.primary || !column.type.toUpperCase().includes("INTEGER")}
                            />
                            <Label className="text-xs">Auto Inc</Label>
                          </div>
                          <Input
                            value={column.defaultValue}
                            onChange={(e) => updateTableColumn(index, "defaultValue", e.target.value)}
                            placeholder="Default"
                            className="text-xs"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeColumnFromNewTable(index)}
                            disabled={tableColumns.length === 1}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <Button onClick={handleCreateTable} disabled={isLoading} className="w-full">
                  Create Table
                </Button>
              </div>
            )}
          </TabsContent>

          {tableName && (
            <TabsContent value="table" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Rename Table</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={newTableNameForRename}
                      onChange={(e) => setNewTableNameForRename(e.target.value)}
                      placeholder="New table name"
                    />
                    <Button onClick={handleRenameTable} disabled={isLoading}>
                      Rename
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-destructive">Danger Zone</Label>
                  <div className="mt-2">
                    <Button variant="destructive" onClick={handleDeleteTable} disabled={isLoading}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Table
                    </Button>
                    <p className="text-sm text-muted-foreground mt-1">
                      This action cannot be undone. All data in this table will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
