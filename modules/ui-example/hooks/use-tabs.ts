import { useState, useCallback } from 'react'
import type { TTab } from '../types/types'

export function useTabs(initialTabs: TTab[] = []) {
	const [tabs, setTabs] = useState<TTab[]>(initialTabs)
	const [activeTabId, setActiveTabId] = useState<string>(
		initialTabs[0]?.id || ''
	)

	const addTab = useCallback(function(tab: TTab) {
		setTabs(function(prev) { return [...prev, tab] })
		setActiveTabId(tab.id)
	}, [])

	const removeTab = useCallback(
		function(tabId: string) {
			setTabs(function(prev) {
				const newTabs = prev.filter(function(tab) { return tab.id !== tabId })

				if (activeTabId === tabId && newTabs.length > 0) {
					setActiveTabId(newTabs[0].id)
				}

				return newTabs
			})
		},
		[activeTabId]
	)

	const updateTab = useCallback(function(tabId: string, updates: Partial<TTab>) {
		setTabs(function(prev) {
			return prev.map(function(tab) { return tab.id === tabId ? { ...tab, ...updates } : tab })
		})
	}, [])

	const setActiveTab = useCallback(function(tabId: string) {
		setActiveTabId(tabId)
	}, [])

	const reorderTabs = useCallback(function(fromIndex: number, toIndex: number) {
		setTabs(function(prev) {
			const newTabs = [...prev]
			const [movedTab] = newTabs.splice(fromIndex, 1)
			newTabs.splice(toIndex, 0, movedTab)
			return newTabs
		})
	}, [])

	const setTabOrder = useCallback(function(newOrder: TTab[]) {
		setTabs(newOrder)
	}, [])
	const activeTab = tabs.find(function(tab) { return tab.id === activeTabId })

	return {
		tabs,
		activeTabId,
		activeTab,
		addTab,
		removeTab,
		updateTab,
		setActiveTab,
		reorderTabs,
		setTabOrder
	}
}
