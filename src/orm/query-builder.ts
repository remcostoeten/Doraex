import type { SchemaDefinition } from '@remcostoeten/orm'
import type { TConnection } from '../types/connections'

type TWhereOperator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'NOT IN'
type TOrderDirection = 'ASC' | 'DESC'

type TWhereClause = {
  field: string
  operator: TWhereOperator
  value: any
}

type TJoinClause = {
  table: string
  on: string
  type?: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'
}

type TSelectOptions = {
  where?: TWhereClause[]
  joins?: TJoinClause[]
  orderBy?: { field: string; direction: TOrderDirection }[]
  limit?: number
  offset?: number
}

type TInsertData = Record<string, any>
type TUpdateData = Record<string, any>

type TQueryBuilderContext = {
  schema: SchemaDefinition
  connection: TConnection
}

function escapeValue(value: any): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  if (value instanceof Date) return `'${value.toISOString()}'`
  if (Array.isArray(value)) return `(${value.map(v => escapeValue(v)).join(', ')})`
  return String(value)
}

function buildWhereClause(conditions: TWhereClause[]): string {
  if (conditions.length === 0) return ''
  
  const clauses = conditions.map(condition => {
    const { field, operator, value } = condition
    
    if (operator === 'IN' || operator === 'NOT IN') {
      return `${field} ${operator} ${escapeValue(value)}`
    }
    
    return `${field} ${operator} ${escapeValue(value)}`
  })
  
  return `WHERE ${clauses.join(' AND ')}`
}

function buildJoinClause(joins: TJoinClause[]): string {
  if (joins.length === 0) return ''
  
  return joins.map(join => {
    const joinType = join.type || 'INNER'
    return `${joinType} JOIN ${join.table} ON ${join.on}`
  }).join(' ')
}

function buildOrderByClause(orderBy: { field: string; direction: TOrderDirection }[]): string {
  if (orderBy.length === 0) return ''
  
  const clauses = orderBy.map(order => `${order.field} ${order.direction}`)
  return `ORDER BY ${clauses.join(', ')}`
}

function buildLimitClause(connection: TConnection, limit?: number, offset?: number): string {
  if (!limit) return ''
  
  if (connection.type === 'postgres') {
    return `LIMIT ${limit}${offset ? ` OFFSET ${offset}` : ''}`
  } else {
    return `LIMIT ${limit}${offset ? ` OFFSET ${offset}` : ''}`
  }
}

async function executeQuery(connection: TConnection, query: string): Promise<any[]> {
  if (connection.type === 'sqlite') {
    const db = connection.db
    return db.prepare(query).all()
  } else if (connection.type === 'postgres') {
    const db = connection.db
    const result = await db.query(query)
    return result.rows
  }
  
  throw new Error('Unsupported database type')
}

function findPrimaryKeyColumn(schema: SchemaDefinition): [string, any] | null {
  const primaryKeyColumn = Object.entries(schema.columns).find(
    ([_, column]) => column.constraints?.primaryKey
  )
  
  return primaryKeyColumn || null
}

