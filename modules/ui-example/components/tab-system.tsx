import React, { useState } from 'react'
import { TabBar } from './tab-bar'
import { FilterBar } from './filter-bar'
import { DataTable } from './data-table'
import TableView from '../views/table-view'
import QueryView from '../views/query-views'
import MessagesView from '../views/messages-views'
import type { TTab } from '../types/types'

type TFilterCondition = {
	id: string
	column: string
	operator: string
	value: string
}

type TProps = {
	tabs: TTab[]
	activeTabId: string
	onTabClick: (tabId: string) => void
	onTabClose: (tabId: string) => void
	onNewTab: (type?: 'table' | 'query' | 'messages') => void
	onTabReorder?: (newOrder: TTab[]) => void
}

export function TabSystem({
	tabs,
	activeTabId,
	onTabClick,
	onTabClose,
	onNewTab,
	onTabReorder
}: TProps) {
	const [filters, setFilters] = useState<TFilterCondition[]>([])

	const activeTab = tabs.find(tab => tab.id === activeTabId)

	const handleNewTab = (type?: 'table' | 'query' | 'messages') => {
		if (type) {
			onNewTab(type)
		} else {
			onNewTab('query') // Default to query
		}
	}

	const renderTabContent = () => {
		if (!activeTab) return null

		switch (activeTab.type) {
			case 'table':
				return <TableView data={activeTab.content} />
			case 'query':
				return <QueryView data={activeTab.content} onQueryUpdate={() => {}} />
			case 'messages':
				return <MessagesView />
			default:
				return null
		}
	}

	return (
		<div className='flex flex-col h-full'>
			<TabBar
				tabs={tabs}
				activeTabId={activeTabId}
				onTabClick={onTabClick}
				onTabClose={onTabClose}
				onNewTab={handleNewTab}
				onTabReorder={onTabReorder}
			/>
			<div className='flex-1 overflow-hidden'>{renderTabContent()}</div>
		</div>
	)
}
