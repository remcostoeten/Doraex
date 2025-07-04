import type { TConnection, TConnectionConfig, TConnectionTest } from '../types/connections'
import * as sqlite from './sqlite'
import * as postgres from './postgres'
import { parsePostgresUrl } from '../utils/parsers'

const connections = new Map<string, TConnection>()

async function testConnection(type: 'sqlite' | 'postgres', config: TConnectionConfig): Promise<TConnectionTest> {
  try {
    if (type === 'sqlite') {
      await sqlite.testConnection(config.sqlite!)
      return { success: true, message: 'SQLite connection successful' }
    } else if (type === 'postgres') {
      await postgres.testConnection(config.postgres!)
      return { success: true, message: 'PostgreSQL connection successful' }
    }
    return { success: false, message: 'Unknown database type', error: 'Unsupported database type' }
  } catch (error) {
    return {
      success: false,
      message: 'Connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function createConnection(type: 'sqlite' | 'postgres', config: TConnectionConfig, connectionId: string): Promise<void> {
  let db
  
  if (type === 'sqlite') {
    db = sqlite.createSqliteConnection(config.sqlite!)
    connections.set(connectionId, { type: 'sqlite', db, config: { sqlite: config.sqlite } })
  } else if (type === 'postgres') {
    if (config.url) {
      const postgresConfig = parsePostgresUrl(config.url)
      db = await postgres.createPostgresConnection(postgresConfig)
      connections.set(connectionId, { type: 'postgres', db, config: { url: config.url } })
    } else {
      db = await postgres.createPostgresConnection(config.postgres!)
      connections.set(connectionId, { type: 'postgres', db, config: { postgres: config.postgres } })
    }
  } else {
    throw new Error('Unsupported database type')
  }
}

async function executeQuery(connectionId: string, query: string) {
  const connection = connections.get(connectionId)
  if (!connection) {
    throw new Error('Connection not found')
  }
  
  if (connection.type === 'sqlite') {
    return sqlite.executeQuery(connection.db, query)
  } else if (connection.type === 'postgres') {
    return postgres.executeQuery(connection.db, query)
  }
  
  throw new Error('Unknown connection type')
}

async function getTables(connectionId: string) {
  const connection = connections.get(connectionId)
  if (!connection) {
    throw new Error('Connection not found')
  }
  
  if (connection.type === 'sqlite') {
    return connection.db.prepare(sqlite.getTablesQuery()).all()
  } else if (connection.type === 'postgres') {
    const result = await connection.db.query(postgres.getTablesQuery())
    return result.rows
  }
  
  throw new Error('Unknown connection type')
}

function getConnections(): Map<string, TConnection> {
  return connections
}

export { testConnection, createConnection, executeQuery, getTables, getConnections }
