import React, { useState } from 'react'
import {
	Search,
	Database,
	FileText,
	MessageSquare,
	ChevronRight,
	ChevronDown
} from 'lucide-react'

type TSidebarItem = {
	id: string
	label: string
	type: 'table' | 'query' | 'messages'
	isStarred?: boolean
	isRecent?: boolean
	data?: any
	icon?: React.ReactNode
}

type TProps = {
	onItemClick: (item: TSidebarItem) => void
}
export function Sidebar({ onItemClick }: TProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [expandedSections, setExpandedSections] = useState<string[]>(['main'])

	function toggleSection(sectionId: string) {
		if (expandedSections.includes(sectionId)) {
			setExpandedSections(expandedSections.filter(function(id) { return id !== sectionId }))
		} else {
			setExpandedSections([...expandedSections, sectionId])
		}
	}

	const sidebarItems: TSidebarItem[] = [
		{
			id: 'rate_limits',
			label: 'rate_limits',
			icon: <Database size={16} />,
			type: 'table',
			data: {
				tableName: 'rate_limits',
				columns: ['id', 'endpoint', 'limit_per_hour', 'created_at'],
				rows: [
					{
						id: 1,
						endpoint: '/api/users',
						limit_per_hour: 1000,
						created_at: '2024-12-28 20:38:37'
					},
					{
						id: 2,
						endpoint: '/api/data',
						limit_per_hour: 500,
						created_at: '2024-12-28 20:38:57'
					}
				]
			}
		},
		{
			id: 'users',
			label: 'users',
			icon: <Database size={16} />,
			type: 'table',
			data: {
				tableName: 'users',
				columns: ['id', 'equals', 'avatar_url', 'created_at', 'role'],
				rows: [
					{
						id: 1,
						equals: 'https://avatars.githubusercontent.com/...',
						avatar_url: 'https://avatars.githubusercontent.com/...',
						created_at: '2024-12-28 20:38:37',
						role: 'user'
					},
					{
						id: 2,
						equals: 'https://avatars.githubusercontent.com/...',
						avatar_url: 'https://avatars.githubusercontent.com/...',
						created_at: '2024-12-28 20:38:57',
						role: 'admin'
					}
				]
			}
		},
		{
			id: 'sessions',
			label: 'sessions',
			icon: <Database size={16} />,
			type: 'table',
			data: {
				tableName: 'sessions',
				columns: ['id', 'user_id', 'token', 'expires_at'],
				rows: [
					{
						id: 1,
						user_id: 1,
						token: 'abc123...',
						expires_at: '2024-12-29 20:38:37'
					},
					{
						id: 2,
						user_id: 2,
						token: 'def456...',
						expires_at: '2024-12-29 20:38:57'
					}
				]
			}
		},
		{
			id: 'rate_limit_attempts',
			label: 'rate_limit_attempts',
			icon: <Database size={16} />,
			type: 'table',
			data: {
				tableName: 'rate_limit_attempts',
				columns: [
					'id',
					'ip_address',
					'endpoint',
					'attempts',
					'last_attempt'
				],
				rows: [
					{
						id: 1,
						ip_address: '192.168.1.1',
						endpoint: '/api/users',
						attempts: 5,
						last_attempt: '2024-12-28 20:38:37'
					}
				]
			}
		}
	]

	const filteredItems = sidebarItems.filter(function(item) {
		return item.label.toLowerCase().includes(searchTerm.toLowerCase())
	})

	return (
		<div className='w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col'>
			{/* Header */}
			<div className='p-4 border-b border-zinc-800'>
				<div className='flex items-center space-x-2 mb-3'>
					<Database size={20} className='text-zinc-400' />
					<h2 className='text-lg font-semibold text-zinc-100'>
						Tables
					</h2>
				</div>
				<div className='relative'>
					<Search
						className='absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400'
						size={14}
					/>
					<input
						type='text'
						placeholder='Search tables'
						value={searchTerm}
						onChange={function(e) { setSearchTerm(e.target.value) }}
						className='w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 text-sm'
					/>
				</div>
			</div>

			{/* Navigation Items */}
			<div className='flex-1 overflow-y-auto'>
				<div className='p-2'>
					{/* Main Section */}
					<div className='mb-2'>
						<button
							onClick={function() { toggleSection('main') }}
							className='flex items-center space-x-2 w-full px-2 py-1 text-zinc-400 hover:text-zinc-300 transition-colors'
						>
							{expandedSections.includes('main') ? (
								<ChevronDown size={14} />
							) : (
								<ChevronRight size={14} />
							)}
							<span className='text-sm font-medium'>main</span>
						</button>

						{expandedSections.includes('main') && (
							<div className='ml-4 space-y-1 mt-1'>
								{filteredItems.map(function(item) { return (
									<button
										key={item.id}
										onClick={function() { onItemClick(item) }}
										className='w-full flex items-center space-x-3 px-3 py-2 text-left text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 rounded transition-colors group'
									>
										<span className='text-zinc-500 group-hover:text-zinc-400'>
											{item.icon}
										</span>
										<span className='text-sm font-medium truncate'>
											{item.label}
										</span>
									</button>
								)})}
							</div>
						)}
					</div>
				</div>

				{/* Quick Actions */}
				<div className='p-2 border-t border-zinc-800 mt-4'>
					<div className='space-y-1'>
						<button
							onClick={function() {
								onItemClick({
									id: `query-${Date.now()}`,
									label: 'New Query',
									icon: <FileText size={16} />,
									type: 'query',
									data: {
										query: '# + B to get AI assistant',
										results: null
									}
								})
							}}
							className='w-full flex items-center space-x-3 px-3 py-2 text-left text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 rounded transition-colors group'
						>
							<span className='text-zinc-500 group-hover:text-zinc-400'>
								<FileText size={16} />
							</span>
							<span className='text-sm font-medium'>
								New Query
							</span>
						</button>
						<button
							onClick={function() {
								onItemClick({
									id: 'messages',
									label: 'Messages',
									icon: <MessageSquare size={16} />,
									type: 'messages'
								})
							}}
							className='w-full flex items-center space-x-3 px-3 py-2 text-left text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 rounded transition-colors group'
						>
							<span className='text-zinc-500 group-hover:text-zinc-400'>
								<MessageSquare size={16} />
							</span>
							<span className='text-sm font-medium'>
								Messages
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
