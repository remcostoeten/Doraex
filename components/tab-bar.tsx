"use client"

import type React from "react"

import { useState, useRef } from "react"
import { MotionTab, MotionList } from "@/lib/motion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { X, Plus, MoreHorizontal, Home, Database, Code, GitBranch, BarChart3, Settings } from "lucide-react"
import { useTabs } from "@/hooks/use-tabs"
import { ConnectionCreationModal } from "@/components/connection-creation-modal"

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, openTab, closeAllTabs, closeOtherTabs } = useTabs()
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false)
  const [draggedTabIndex, setDraggedTabIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragCounter = useRef(0)

  const getTabIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="h-3 w-3" />
      case "table":
        return <Database className="h-3 w-3" />
      case "query":
        return <Code className="h-3 w-3" />
      case "schema":
        return <GitBranch className="h-3 w-3" />
      case "analytics":
        return <BarChart3 className="h-3 w-3" />
      case "settings":
        return <Settings className="h-3 w-3" />
      default:
        return <Database className="h-3 w-3" />
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedTabIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", "")
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
  }

  const handleDragLeave = (e: React.DragEvent) => {
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragOverIndex(null)
    }
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    dragCounter.current = 0

    if (draggedTabIndex !== null && draggedTabIndex !== dropIndex) {
      console.log(`Reorder tab from ${draggedTabIndex} to ${dropIndex}`)
    }

    setDraggedTabIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedTabIndex(null)
    setDragOverIndex(null)
    dragCounter.current = 0
  }

  const handleTabClick = (tabId: string) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setActiveTab(tabId)
      })
    } else {
      setActiveTab(tabId)
    }
  }

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation()
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        closeTab(tabId)
      })
    } else {
      closeTab(tabId)
    }
  }

  const handleNewQuery = () => {
    openTab({
      title: "Untitled Query",
      type: "query",
      isClosable: true,
      isDirty: false,
    })
  }

  return (
    <>
      <div className="flex items-center bg-gray-100 dark:bg-zinc-900/50 border-b border-border h-10">
        {/* Tabs Container */}
        <MotionList className="flex items-end flex-1 overflow-x-auto px-2">
          {tabs.map((tab, index) => (
            <MotionTab
              key={tab.id}
              layoutId={`tab-${tab.id}`}
              isActive={activeTabId === tab.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                relative flex items-center gap-2 px-3 py-1.5 cursor-pointer select-none
                min-w-0 max-w-48 group text-sm
                ${
                  activeTabId === tab.id
                    ? "bg-white dark:bg-zinc-800 text-foreground rounded-t-md z-10 border-t border-l border-r border-border shadow-sm"
                    : "bg-black/20 dark:bg-black/40 text-muted-foreground hover:bg-black/30 dark:hover:bg-black/50 hover:text-foreground rounded-t-md border-t border-l border-r border-transparent hover:border-border/50"
                }
                ${dragOverIndex === index ? "bg-primary/10" : ""}
                ${draggedTabIndex === index ? "opacity-50" : ""}
                ${index > 0 ? "ml-1" : ""}
              `}
              onClick={() => handleTabClick(tab.id)}
            >
              {getTabIcon(tab.type)}
              <span className="truncate flex-1 min-w-0 font-medium">
                {tab.title}
                {tab.isDirty && <span className="ml-1 text-primary">•</span>}
              </span>
              {tab.isClosable && (
                <button
                  className="ml-1 p-0.5 rounded hover:bg-muted/80 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleCloseTab(e, tab.id)}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </MotionTab>
          ))}
        </MotionList>

        {/* New Tab Button */}
        <div className="flex items-center px-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={handleNewQuery}
          >
            <Plus className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 ml-1 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleNewQuery}>
                <Code className="h-4 w-4 mr-2" />
                New Query
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsConnectionModalOpen(true)}>
                <Database className="h-4 w-4 mr-2" />
                Connect Database
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => closeOtherTabs(activeTabId!)}>Close Other Tabs</DropdownMenuItem>
              <DropdownMenuItem onClick={closeAllTabs}>Close All Tabs</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ConnectionCreationModal open={isConnectionModalOpen} onOpenChange={setIsConnectionModalOpen} />
    </>
  )
}
