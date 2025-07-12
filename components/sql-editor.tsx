"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Play, Save, History, Download, Database } from "lucide-react"

export function SqlEditor() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState("")

  // Mock query execution
  const executeQuery = async () => {
    setIsExecuting(true)
    setError("")

    try {
      // TODO: Replace with actual database query execution
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For now, just clear results since we have no real data
      setResults([])
    } catch (err) {
      setError("No database connected. Please connect to a database first.")
    } finally {
      setIsExecuting(false)
    }
  }

  const queryHistory: string[] = []

  return (
    <div className="h-full flex flex-col">
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={60} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">SQL Editor</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={queryHistory.length === 0}>
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
                <Button variant="outline" size="sm" disabled={!query.trim()}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button size="sm" onClick={executeQuery} disabled={isExecuting || !query.trim()}>
                  <Play className="h-4 w-4 mr-2" />
                  {isExecuting ? "Executing..." : "Execute"}
                </Button>
              </div>
            </div>

            <div className="flex-1 p-4">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your SQL query here...

Example:
SELECT * FROM users LIMIT 10;

Connect to a database to start querying your data."
                className="h-full font-mono text-sm resize-none"
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={40} minSize={20}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Results</h3>
              {results.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-sm text-muted-foreground">{results.length} rows returned</span>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1">
              {error ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-medium">{error}</p>
                  </div>
                </div>
              ) : results.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(results[0]).map((column) => (
                        <TableHead key={column}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <TableCell key={cellIndex} className="font-mono text-sm">
                            {String(value)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium mb-2">Ready to execute queries</p>
                    <p className="text-sm">Connect to a database and write a query to see results</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