export function createQueryBuilder(schema: SchemaDefinition, connection: TConnection) {
  const context: TQueryBuilderContext = { schema, connection }

  async function select(options: TSelectOptions = {}): Promise<any[]> {
    const { where = [], joins = [], orderBy = [], limit, offset } = options
    
    const selectClause = `SELECT * FROM ${context.schema.table}`
    const joinClause = buildJoinClause(joins)
    const whereClause = buildWhereClause(where)
    const orderByClause = buildOrderByClause(orderBy)
    const limitClause = buildLimitClause(context.connection, limit, offset)
    
    const query = [selectClause, joinClause, whereClause, orderByClause, limitClause]
      .filter(Boolean)
      .join(' ')
    
    return executeQuery(context.connection, query)
  }

  async function selectColumns(columns: string[], options: TSelectOptions = {}): Promise<any[]> {
    const { where = [], joins = [], orderBy = [], limit, offset } = options
    
    const selectClause = `SELECT ${columns.join(', ')} FROM ${context.schema.table}`
    const joinClause = buildJoinClause(joins)
    const whereClause = buildWhereClause(where)
    const orderByClause = buildOrderByClause(orderBy)
    const limitClause = buildLimitClause(context.connection, limit, offset)
    
    const query = [selectClause, joinClause, whereClause, orderByClause, limitClause]
      .filter(Boolean)
      .join(' ')
    
    return executeQuery(context.connection, query)
  }

  async function findById(id: any): Promise<any | null> {
    const primaryKeyColumn = findPrimaryKeyColumn(context.schema)
    
    if (!primaryKeyColumn) {
      throw new Error('No primary key found in schema')
    }
    
    const [primaryKeyName] = primaryKeyColumn
    const results = await select({
      where: [{ field: primaryKeyName, operator: '=', value: id }],
      limit: 1
    })
    
    return results.length > 0 ? results[0] : null
  }

  async function findOne(options: TSelectOptions): Promise<any | null> {
    const results = await select({ ...options, limit: 1 })
    return results.length > 0 ? results[0] : null
  }

  async function findMany(options: TSelectOptions): Promise<any[]> {
    return select(options)
  }

  async function insert(data: TInsertData): Promise<any> {
    const columns = Object.keys(data)
    const values = Object.values(data)
    
    const columnsClause = columns.join(', ')
    const valuesClause = values.map(v => escapeValue(v)).join(', ')
    
    const query = `INSERT INTO ${context.schema.table} (${columnsClause}) VALUES (${valuesClause})`
    
    if (context.connection.type === 'sqlite') {
      const db = context.connection.db
      const result = db.prepare(query).run()
      return { insertId: result.lastInsertRowid, changes: result.changes }
    } else if (context.connection.type === 'postgres') {
      const db = context.connection.db
      const result = await db.query(`${query} RETURNING *`)
      return result.rows[0]
    }
    
    throw new Error('Unsupported database type')
  }

  async function update(data: TUpdateData, options: { where: TWhereClause[] }): Promise<number> {
    const { where } = options
    
    const setClause = Object.entries(data)
      .map(([key, value]) => `${key} = ${escapeValue(value)}`)
      .join(', ')
    
    const whereClause = buildWhereClause(where)
    
    const query = `UPDATE ${context.schema.table} SET ${setClause} ${whereClause}`
    
    if (context.connection.type === 'sqlite') {
      const db = context.connection.db
      const result = db.prepare(query).run()
      return result.changes
    } else if (context.connection.type === 'postgres') {
      const db = context.connection.db
      const result = await db.query(query)
      return result.rowCount || 0
    }
    
    throw new Error('Unsupported database type')
  }

  async function updateById(id: any, data: TUpdateData): Promise<boolean> {
    const primaryKeyColumn = findPrimaryKeyColumn(context.schema)
    
    if (!primaryKeyColumn) {
      throw new Error('No primary key found in schema')
    }
    
    const [primaryKeyName] = primaryKeyColumn
    const changes = await update(data, {
      where: [{ field: primaryKeyName, operator: '=', value: id }]
    })
    
    return changes > 0
  }

  async function deleteRecords(options: { where: TWhereClause[] }): Promise<number> {
    const { where } = options
    const whereClause = buildWhereClause(where)
    
    const query = `DELETE FROM ${context.schema.table} ${whereClause}`
    
    if (context.connection.type === 'sqlite') {
      const db = context.connection.db
      const result = db.prepare(query).run()
      return result.changes
    } else if (context.connection.type === 'postgres') {
      const db = context.connection.db
      const result = await db.query(query)
      return result.rowCount || 0
    }
    
    throw new Error('Unsupported database type')
  }

  async function deleteById(id: any): Promise<boolean> {
    const primaryKeyColumn = findPrimaryKeyColumn(context.schema)
    
    if (!primaryKeyColumn) {
      throw new Error('No primary key found in schema')
    }
    
    const [primaryKeyName] = primaryKeyColumn
    const changes = await deleteRecords({
      where: [{ field: primaryKeyName, operator: '=', value: id }]
    })
    
    return changes > 0
  }

  async function count(options: { where?: TWhereClause[] } = {}): Promise<number> {
    const { where = [] } = options
    const whereClause = buildWhereClause(where)
    
    const query = `SELECT COUNT(*) as count FROM ${context.schema.table} ${whereClause}`
    
    if (context.connection.type === 'sqlite') {
      const db = context.connection.db
      const result = db.prepare(query).get() as { count: number }
      return result.count
    } else if (context.connection.type === 'postgres') {
      const db = context.connection.db
      const result = await db.query(query)
      return parseInt(result.rows[0].count)
    }
    
    throw new Error('Unsupported database type')
  }

  async function exists(options: { where: TWhereClause[] }): Promise<boolean> {
    const rowCount = await count(options)
    return rowCount > 0
  }

  function rawQuery(query: string): Promise<any[]> {
    return executeQuery(context.connection, query)
  }

  return {
    select,
    selectColumns,
    findById,
    findOne,
    findMany,
    insert,
    update,
    updateById,
    delete: deleteRecords,
    deleteById,
    count,
    exists,
    rawQuery
  }
}
