"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export interface Tab {
  id: string
  title: string
  type: "table" | "query" | "home" | "schema" | "analytics" | "settings"
  content?: any
  isClosable: boolean
  isDirty?: boolean
  tableName?: string
}

interface TabsContextType {
  tabs: Tab[]
  activeTabId: string | null
  openTab: (tab: Omit<Tab, "id">) => string
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  reorderTabs: (fromIndex: number, toIndex: number) => void
  updateTab: (tabId: string, updates: Partial<Tab>) => void
  closeAllTabs: () => void
  closeOtherTabs: (tabId: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

export function TabsProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "get-started",
      title: "Get started",
      type: "home",
      isClosable: true,
    },
  ])
  const [activeTabId, setActiveTabId] = useState<string | null>("get-started")

  const openTab = useCallback(
    (tabData: Omit<Tab, "id">) => {
      const tabId = `${tabData.type}-${tabData.tableName || Date.now()}`

      // Check if tab already exists
      const existingTab = tabs.find(
        (tab) => tab.type === tabData.type && (tabData.tableName ? tab.tableName === tabData.tableName : true),
      )

      if (existingTab) {
        setActiveTabId(existingTab.id)
        return existingTab.id
      }

      const newTab: Tab = {
        ...tabData,
        id: tabId,
      }

      setTabs((prev) => [...prev, newTab])
      setActiveTabId(tabId)
      return tabId
    },
    [tabs],
  )

  const closeTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => {
        const newTabs = prev.filter((tab) => tab.id !== tabId)

        // If we're closing the active tab, switch to another tab
        if (activeTabId === tabId) {
          const tabIndex = prev.findIndex((tab) => tab.id === tabId)
          const nextTab = newTabs[tabIndex] || newTabs[tabIndex - 1] || newTabs[0]
          setActiveTabId(nextTab?.id || null)
        }

        return newTabs
      })
    },
    [activeTabId],
  )

  const setActiveTab = useCallback(
    (tabId: string) => {
      if (tabs.find((tab) => tab.id === tabId)) {
        setActiveTabId(tabId)
      }
    },
    [tabs],
  )

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setTabs((prev) => {
      const newTabs = [...prev]
      const [movedTab] = newTabs.splice(fromIndex, 1)
      newTabs.splice(toIndex, 0, movedTab)
      return newTabs
    })
  }, [])

  const updateTab = useCallback((tabId: string, updates: Partial<Tab>) => {
    setTabs((prev) => prev.map((tab) => (tab.id === tabId ? { ...tab, ...updates } : tab)))
  }, [])

  const closeAllTabs = useCallback(() => {
    setTabs([])
    setActiveTabId(null)
  }, [])

  const closeOtherTabs = useCallback((tabId: string) => {
    setTabs((prev) => prev.filter((tab) => tab.id === tabId))
    setActiveTabId(tabId)
  }, [])

  return (
    <TabsContext.Provider
      value={{
        tabs,
        activeTabId,
        openTab,
        closeTab,
        setActiveTab,
        reorderTabs,
        updateTab,
        closeAllTabs,
        closeOtherTabs,
      }}
    >
      {children}
    </TabsContext.Provider>
  )
}

export function useTabs() {
  const context = useContext(TabsContext)
  if (context === undefined) {
    throw new Error("useTabs must be used within a TabsProvider")
  }
  return context
}
