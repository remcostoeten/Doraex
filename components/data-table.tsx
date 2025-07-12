"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  MoreHorizontal,
  ArrowUpDown,
  Edit,
  Trash2,
  Database,
} from "lucide-react"

interface DataTableProps {
  tableName: string
}

export function DataTable({ tableName }: DataTableProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(50)

  // Empty data - will be populated from real database connections
  const data = {
    columns: [],
    rows: [],
  }

  const totalPages = Math.ceil(data.rows.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentRows = data.rows.slice(startIndex, endIndex)

  const handleCellEdit = (rowIndex: number, column: string, value: string) => {
    // TODO: Implement real database update
    console.log(`Editing ${column} in row ${rowIndex} to: ${value}`)
    setEditingCell(null)
  }

  if (data.columns.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Button size="sm" disabled>
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No data available</h3>
            <p className="text-muted-foreground mb-4">
              {tableName ? `Table "${tableName}" has no data or doesn't exist.` : "Select a table to view its data."}
            </p>
            <p className="text-sm text-muted-foreground">Connect to a database to start exploring your data.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Row
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {startIndex + 1}-{Math.min(endIndex, data.rows.length)} of {data.rows.length} rows
          </span>
        </div>
      </div>

      {/* Table */}
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              {data.columns.map((column: string) => (
                <TableHead key={column} className="min-w-32">
                  <Button variant="ghost" className="h-8 p-0 font-medium">
                    {column}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              ))}
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRows.map((row: any, rowIndex: number) => (
              <TableRow key={rowIndex} className="hover:bg-muted/50">
                <TableCell className="font-mono text-xs text-muted-foreground">{startIndex + rowIndex + 1}</TableCell>
                {data.columns.map((column: string) => {
                  const cellKey = `${rowIndex}-${column}`
                  const isEditing = editingCell === cellKey
                  const value = row[column]

                  return (
                    <TableCell
                      key={column}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => setEditingCell(cellKey)}
                    >
                      {isEditing ? (
                        <Input
                          defaultValue={String(value)}
                          className="h-8"
                          autoFocus
                          onBlur={(e) => handleCellEdit(rowIndex, column, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleCellEdit(rowIndex, column, e.currentTarget.value)
                            }
                            if (e.key === "Escape") {
                              setEditingCell(null)
                            }
                          }}
                        />
                      ) : (
                        <span>{String(value)}</span>
                      )}
                    </TableCell>
                  )
                })}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Row
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Row
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Pagination */}
      {data.rows.length > 0 && (
        <div className="flex items-center justify-between p-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span>Page</span>
            <Input
              type="number"
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="w-16 h-8 text-center"
              min={1}
              max={totalPages}
            />
            <span>of {totalPages}</span>
          </div>
        </div>
      )}
    </div>
  )
}
