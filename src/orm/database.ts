import { createSchema, type SchemaDefinition } from '@remcostoeten/orm'
import { QueryBuilder } from './query-builder'
import type { TConnection } from '../types/connections'

type TConnectionRegistry = Map<string, TConnection>
type TSchemaRegistry = Map<string, SchemaDefinition>

export class Database {
  private connections: TConnectionRegistry = new Map()
  private schemas: TSchemaRegistry = new Map()

  registerConnection(id: string, connection: TConnection): void {
    this.connections.set(id, connection)
  }

  registerSchema(name: string, schema: SchemaDefinition): void {
    this.schemas.set(name, schema)
  }

  createSchemaBuilder(tableName: string) {
    return createSchema(tableName)
  }

  getQueryBuilder(schemaName: string, connectionId: string): QueryBuilder {
    const schema = this.schemas.get(schemaName)
    if (!schema) {
      throw new Error(`Schema '${schemaName}' not found`)
    }

    const connection = this.connections.get(connectionId)
    if (!connection) {
      throw new Error(`Connection '${connectionId}' not found`)
    }

    return new QueryBuilder(schema, connection)
  }

  async createTable(schemaName: string, connectionId: string): Promise<void> {
    const schema = this.schemas.get(schemaName)
    if (!schema) {
      throw new Error(`Schema '${schemaName}' not found`)
    }

    const connection = this.connections.get(connectionId)
    if (!connection) {
      throw new Error(`Connection '${connectionId}' not found`)
    }

    const sql = this.generateCreateTableSQL(schema, connection.type)
    
    if (connection.type === 'sqlite') {
      connection.db.prepare(sql).run()
    } else if (connection.type === 'postgres') {
      await connection.db.query(sql)
    }
  }

  private generateCreateTableSQL(schema: SchemaDefinition, dbType: 'sqlite' | 'postgres'): string {
    const { table, columns } = schema
    
    const columnDefinitions = Object.entries(columns).map(([name, column]) => {
      let sql = `${name} ${this.mapColumnType(column.type, dbType)}`
      
      if (column.constraints) {
        const { constraints } = column
        
        if (constraints.primaryKey) {
          sql += ' PRIMARY KEY'
          if (dbType === 'sqlite' && column.type === 'integer') {
            sql += ' AUTOINCREMENT'
          }
        }
        
        if (constraints.unique && !constraints.primaryKey) {
          sql += ' UNIQUE'
        }
        
        if (constraints.nullable === false || constraints.primaryKey) {
          sql += ' NOT NULL'
        }
        
        if (constraints.default !== undefined) {
          const defaultValue = this.formatDefaultValue(constraints.default, column.type)
          sql += ` DEFAULT ${defaultValue}`
        }
        
        if (constraints.maxLength && (column.type === 'string' || column.type === 'text')) {
          if (dbType === 'postgres') {
            sql = sql.replace(/TEXT|VARCHAR/i, `VARCHAR(${constraints.maxLength})`)
          }
        }
      }
      
      return sql
    })
    
    return `CREATE TABLE ${table} (\n  ${columnDefinitions.join(',\n  ')}\n)`
  }

  private mapColumnType(ormType: string, dbType: 'sqlite' | 'postgres'): string {
    const typeMap = {
      sqlite: {
        string: 'TEXT',
        text: 'TEXT',
        integer: 'INTEGER',
        number: 'REAL',
        boolean: 'INTEGER',
        date: 'TEXT',
        datetime: 'TEXT',
        timestamp: 'TEXT',
        json: 'TEXT',
        uuid: 'TEXT',
        binary: 'BLOB'
      },
      postgres: {
        string: 'VARCHAR',
        text: 'TEXT',
        integer: 'INTEGER',
        number: 'DECIMAL',
        boolean: 'BOOLEAN',
        date: 'DATE',
        datetime: 'TIMESTAMP',
        timestamp: 'TIMESTAMP',
        json: 'JSONB',
        uuid: 'UUID',
        binary: 'BYTEA'
      }
    }
    
    return typeMap[dbType][ormType] || 'TEXT'
  }

  private formatDefaultValue(value: any, columnType: string): string {
    if (value === null) return 'NULL'
    if (typeof value === 'string') return `'${value}'`
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
    if (typeof value === 'number') return String(value)
    if (value instanceof Date) return `'${value.toISOString()}'`
    
    return `'${String(value)}'`
  }

  async dropTable(schemaName: string, connectionId: string): Promise<void> {
    const schema = this.schemas.get(schemaName)
    if (!schema) {
      throw new Error(`Schema '${schemaName}' not found`)
    }

    const connection = this.connections.get(connectionId)
    if (!connection) {
      throw new Error(`Connection '${connectionId}' not found`)
    }

    const sql = `DROP TABLE IF EXISTS ${schema.table}`
    
    if (connection.type === 'sqlite') {
      connection.db.prepare(sql).run()
    } else if (connection.type === 'postgres') {
      await connection.db.query(sql)
    }
  }

  async tableExists(schemaName: string, connectionId: string): Promise<boolean> {
    const schema = this.schemas.get(schemaName)
    if (!schema) {
      throw new Error(`Schema '${schemaName}' not found`)
    }

    const connection = this.connections.get(connectionId)
    if (!connection) {
      throw new Error(`Connection '${connectionId}' not found`)
    }

    let sql: string
    if (connection.type === 'sqlite') {
      sql = `SELECT name FROM sqlite_master WHERE type='table' AND name='${schema.table}'`
      const result = connection.db.prepare(sql).get()
      return !!result
    } else if (connection.type === 'postgres') {
      sql = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${schema.table}'`
      const result = await connection.db.query(sql)
      return result.rows.length > 0
    }

    return false
  }

  listSchemas(): string[] {
    return Array.from(this.schemas.keys())
  }

  listConnections(): string[] {
    return Array.from(this.connections.keys())
  }

  getSchema(name: string): SchemaDefinition | undefined {
    return this.schemas.get(name)
  }

  getConnection(id: string): TConnection | undefined {
    return this.connections.get(id)
  }
}

export const database = new Database()
