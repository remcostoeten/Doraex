"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Database, Plus, Search, Play, Table, GitBranch, BarChart3, Settings } from "lucide-react"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`text-center max-w-sm mx-auto animate-slide-up ${className}`}>
      <div className="empty-state-gradient empty-state-pattern rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-transparent animate-pulse-glow" />
        <div className="relative z-10 animate-float">{icon}</div>
      </div>
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="empty-state-button">
          {action.label}
        </Button>
      )}
    </div>
  )
}
export function NoConnectionState({ onAddConnection }: { onAddConnection: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center py-16 px-6 bg-background">
      <div className="relative mb-8">
        {/* Subtle animated background glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 blur-xl animate-pulse" />

        {/* Main icon container with Outerbase styling */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 backdrop-blur-sm border border-border shadow-lg">
          <Database className="h-8 w-8 text-muted-foreground" />

          {/* Animated plus indicator */}
          <div className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-lg animate-bounce">
            <Plus className="h-3 w-3 text-primary-foreground" />
          </div>
        </div>
      </div>

      <div className="text-center max-w-md space-y-4">
        <h3 className="text-xl font-semibold text-foreground">No databases connected</h3>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Get started by connecting to your first database. We support
          <span className="text-foreground font-medium"> PostgreSQL</span>,
          <span className="text-foreground font-medium"> Turso</span>, and
          <span className="text-foreground font-medium"> SQLite</span> with smart clipboard parsing.
        </p>
      </div>

      <Button onClick={onAddConnection} className="mt-6 group relative inline-flex items-center gap-2" size="lg">
        <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
        <span>Add Database</span>
      </Button>

      {/* Subtle floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/3 left-1/4 h-1 w-1 rounded-full bg-primary animate-float" />
        <div className="absolute top-2/3 right-1/3 h-0.5 w-0.5 rounded-full bg-primary animate-float-delayed" />
        <div className="absolute bottom-1/3 left-1/2 h-1 w-1 rounded-full bg-primary animate-float-slow" />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-8px) rotate(180deg); opacity: 0.6; }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
          50% { transform: translateY(-6px) rotate(-180deg); opacity: 0.5; }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-4px) rotate(90deg); opacity: 0.6; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite 1s;
        }
        .animate-float-slow {
          animation: float-slow 5s ease-in-out infinite 2s;
        }
      `}</style>
    </div>
  )
}
export function NoTablesState() {
  return (
    <EmptyState
      icon={
        <div className="relative">
          <Table className="h-12 w-12 text-muted-foreground" />
          <div className="absolute inset-0 animate-rotate-slow">
            <div className="w-16 h-16 border-2 border-dashed border-primary/30 rounded-full" />
          </div>
        </div>
      }
      title="No Tables Found"
      description="This database doesn't contain any tables yet, or they might be loading. Try refreshing the connection."
    />
  )
}

export function NoSearchResultsState({ searchTerm }: { searchTerm: string }) {
  return (
    <EmptyState
      icon={
        <div className="relative">
          <Search className="h-12 w-12 text-muted-foreground" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-muted rounded-full flex items-center justify-center">
            <span className="text-xs">0</span>
          </div>
        </div>
      }
      title="No Results Found"
      description={`No tables match "${searchTerm}". Try adjusting your search terms or browse all available tables.`}
    />
  )
}

export function NoQueryResultsState() {
  return (
    <EmptyState
      icon={
        <div className="relative">
          <Play className="h-12 w-12 text-muted-foreground" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-2 border-dashed border-primary/20 rounded-lg animate-pulse" />
          </div>
        </div>
      }
      title="Ready to Execute"
      description="Write your SQL query above and click 'Run Query' to see results. You can query any table in your connected database."
    />
  )
}

export function EmptyAnalyticsState() {
  return (
    <div className="h-full flex items-center justify-center">
      <EmptyState
        icon={
          <div className="relative">
            <BarChart3 className="h-12 w-12 text-primary" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div
              className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"
              style={{ animationDelay: "0.5s" }}
            />
          </div>
        }
        title="Analytics Dashboard"
        description="Connect to a database to view detailed analytics, performance metrics, and insights about your data usage and query patterns."
      />
    </div>
  )
}

export function EmptySchemaState() {
  return (
    <div className="h-full flex items-center justify-center">
      <EmptyState
        icon={
          <div className="relative">
            <GitBranch className="h-12 w-12 text-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-18 h-18 border border-dashed border-primary/30 rounded-lg animate-pulse-glow" />
            </div>
          </div>
        }
        title="Schema Visualization"
        description="Explore your database relationships, foreign keys, and table structures in an interactive visual format."
      />
    </div>
  )
}

export function EmptySettingsState() {
  return (
    <div className="h-full flex items-center justify-center">
      <EmptyState
        icon={
          <div className="relative">
            <Settings className="h-12 w-12 text-muted-foreground animate-rotate-slow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border border-dashed border-primary/20 rounded-full" />
            </div>
          </div>
        }
        title="Application Settings"
        description="Configure your database connections, user preferences, security settings, and application behavior."
      />
    </div>
  )
}

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center animate-slide-up">
        <div className="relative w-12 h-12 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <Database className="absolute inset-2 h-8 w-8 text-primary animate-pulse" />
        </div>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  )
}
