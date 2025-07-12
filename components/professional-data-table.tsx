"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Filter, Plus, MoreHorizontal, ChevronDown, RefreshCw, Edit, Trash2, X } from "lucide-react"
import { useConnections } from "@/hooks/use-connections"
import { NoConnectionState, EmptyState } from "@/components/empty-states"
import { ConnectionCreationModal } from "@/components/connection-creation-modal"

interface ProfessionalDataTableProps {
  tableName: string
}

export function ProfessionalDataTable({ tableName }: ProfessionalDataTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const { activeConnection } = useConnections()
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false)
  const [tableData, setTableData] = useState<{
    columns: string[]
    rows: any[]
    totalCount: number
  } | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(50)

  // Get the selected table data
  const selectedTableData = activeConnection?.tables?.find((table) => table.name === tableName)

  // Fetch real table data
  const fetchTableData = useCallback(async () => {
    if (!activeConnection || !tableName) return

    setIsLoadingData(true)
    try {
      const offset = (currentPage - 1) * pageSize

      let configHeaders = {}
      if (activeConnection.type === "sqlite") {
        configHeaders = {
          "x-connection-config": JSON.stringify({
            type: activeConnection.type,
            filePath: activeConnection.filePath,
            fileName: activeConnection.fileName,
          }),
        }
      } else {
        configHeaders = {
          "x-connection-config": JSON.stringify({
            type: activeConnection.type,
            host: activeConnection.host,
            port: activeConnection.port,
            database: activeConnection.database,
            username: activeConnection.username,
            password: activeConnection.password,
            url: activeConnection.url,
            ssl: activeConnection.ssl,
          }),
        }
      }

      const response = await fetch(
        `/api/connections/${activeConnection.id}/tables/${tableName}/data?limit=${pageSize}&offset=${offset}`,
        { headers: configHeaders },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch table data")
      }

      const data = await response.json()
      setTableData(data)
    } catch (error) {
      console.error("Error fetching table data:", error)
      setTableData(null)
    } finally {
      setIsLoadingData(false)
    }
  }, [activeConnection, tableName, currentPage, pageSize])

  // Fetch real table data
  useEffect(() => {
    if (activeConnection && tableName && selectedTableData) {
      fetchTableData()
    }
  }, [activeConnection, tableName, selectedTableData, fetchTableData])

  // Replace the mockRows usage with real data
  const displayRows = tableData?.rows || []
  const totalPages = Math.ceil((tableData?.totalCount || 0) / pageSize)

  // Mock row data based on table structure
  const generateMockRows = () => {
    if (!selectedTableData?.columns) return []

    const mockRows = []
    const rowCount = Math.min(selectedTableData.rowCount || 5, 20) // Show max 20 rows

    for (let i = 0; i < rowCount; i++) {
      const row: any = { _id: `row_${i}` }

      selectedTableData.columns.forEach((column) => {
        switch (column.type.toLowerCase()) {
          case "integer":
          case "bigint":
            row[column.name] = column.primary ? i + 1 : Math.floor(Math.random() * 1000)
            break
          case "text":
          case "varchar(255)":
          case "varchar(100)":
            if (column.name.includes("email")) {
              row[column.name] = `user${i + 1}@example.com`
            } else if (column.name.includes("name")) {
              row[column.name] = `User ${i + 1}`
            } else if (column.primary) {
              row[column.name] = `${tableName}_${i + 1}_${Math.random().toString(36).substr(2, 9)}`
            } else {
              row[column.name] = `Sample text ${i + 1}`
            }
            break
          case "timestamp":
            row[column.name] = new Date(Date.now() - Math.random() * 10000000000)
              .toISOString()
              .slice(0, 19)
              .replace("T", " ")
            break
          default:
            row[column.name] = `Value ${i + 1}`
        }
      })

      mockRows.push(row)
    }

    return mockRows
  }

  const mockRows = generateMockRows()

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))
  }

  const toggleAllRows = () => {
    setSelectedRows((prev) => (prev.length === mockRows.length ? [] : mockRows.map((row) => row._id)))
  }

  if (!activeConnection) {
    return (
      <>
        <NoConnectionState onAddConnection={() => setIsConnectionModalOpen(true)} />
        <ConnectionCreationModal open={isConnectionModalOpen} onOpenChange={setIsConnectionModalOpen} />
      </>
    )
  }

  if (!selectedTableData) {
    return (
      <EmptyState
        icon={
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔍</span>
            </div>
          </div>
        }
        title="Table Not Found"
        description={`The table "${tableName}" doesn't exist in the current database or might have been deleted.`}
      />
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with tabs */}
      <div className="border-b border-border">
        <div className="flex items-center gap-1 px-4 py-2">
          <Button variant="ghost" size="sm" className="h-8 px-3 text-sm">
            <X className="h-4 w-4 mr-2" />
            Get started
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-3 text-sm">
            Untitled Query
            <div className="w-2 h-2 bg-primary rounded-full ml-2" />
          </Button>
          <Button variant="secondary" size="sm" className="h-8 px-3 text-sm font-medium">
            {tableName}
            <X className="h-4 w-4 ml-2" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-8 px-3 text-sm">
            <Filter className="h-4 w-4 mr-2" />
            Add filters
          </Button>
          {selectedTableData.rowCount && (
            <Badge variant="outline" className="text-xs">
              {selectedTableData.rowCount.toLocaleString()} rows
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-sm">
                {tableName}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {activeConnection.tables?.map((table) => (
                <DropdownMenuItem key={table.name}>{table.name}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" className="h-8 px-3 text-sm">
            Add Row
          </Button>

          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full professional-table">
          <thead>
            <tr>
              <th className="w-12">
                <Checkbox
                  checked={selectedRows.length === displayRows.length && displayRows.length > 0}
                  onCheckedChange={toggleAllRows}
                />
              </th>
              {selectedTableData.columns?.map((column) => (
                <th key={column.name}>
                  <div className="flex items-center gap-2">
                    {column.name}
                    {column.primary && (
                      <Badge variant="outline" className="text-xs px-1">
                        PK
                      </Badge>
                    )}
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </div>
                </th>
              ))}
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, index) => (
              <tr key={row._id}>
                <td>
                  <Checkbox
                    checked={selectedRows.includes(row._id)}
                    onCheckedChange={() => toggleRowSelection(row._id)}
                  />
                </td>
                {selectedTableData.columns?.map((column) => (
                  <td key={column.name} className="font-mono text-sm">
                    {String(row[column.name])}
                  </td>
                ))}
                <td>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border text-sm text-muted-foreground">
        <div>
          Viewing 1-{displayRows.length} of {tableData?.totalCount || 0}
        </div>
        <div>{currentPage}</div>
      </div>
    </div>
  )
}
