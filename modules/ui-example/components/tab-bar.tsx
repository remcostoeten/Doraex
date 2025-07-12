import React, { useState, useRef, useEffect } from 'react'
import {
	X,
	Plus,
	ChevronDown,
	Database,
	FileText,
	MessageSquare
} from 'lucide-react'
import { motion, Reorder } from 'framer-motion'
import type { TTab } from '../types/types'

type TProps = {
	tabs: TTab[]
	activeTabId: string
	onTabClick: (tabId: string) => void
	onTabClose: (tabId: string) => void
	onNewTab: (type?: 'table' | 'query' | 'messages') => void
	onTabReorder?: (newOrder: TTab[]) => void
}

export function TabBar({
	tabs,
	activeTabId,
	onTabClick,
	onTabClose,
	onNewTab,
	onTabReorder
}: TProps) {
	const [showDropdown, setShowDropdown] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setShowDropdown(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const getTabIcon = (type: Tab['type']) => {
		switch (type) {
			case 'table':
				return '🗂️'
			case 'query':
				return '⚡'
			case 'messages':
				return '💬'
			default:
				return '📄'
		}
	}

	const newTabOptions = [
		{
			id: 'new-query',
			label: 'New Query',
			icon: <FileText size={16} />,
			type: 'query' as const,
			description: 'Create a new SQL query'
		},
		{
			id: 'new-table',
			label: 'New Table View',
			icon: <Database size={16} />,
			type: 'table' as const,
			description: 'Create a new table view'
		},
		{
			id: 'new-messages',
			label: 'Messages',
			icon: <MessageSquare size={16} />,
			type: 'messages' as const,
			description: 'Open messages panel'
		}
	]

	const handleOptionClick = (type: 'table' | 'query' | 'messages') => {
		onNewTab(type)
		setShowDropdown(false)
	}

	const handleReorder = (newOrder: Tab[]) => {
		if (onTabReorder) {
			onTabReorder(newOrder)
		}
	}

	return (
		<div className='bg-zinc-950 border-b border-zinc-800'>
			<div className='flex items-center'>
				<Reorder.Group
					axis='x'
					values={tabs}
					onReorder={handleReorder}
					className='flex items-center'
					style={{ margin: 0, padding: 0, listStyle: 'none' }}
				>
					{tabs.map(tab => (
						<Reorder.Item
							key={tab.id}
							value={tab}
							className={`
                group flex items-center px-4 py-2.5 border-r border-zinc-800 cursor-pointer
                transition-all duration-150 min-w-0 max-w-xs relative select-none
                ${
					activeTabId === tab.id
						? 'bg-zinc-900 text-zinc-50'
						: 'bg-zinc-950 text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-300'
				}
              `}
							onClick={() => onTabClick(tab.id)}
							whileDrag={{
								scale: 1.05,
								zIndex: 1000,
								boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
							}}
							dragConstraints={{
								left: 0,
								right: 0,
								top: 0,
								bottom: 0
							}}
							dragElastic={0.1}
						>
							<div className='flex items-center space-x-2 min-w-0'>
								<span className='text-xs'>
									{getTabIcon(tab.type)}
								</span>
								<span className='text-sm font-medium truncate'>
									{tab.title}
								</span>
								{tab.isCloseable && (
									<motion.button
										onClick={e => {
											e.stopPropagation()
											onTabClose(tab.id)
										}}
										className='opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-0.5 hover:bg-zinc-800 rounded ml-1'
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.9 }}
									>
										<X size={14} />
									</motion.button>
								)}
							</div>
						</Reorder.Item>
					))}
				</Reorder.Group>

				<div className='relative' ref={dropdownRef}>
					<motion.button
						onClick={() => setShowDropdown(!showDropdown)}
						className='flex items-center px-3 py-2.5 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-900/50 transition-all duration-150'
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						<Plus size={16} />
						<span className='ml-1 text-sm'>New</span>
						<motion.div
							animate={{ rotate: showDropdown ? 180 : 0 }}
							transition={{ duration: 0.2 }}
						>
							<ChevronDown size={14} className='ml-1' />
						</motion.div>
					</motion.button>

					{showDropdown && (
						<motion.div
							initial={{ opacity: 0, y: -10, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -10, scale: 0.95 }}
							transition={{ duration: 0.15 }}
							className='absolute top-full left-0 mt-1 w-64 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg z-50'
						>
							<div className='py-2'>
								{newTabOptions.map((option, index) => (
									<motion.button
										key={option.id}
										onClick={() =>
											handleOptionClick(option.type)
										}
										className='w-full flex items-start px-4 py-3 text-left hover:bg-zinc-800 transition-colors group'
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.05 }}
										whileHover={{ x: 4 }}
									>
										<div className='flex items-center space-x-3 w-full'>
											<div className='text-zinc-400 group-hover:text-zinc-300 flex-shrink-0'>
												{option.icon}
											</div>
											<div className='flex-1 min-w-0'>
												<div className='text-sm font-medium text-zinc-300 group-hover:text-zinc-100'>
													{option.label}
												</div>
												{option.description && (
													<div className='text-xs text-zinc-500 group-hover:text-zinc-400 mt-1'>
														{option.description}
													</div>
												)}
											</div>
										</div>
									</motion.button>
								))}
							</div>
						</motion.div>
					)}
				</div>
			</div>
		</div>
	)
}
