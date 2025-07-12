"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Play, Save, Clock } from "lucide-react"
import { NoQueryResultsState, NoConnectionState } from "@/components/empty-states"
import { useConnections } from "@/hooks/use-connections"
import { ConnectionCreationModal } from "@/components/connection-creation-modal"

export function ProfessionalQueryEditor() {
  const [query, setQuery] = useState("SELECT * FROM sessions LIMIT 10;")
  const [isExecuting, setIsExecuting] = useState(false)
  const [hasResults, setHasResults] = useState(false)
  const { activeConnection } = useConnections()
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false)

  const executeQuery = async () => {
    setIsExecuting(true)
    // Simulate query execution
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsExecuting(false)
    setHasResults(false) // For now, no real results
  }

  if (!activeConnection) {
    return (
      <>
        <NoConnectionState onAddConnection={() => setIsConnectionModalOpen(true)} />
        <ConnectionCreationModal open={isConnectionModalOpen} onOpenChange={setIsConnectionModalOpen} />
      </>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">SQL Query</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Clock className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button variant="ghost" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button size="sm" onClick={executeQuery} disabled={isExecuting}>
              <Play className="h-4 w-4 mr-2" />
              {isExecuting ? "Running..." : "Run Query"}
            </Button>
          </div>
        </div>
      </div>

      {/* Query Editor */}
      <div className="flex-1 p-4">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your SQL query here..."
          className="h-full font-mono text-sm resize-none bg-muted/30"
        />
      </div>

      {/* Results */}
      <div className="border-t border-border flex-1">{!hasResults && <NoQueryResultsState />}</div>
    </div>
  )
}
