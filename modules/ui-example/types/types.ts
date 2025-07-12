export type TTab = {
	id: string
	title: string
	type: 'table' | 'query' | 'messages'
	content?: any
	isCloseable?: boolean
}

export type TTableData = {
	columns: string[]
	rows: any[]
	tableName: string
}

export type TQueryData = {
	query: string
	results?: any[]
}
