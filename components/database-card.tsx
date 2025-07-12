"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Database, CheckCircle, XCircle, Edit, Trash2, MoreHorizontal, Zap } from "lucide-react"

interface DatabaseCardProps {
  database: {
    id: string
    name: string
    type: string
    connected: boolean
    lastConnected: string
    host?: string
    url?: string
  }
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function DatabaseCard({ database, onEdit, onDelete }: DatabaseCardProps) {
  const getStatusColor = (connected: boolean) => {
    return connected
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 oled:bg-green-900/20 oled:text-green-400"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 oled:bg-red-900/20 oled:text-red-400"
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "turso":
        return <Zap className="h-5 w-5" />
      default:
        return <Database className="h-5 w-5" />
    }
  }

  return (
    <div className="relative group outerbase-card">
      {/* Outerbase-style circuit board pattern overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 400 250"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main circuit paths - similar to Outerbase design */}

          {/* Top horizontal line from right */}
          <path d="M 350 40 L 280 40" className="outerbase-line" />

          {/* Vertical drop */}
          <path d="M 280 40 L 280 70" className="outerbase-line" />

          {/* Horizontal to left */}
          <path d="M 280 70 L 220 70" className="outerbase-line" />

          {/* Vertical drop */}
          <path d="M 220 70 L 220 100" className="outerbase-line" />

          {/* Horizontal to right */}
          <path d="M 220 100 L 300 100" className="outerbase-line" />

          {/* Vertical drop */}
          <path d="M 300 100 L 300 130" className="outerbase-line" />

          {/* Final horizontal */}
          <path d="M 300 130 L 350 130" className="outerbase-line" />

          {/* Additional branch */}
          <path d="M 250 100 L 250 160 L 320 160" className="outerbase-line" />

          {/* Corner connectors */}
          <rect x="278" y="38" width="4" height="4" rx="1" className="outerbase-corner" />
          <rect x="278" y="68" width="4" height="4" rx="1" className="outerbase-corner" />
          <rect x="218" y="68" width="4" height="4" rx="1" className="outerbase-corner" />
          <rect x="218" y="98" width="4" height="4" rx="1" className="outerbase-corner" />
          <rect x="298" y="98" width="4" height="4" rx="1" className="outerbase-corner" />
          <rect x="298" y="128" width="4" height="4" rx="1" className="outerbase-corner" />
          <rect x="248" y="98" width="4" height="4" rx="1" className="outerbase-corner" />
          <rect x="248" y="158" width="4" height="4" rx="1" className="outerbase-corner" />

          {/* Circuit nodes */}
          <circle cx="280" cy="55" r="2" className="outerbase-node" />
          <circle cx="220" cy="85" r="2" className="outerbase-node" />
          <circle cx="300" cy="115" r="2" className="outerbase-node" />
          <circle cx="250" cy="130" r="2" className="outerbase-node" />
          <circle cx="320" cy="145" r="2" className="outerbase-node" />
        </svg>
      </div>

      {/* Main card */}
      <div className="relative bg-card border border-border rounded-lg p-6 transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:bg-card/95">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg transition-colors duration-300 group-hover:bg-primary/10">
              {getTypeIcon(database.type)}
            </div>
            <div>
              <h3 className="font-semibold text-lg transition-colors duration-300 group-hover:text-primary">
                {database.name}
              </h3>
              <p className="text-sm text-muted-foreground">{database.type.toUpperCase()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(database.connected)}>
              {database.connected ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
              {database.connected ? "Connected" : "Disconnected"}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(database.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete?.(database.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {database.host && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Host:</span>
              <span className="font-mono text-xs truncate max-w-32">{database.host}</span>
            </div>
          )}
          {database.url && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">URL:</span>
              <span className="font-mono text-xs truncate max-w-32">{database.url}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last connected:</span>
            <span className="text-xs">{new Date(database.lastConnected).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
