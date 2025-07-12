import { useTabs } from './hooks/useTabs'
import {
	createTableTab,
	createQueryTab,
	createMessagesTab
} from './utils/tabFactory'
import Sidebar from './components/isolated/Sidebar'
import TabSystem from './components/isolated/TabSystem'

function App() {
	const initialTabs = [createQueryTab('welcome-query', 'Welcome Query')]

	const { tabs, activeTabId, addTab, removeTab, setActiveTab } =
		useTabs(initialTabs)
	const { setTabOrder } = useTabs(initialTabs)

	function handleSidebarItemClick(item: any) {
		const existingTab = tabs.find(function(tab) { return tab.id === item.id })
		if (existingTab) {
			setActiveTab(existingTab.id)
			return
		}

		let newTab
		switch (item.type) {
			case 'table':
				newTab = createTableTab(item.id, item.label, item.data)
				break
			case 'query':
				newTab = createQueryTab(item.id, item.label)
				if (item.data) {
					newTab.content = item.data
				}
				break
			case 'messages':
				newTab = createMessagesTab(item.id)
				break
			default:
				return
		}

		addTab(newTab)
	}

	function handleNewTab(type: 'table' | 'query' | 'messages') {
		const id = `${type}-${Date.now()}`
		let newTab

		switch (type) {
			case 'table':
				newTab = createTableTab(id, 'New Table', {
					tableName: 'New Table',
					columns: ['id', 'name', 'created_at'],
					rows: []
				})
				break
			case 'query':
				newTab = createQueryTab(id, 'Untitled Query')
				break
			case 'messages':
				newTab = createMessagesTab(id)
				break
			default:
				return
		}

		addTab(newTab)
	}

	return (
		<div className='h-screen bg-zinc-950 text-zinc-50 flex'>
			<Sidebar onItemClick={handleSidebarItemClick} />
			<div className='flex-1 flex flex-col'>
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

export { App }
