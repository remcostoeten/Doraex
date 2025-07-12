import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'

type TFilterCondition = {
	id: string
	column: string
	operator: string
	value: string
}

type TProps = {
	columns: string[]
	filters: TFilterCondition[]
	onFiltersChange: (filters: TFilterCondition[]) => void
}

export function FilterBar({
	columns,
	filters,
	onFiltersChange
}: TProps) {
	const [showAddFilter, setShowAddFilter] = useState(false)

	const operators = [
		{ value: 'equals', label: 'equals' },
		{ value: 'contains', label: 'contains' },
		{ value: 'starts_with', label: 'starts with' },
		{ value: 'ends_with', label: 'ends with' },
		{ value: 'greater_than', label: 'greater than' },
		{ value: 'less_than', label: 'less than' }
	]

	function addFilter() {
		const newFilter: TFilterCondition = {
			id: `filter-${Date.now()}`,
			column: columns[0] || '',
			operator: 'equals',
			value: ''
		}
		onFiltersChange([...filters, newFilter])
		setShowAddFilter(false)
	}

	function updateFilter(
		id: string,
		field: keyof TFilterCondition,
		value: string
	) {
		const updatedFilters = filters.map(function(filter) {
			return filter.id === id ? { ...filter, [field]: value } : filter
		})
		onFiltersChange(updatedFilters)
	}

	function removeFilter(id: string) {
		onFiltersChange(filters.filter(function(filter) { return filter.id !== id }))
	}

	function clearAllFilters() {
		onFiltersChange([])
	}

	function applyFilters() {
		console.log('Applying filters:', filters)
	}

	return (
		<div className='bg-zinc-950 border-b border-zinc-800 p-4'>
			<div className='flex items-center justify-between mb-4'>
				<button
					onClick={function() { setShowAddFilter(true) }}
					className='flex items-center space-x-2 text-zinc-400 hover:text-zinc-300 transition-colors'
				>
					<Plus size={16} />
					<span className='text-sm'>Add filters</span>
				</button>
			</div>

			{filters.length > 0 && (
				<div className='space-y-3'>
					{filters.map(function(filter) { return (
						<div
							key={filter.id}
							className='flex items-center space-x-3'
						>
							<select
								value={filter.column}
								onChange={function(e) {
									updateFilter(
										filter.id,
										'column',
										e.target.value
									)
								}}
								className='bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-300 text-sm focus:outline-none focus:border-zinc-600'
							>
								{columns.map(function(column) { return (
									<option key={column} value={column}>
										{column}
									</option>
								)})}
							</select>

							<select
								value={filter.operator}
								onChange={function(e) {
									updateFilter(
										filter.id,
										'operator',
										e.target.value
									)
								}}
								className='bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-300 text-sm focus:outline-none focus:border-zinc-600'
							>
								{operators.map(function(op) { return (
									<option key={op.value} value={op.value}>
										{op.label}
									</option>
								)})}
							</select>

							<input
								type='text'
								value={filter.value}
								onChange={function(e) {
									updateFilter(
										filter.id,
										'value',
										e.target.value
									)
								}}
								placeholder='Enter value'
								className='bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-300 text-sm focus:outline-none focus:border-zinc-600 flex-1'
							/>

							<button
								onClick={function() { removeFilter(filter.id) }}
								className='p-2 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors'
							>
								<X size={16} />
							</button>
						</div>
					)})}

					<div className='flex items-center space-x-3 pt-2'>
						<button
							onClick={clearAllFilters}
							className='px-4 py-2 text-zinc-400 hover:text-zinc-300 text-sm transition-colors'
						>
							Clear
						</button>
						<button
							onClick={applyFilters}
							className='px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm rounded transition-colors'
						>
							Apply
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
