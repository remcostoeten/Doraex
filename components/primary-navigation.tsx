"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Database, Code, GitBranch, BarChart3, Settings, HelpCircle, User, Home } from "lucide-react"

interface PrimaryNavigationProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function PrimaryNavigation({ activeSection, onSectionChange }: PrimaryNavigationProps) {
  const navigationItems = [
    { id: "home", icon: Home, label: "Home", description: "Database connections and overview" },
    { id: "tables", icon: Database, label: "Tables", description: "Browse and edit table data" },
    { id: "sql", icon: Code, label: "SQL Editor", description: "Write and execute SQL queries" },
    { id: "schema", icon: GitBranch, label: "Schema", description: "View database relationships" },
    { id: "analytics", icon: BarChart3, label: "Analytics", description: "Database insights and metrics" },
  ]

  const bottomItems = [
    { id: "settings", icon: Settings, label: "Settings", description: "Application settings" },
    { id: "help", icon: HelpCircle, label: "Help", description: "Documentation and support" },
    { id: "profile", icon: User, label: "Profile", description: "User profile and account" },
  ]

  return (
    <TooltipProvider>
      <div className="w-16 bg-muted border-r border-border flex flex-col items-center py-4">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Database className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex flex-col gap-2 flex-1">
          {navigationItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeSection === item.id ? "default" : "ghost"}
                  size="icon"
                  className="w-12 h-12"
                  onClick={() => onSectionChange(item.id)}
                >
                  <item.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex flex-col gap-1">
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.description}</span>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="flex flex-col gap-2">
          {bottomItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeSection === item.id ? "default" : "ghost"}
                  size="icon"
                  className="w-12 h-12"
                  onClick={() => onSectionChange(item.id)}
                >
                  <item.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex flex-col gap-1">
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.description}</span>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
