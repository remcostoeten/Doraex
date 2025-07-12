import React, { useState } from 'react'
import { Play, Save, History } from 'lucide-react'
import type { TQueryData } from '../types/types'

type TProps = {
	data: TQueryData
	onQueryUpdate: (query: string) => void
}

export default function QueryView({ data, onQueryUpdate }: TProps) {
	const [query, setQuery] = useState(data.query)

	function handleQueryChange(value: string) {
		setQuery(value)
		onQueryUpdate(value)
	}

	return (
		<div className='flex-1 bg-neutral-950 text-neutral-50'>
			{/* Header */}
			<div className='bg-neutral-950 border-b border-neutral-800 p-4'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-4'>
						<button className='flex items-center space-x-2 text-neutral-400 hover:text-neutral-300'>
							<History size={16} />
							<span className='text-sm'>History</span>
						</button>
					</div>

					<div className='flex items-center space-x-4'>
						<h2 className='text-lg font-semibold'>
							Untitled Query
						</h2>
						<button className='flex items-center space-x-2 text-neutral-400 hover:text-neutral-300 px-3 py-1 rounded text-sm transition-colors'>
							<Save size={14} />
							<span>Save</span>
						</button>
						<button className='flex items-center space-x-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-50 px-3 py-1 rounded text-sm transition-colors'>
							<Play size={14} />
							<span>Run</span>
						</button>
					</div>
				</div>
			</div>

			{/* Query Editor */}
			<div className='p-4'>
				<div className='bg-neutral-900 border border-neutral-700 rounded-lg'>
					<div className='p-4'>
						<div className='flex items-start'>
							<span className='text-neutral-500 mr-4 text-sm'>
								1
							</span>
							<textarea
								value={query}
								onChange={function(e) {
									handleQueryChange(e.target.value)
								}}
								placeholder='# + B to get AI assistant'
								className='flex-1 bg-transparent text-neutral-300 placeholder-neutral-500 resize-none outline-none min-h-[200px] font-mono text-sm'
								style={{ lineHeight: '1.5' }}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Results */}
			{data.results && (
				<div className='p-4 border-t border-neutral-800'>
					<h3 className='text-sm font-medium text-neutral-400 mb-4'>
						Results
					</h3>
					<div className='bg-neutral-900 rounded-lg p-4'>
						<pre className='text-sm text-neutral-300'>
							{JSON.stringify(data.results, null, 2)}
						</pre>
					</div>
				</div>
			)}
		</div>
	)
}
