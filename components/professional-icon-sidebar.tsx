"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Grid3X3, BarChart3, Settings, HelpCircle, User, Database, Code, GitBranch, Zap } from "lucide-react"
import { useTabs } from "@/hooks/use-tabs"

interface TooltipState {
  show: boolean
  content: { title: string; description: string }
  position: { x: number; y: number }
}

interface ProfessionalIconSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function ProfessionalIconSidebar({ activeSection, onSectionChange }: ProfessionalIconSidebarProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    content: { title: "", description: "" },
    position: { x: 0, y: 0 },
  })
  const timeoutRef = useRef<NodeJS.Timeout>()
  const { openTab } = useTabs()

  const navigationItems = [
    { id: "tables", icon: Grid3X3, label: "Tables", description: "Browse and edit table data" },
    { id: "query", icon: Code, label: "Query", description: "Write and execute SQL queries" },
    { id: "schema", icon: GitBranch, label: "Schema", description: "View database relationships" },
    { id: "analytics", icon: BarChart3, label: "Analytics", description: "Database insights and metrics" },
    { id: "api", icon: Zap, label: "API", description: "Generate and manage APIs" },
  ]

  const bottomItems = [
    { id: "settings", icon: Settings, label: "Settings", description: "Application settings" },
    { id: "help", icon: HelpCircle, label: "Help", description: "Documentation and support" },
    { id: "profile", icon: User, label: "Profile", description: "View and edit your profile" },
  ]

  const showTooltip = (event: React.MouseEvent, item: { label: string; description: string }) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const rect = event.currentTarget.getBoundingClientRect()
    setTooltip({
      show: true,
      content: { title: item.label, description: item.description },
      position: {
        x: rect.right + 12,
        y: rect.top + rect.height / 2,
      },
    })
  }

  const hideTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setTooltip((prev) => ({ ...prev, show: false }))
    }, 100)
  }

  const handleSectionClick = (sectionId: string) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        if (sectionId === "query") {
          openTab({
            title: "Untitled Query",
            type: "query",
            isClosable: true,
          })
        } else {
          onSectionChange(sectionId)
          openTab({
            title: sectionId.charAt(0).toUpperCase() + sectionId.slice(1),
            type: sectionId as any,
            isClosable: false,
          })
        }
      })
    } else {
      if (sectionId === "query") {
        openTab({
          title: "Untitled Query",
          type: "query",
          isClosable: true,
        })
      } else {
        onSectionChange(sectionId)
        openTab({
          title: sectionId.charAt(0).toUpperCase() + sectionId.slice(1),
          type: sectionId as any,
          isClosable: false,
        })
      }
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      <div className="w-12 bg-background border-r border-border flex flex-col items-center py-4">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
            <Database className="h-5 w-5 text-black" />
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex flex-col gap-2 flex-1">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "secondary" : "ghost"}
              size="sm"
              className="sidebar-icon-button w-8 h-8 p-0 flex items-center justify-center"
              onClick={() => handleSectionClick(item.id)}
              onMouseEnter={(e) => showTooltip(e, item)}
              onMouseLeave={hideTooltip}
            >
              <item.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="flex flex-col gap-2">
          {bottomItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "secondary" : "ghost"}
              size="sm"
              className="sidebar-icon-button w-8 h-8 p-0 flex items-center justify-center"
              onClick={() => handleSectionClick(item.id)}
              onMouseEnter={(e) => showTooltip(e, item)}
              onMouseLeave={hideTooltip}
            >
              <item.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Tooltip */}
      <div
        className={`sidebar-tooltip ${tooltip.show ? "show" : ""}`}
        style={{
          left: `${tooltip.position.x}px`,
          top: `${tooltip.position.y}px`,
          transform: `translateY(-50%) ${tooltip.show ? "translateX(0) scale(1)" : "translateX(-8px) scale(0.95)"}`,
        }}
      >
        <div className="sidebar-tooltip-title">{tooltip.content.title}</div>
        <div className="sidebar-tooltip-description">{tooltip.content.description}</div>
      </div>
    </>
  )
}
