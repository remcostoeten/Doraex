import type { TConnection, TConnectionConfig, TConnectionTest } from '../types/connections'
import * as sqlite from './sqlite'
import * as postgres from './postgres'
import { parsePostgresUrl } from '../utils/parsers'

const connections = new Map<string, TConnection>()
const SYSTEM_CONNECTION_ID = 'sample-db' // Our SQLite system database

// Load saved connections on startup
export async function loadSavedConnections() {
  try {
    const result = await executeQuery(SYSTEM_CONNECTION_ID, 'SELECT * FROM connections WHERE is_active = 1')
    
    for (const row of result) {
      try {
        const config = JSON.parse(row.config)
        await createConnection(row.type, config, row.id)
        console.log(`✅ Restored connection: ${row.name} (${row.type})`)
      } catch (error) {
        console.error(`❌ Failed to restore connection ${row.name}:`, error)
      }
    }
  } catch (error) {
    console.error('Failed to load saved connections:', error)
  }
}

// Save connection to database
async function saveConnectionToDB(connectionId: string, name: string, type: string, config: TConnectionConfig) {
  try {
    const configJson = JSON.stringify(config)
    await executeQuery(SYSTEM_CONNECTION_ID, 
      `INSERT OR REPLACE INTO connections (id, name, type, config, is_active, updated_at) 
       VALUES ('${connectionId}', '${name}', '${type}', '${configJson}', 1, CURRENT_TIMESTAMP)`
    )
  } catch (error) {
    console.error('Failed to save connection to database:', error)
  }
}

// Get saved connections from database
export async function getSavedConnections() {
  try {
    return await executeQuery(SYSTEM_CONNECTION_ID, 'SELECT id, name, type, is_active, created_at FROM connections WHERE is_active = 1')
  } catch (error) {
    console.error('Failed to get saved connections:', error)
    return []
  }
}

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

async function createConnection(type: 'sqlite' | 'postgres', config: TConnectionConfig, connectionId: string, name?: string, saveToDb: boolean = true): Promise<void> {
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
  
  // Save to database (skip for system connection to avoid recursion)
  if (saveToDb && connectionId !== SYSTEM_CONNECTION_ID && name) {
    await saveConnectionToDB(connectionId, name, type, config)
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
