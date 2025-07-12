import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, RotateCcw } from 'lucide-react'
import type { TTableData } from '../types/types'

type TProps = {
	data: TTableData
	onAddRow?: () => void
	onRefresh?: () => void
}

export function DataTable({
	data,
	onAddRow,
	onRefresh
}: TProps) {
	const [sortColumn, setSortColumn] = useState<string | null>(null)
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
	const [selectedRows, setSelectedRows] = useState<number[]>([])

	function handleSort(column: string) {
		if (sortColumn === column) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
		} else {
			setSortColumn(column)
			setSortDirection('asc')
		}
	}

	function toggleRowSelection(index: number) {
		if (selectedRows.includes(index)) {
			setSelectedRows(selectedRows.filter(function(i) { return i !== index }))
		} else {
			setSelectedRows([...selectedRows, index])
		}
	}

	function toggleAllRows() {
		if (selectedRows.length === data.rows.length) {
			setSelectedRows([])
		} else {
			setSelectedRows(data.rows.map(function(_, index) { return index }))
		}
	}

	const sortedRows = [...data.rows].sort(function(a, b) {
		if (!sortColumn) return 0

		const aVal = a[sortColumn]
		const bVal = b[sortColumn]

		if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
		if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
		return 0
	})

	return (
		<div className='flex-1 bg-zinc-950 text-zinc-50'>
			{/* Header */}
			<div className='bg-zinc-950 border-b border-zinc-800 p-4'>
				<div className='flex items-center justify-between'>
					<h2 className='text-lg font-semibold text-zinc-100'>
						{data.tableName}
					</h2>
					<div className='flex items-center space-x-3'>
						{onAddRow && (
							<button
								onClick={onAddRow}
								className='flex items-center space-x-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-3 py-2 rounded text-sm transition-colors'
							>
								<Plus size={14} />
								<span>Add Row</span>
							</button>
						)}
						{onRefresh && (
							<button
								onClick={onRefresh}
								className='p-2 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors'
							>
								<RotateCcw size={16} />
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Table */}
			<div className='overflow-auto'>
				<table className='w-full'>
					<thead className='bg-zinc-900 sticky top-0'>
						<tr>
							<th className='w-12 px-4 py-3 text-left'>
								<input
									type='checkbox'
									checked={
										selectedRows.length ===
											data.rows.length &&
										data.rows.length > 0
									}
									onChange={toggleAllRows}
									className='rounded bg-zinc-800 border-zinc-600 text-zinc-400'
								/>
							</th>
							{data.columns.map(function(column) { return (
								<th
									key={column}
									className='px-4 py-3 text-left text-sm font-medium text-zinc-300 border-r border-zinc-800 last:border-r-0 cursor-pointer hover:bg-zinc-800/50 transition-colors'
									onClick={function() { handleSort(column) }}
								>
									<div className='flex items-center space-x-2'>
										<span>{column}</span>
										<div className='flex flex-col'>
											<ChevronUp
												size={12}
												className={`${sortColumn === column && sortDirection === 'asc' ? 'text-zinc-300' : 'text-zinc-600'}`}
											/>
											<ChevronDown
												size={12}
												className={`${sortColumn === column && sortDirection === 'desc' ? 'text-zinc-300' : 'text-zinc-600'} -mt-1`}
											/>
										</div>
									</div>
								</th>
							)})}
						</tr>
					</thead>
					<tbody>
						{sortedRows.map(function(row, rowIndex) { return (
							<tr
								key={rowIndex}
								className={`border-b border-zinc-800 hover:bg-zinc-900/30 transition-colors ${
									selectedRows.includes(rowIndex)
										? 'bg-zinc-900/50'
										: ''
								}`}
							>
								<td className='px-4 py-3'>
									<input
										type='checkbox'
									checked={selectedRows.includes(rowIndex)}
										onChange={function() {
											toggleRowSelection(rowIndex)
										}}
										className='rounded bg-zinc-800 border-zinc-600'
									/>
								</td>
								{data.columns.map(function(column) { return (
									<td
										key={column}
										className='px-4 py-3 text-sm text-zinc-300 border-r border-zinc-800/30 last:border-r-0'
									>
										<div className='truncate max-w-xs'>
											{row[column] !== null &&
											row[column] !== undefined
												? String(row[column])
												: '-'}
										</div>
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
