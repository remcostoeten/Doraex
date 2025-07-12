import React, { useState } from 'react'
import { Search, Filter, Plus, RotateCcw } from 'lucide-react'
import type { TTableData } from '../types/types'

type TProps = {
	data: TTableData
}

export default function TableView({ data }: TProps) {
	const [searchTerm, setSearchTerm] = useState<string>('')

	const filteredRows = data.rows.filter(function(row) {
		return Object.values(row).some(function(value) {
			return String(value).toLowerCase().includes(searchTerm.toLowerCase())
		})
	})

	return (
		<div className='flex-1 bg-neutral-950 text-neutral-50'>
			{/* Header */}
			<div className='bg-neutral-950 border-b border-neutral-800 p-4'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-4'>
						<button className='flex items-center space-x-2 text-neutral-400 hover:text-neutral-300'>
							<Filter size={16} />
							<span className='text-sm'>Add filters</span>
						</button>
					</div>

					<div className='flex items-center space-x-4'>
						<h2 className='text-lg font-semibold'>
							{data.tableName}
						</h2>
						<button className='flex items-center space-x-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-50 px-3 py-1 rounded text-sm transition-colors'>
							<Plus size={14} />
							<span>Add Row</span>
						</button>
						<button className='p-2 text-neutral-400 hover:text-neutral-300'>
							<RotateCcw size={16} />
						</button>
					</div>
				</div>
			</div>

			{/* Search */}
			<div className='p-4 border-b border-neutral-800'>
				<div className='relative'>
					<Search
						className='absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400'
						size={16}
					/>
					<input
						type='text'
						placeholder='Search...'
						value={searchTerm}
						onChange={function(e) { setSearchTerm(e.target.value) }}
						className='w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-700 rounded text-neutral-50 placeholder-neutral-400 focus:outline-none focus:border-neutral-500'
					/>
				</div>
			</div>

			{/* Table */}
			<div className='overflow-auto'>
				<table className='w-full'>
					<thead className='bg-neutral-900'>
						<tr>
							<th className='w-12 px-4 py-3 text-left'>
								<input
									type='checkbox'
									className='rounded bg-neutral-800 border-neutral-600'
								/>
							</th>
							{data.columns.map(function(column, index) { return (
								<th
									key={index}
									className='px-4 py-3 text-left text-sm font-medium text-neutral-300 border-r border-neutral-700 last:border-r-0'
								>
									<div className='flex items-center space-x-2'>
										<span>{column}</span>
										<button className='text-neutral-500 hover:text-neutral-300'>
											<svg
												width='12'
												height='12'
												viewBox='0 0 12 12'
												fill='currentColor'
											>
												<path d='M6 3L9 6H3L6 3Z' />
												<path d='M6 9L3 6H9L6 9Z' />
											</svg>
										</button>
									</div>
								</th>
							)})}
						</tr>
					</thead>
					<tbody>
						{filteredRows.map(function(row, rowIndex) { return (
							<tr
								key={rowIndex}
								className='border-b border-neutral-800 hover:bg-neutral-900/50 transition-colors'
							>
								<td className='px-4 py-3'>
									<input
										type='checkbox'
										className='rounded bg-neutral-800 border-neutral-600'
									/>
								</td>
								{data.columns.map(function(column, colIndex) { return (
									<td
										key={colIndex}
										className='px-4 py-3 text-sm text-neutral-300 border-r border-neutral-800/50 last:border-r-0'
									>
										{row[column] || '-'}
									</td>
								)})}
							</tr>
						)})}
					</tbody>
				</table>
			</div>
		</div>
	)
}
