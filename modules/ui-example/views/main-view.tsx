"use client"

import { useState } from 'react'
import { Sidebar } from '../components/sidebar'
import { TabSystem } from '../components/tab-system'
import { useTabs } from '../hooks/use-tabs'
import { createTableTab, createQueryTab, createMessagesTab } from '../utils/tab-factory'
import type { TTab } from '../types/types'

type TProps = {
  className?: string
}

export function MainView({ className = '' }: TProps) {
  const {
    tabs,
    activeTabId,
    addTab,
    removeTab,
    setActiveTab,
    setTabOrder
  } = useTabs([
    createQueryTab('initial-query', 'Welcome Query')
  ])

  function handleSidebarItemClick(item: any) {
    // Check if tab already exists
    const existingTab = tabs.find(function(tab) {
      return (tab.type === item.type && tab.title === item.label) ||
        (item.type === 'messages' && tab.type === 'messages')
    })

    if (existingTab) {
      setActiveTab(existingTab.id)
      return
    }

    // Create new tab based on item type
    let newTab: TTab
    
    switch (item.type) {
      case 'table':
        newTab = createTableTab(
          `table-${Date.now()}`,
          item.label,
          item.data
        )
        break
      case 'query':
        newTab = createQueryTab(
          `query-${Date.now()}`,
          item.label
        )
        break
      case 'messages':
        newTab = createMessagesTab('messages')
        break
      default:
        return
    }

    addTab(newTab)
  }

  function handleNewTab(type?: 'table' | 'query' | 'messages') {
    let newTab: TTab
    
    switch (type) {
      case 'table':
        // For demo purposes, create a sample table
        newTab = createTableTab(
          `table-${Date.now()}`,
          'New Table',
          {
            tableName: 'New Table',
            columns: ['id', 'name', 'created_at'],
            rows: []
          }
        )
        break
      case 'query':
        newTab = createQueryTab(
          `query-${Date.now()}`,
          'Untitled Query'
        )
        break
      case 'messages':
        newTab = createMessagesTab('messages')
        break
      default:
        newTab = createQueryTab(
          `query-${Date.now()}`,
          'Untitled Query'
        )
    }

    addTab(newTab)
  }

  return (
    <div className={`flex h-screen bg-zinc-950 ${className}`}>
      <Sidebar onItemClick={handleSidebarItemClick} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TabSystem
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={setActiveTab}
          onTabClose={removeTab}
          onNewTab={handleNewTab}
          onTabReorder={setTabOrder}
        />
      </div>
    </div>
  )
}
