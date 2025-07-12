import type { Tab, TableData, QueryData } from '../types/types'

export function createTableTab(
	id: string,
	tableName: string,
	data: TTableData
): TTab {
	return {
		id,
		title: tableName,
		type: 'table',
		isCloseable: true,
		content: data
	}
}

export function createQueryTab(
	id: string,
	title: string = 'Untitled Query'
): TTab {
	return {
		id,
		title,
		type: 'query',
		isCloseable: true,
		content: {
			query: '# + B to get AI assistant',
			results: null
		} as TQueryData
	}
}

export function createMessagesTab(id: string): TTab {
	return {
		id,
		title: 'messages',
		type: 'messages',
		isCloseable: true
	}
}
