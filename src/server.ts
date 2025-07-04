import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import Database from 'better-sqlite3'
import { Client } from 'pg'

// Types
type TConnectionConfig = {
  sqlite?: { path: string }
  postgres?: {
    host: string
    port: number
    database: string
    user: string
    password: string
  }
  url?: string // For postgres connection URLs
}

type TConnection = {
  type: 'sqlite' | 'postgres'
  db: Database | Client
  config: TConnectionConfig
}

type TQueryResult = {
  result: any[]
  executedAt: string
  query: string
}

// Database connections store
const connections = new Map<string, TConnection>()

// Helper functions
function parsePostgresUrl(url: string): TConnectionConfig['postgres'] {
  try {
    // Trim surrounding whitespace before parsing
    const trimmedUrl = url.trim()
    const parsedUrl = new URL(trimmedUrl)
    
    // Reject URL schemes other than postgres/postgresql
    if (parsedUrl.protocol !== 'postgres:' && parsedUrl.protocol !== 'postgresql:') {
      throw new Error('Invalid protocol. Only postgres:// and postgresql:// schemes are allowed')
    }
    
    const host = parsedUrl.hostname
    const port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : 5432
    const database = parsedUrl.pathname.slice(1) // Remove leading slash
    const user = parsedUrl.username
    const password = parsedUrl.password
    
    if (!host || !database || !user) {
      throw new Error('Missing required connection parameters')
    }
    
    return {
      host,
      port,
      database,
      user,
      password
    }
  } catch (error) {
    throw new Error('Malformed connection URL')
  }
}

function createSanitizedConnectionInfo(config: TConnectionConfig, type: 'sqlite' | 'postgres') {
  if (type === 'sqlite') {
    return {
      type,
      config: { sqlite: config.sqlite }
    }
  } else if (type === 'postgres') {
    if (config.url) {
      // For URL connections, just indicate it's a URL connection without exposing the URL
      return {
        type,
        config: { isUrlConnection: true }
      }
    } else if (config.postgres) {
      // For direct config, sanitize password and sensitive info
      return {
        type,
        config: {
          postgres: {
            host: config.postgres.host,
            port: config.postgres.port,
            database: config.postgres.database,
            user: config.postgres.user
            // password intentionally omitted
          }
        }
      }
    }
  }
  return { type, config: {} }
}

function createConnectionId(name: string): string {
  return `${name}_${Date.now()}`
}

function validateConnectionName(name: string): boolean {
  return typeof name === 'string' && name.trim().length > 0
}

async function testConnection(type: 'sqlite' | 'postgres', config: TConnectionConfig): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    if (type === 'sqlite') {
      const testDb = createSqliteConnection(config.sqlite!)
      // Test with a simple query
      testDb.prepare('SELECT 1').get()
      testDb.close()
      return { success: true, message: 'SQLite connection successful' }
    } else if (type === 'postgres') {
      const testClient = await createPostgresConnection(config.postgres!)
      // Test with a simple query
      await testClient.query('SELECT 1')
      await testClient.end()
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

function createSqliteConnection(config: { path: string }): Database {
  return new Database(config.path)
}

async function createPostgresConnection(config: TConnectionConfig['postgres']): Promise<Client> {
  if (!config) throw new Error('Postgres config is required')
  const client = new Client(config)
  await client.connect()
  return client
}

function getTablesQuery(type: 'sqlite' | 'postgres'): string {
  if (type === 'sqlite') {
    return `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
  }
  return `SELECT table_name as name FROM information_schema.tables WHERE table_schema = 'public'`
}

async function executeQuery(connection: TConnection, query: string) {
  if (connection.type === 'sqlite') {
    const db = connection.db as Database
    if (query.trim().toLowerCase().startsWith('select')) {
      return db.prepare(query).all()
    } else {
      return db.prepare(query).run()
    }
  } else if (connection.type === 'postgres') {
    const client = connection.db as Client
    const result = await client.query(query)
    return result.rows
  }
  throw new Error('Unknown connection type')
}

// Create the application
function createApp() {
  const app = new Hono()
  
  // Enable CORS for development
  app.use('*', cors())
  
  // Serve static files from public directory (for frontend)
  app.use('/*', serveStatic({ root: './public' }))
  
  return app
}

function createApi() {
  const api = new Hono()
  
  // Get all connections (with sanitized data)
  api.get('/connections', (c) => {
    const connectionList = Array.from(connections.keys()).map(id => {
      const connection = connections.get(id)
      if (!connection) {
        return { id, type: 'unknown' }
      }
      
      // Return sanitized connection info without sensitive data
      const sanitizedInfo = createSanitizedConnectionInfo(connection.config, connection.type)
      return {
        id,
        ...sanitizedInfo
      }
    })
    return c.json(connectionList)
  })
  
  // Test connection without creating it
  api.post('/connections/test', async (c) => {
    try {
      const { type, config } = await c.req.json()
      
      if (!type || !config) {
        return c.json({ error: 'Type and config are required' }, 400)
      }
      
      let testConfig: TConnectionConfig
      
      if (type === 'postgres' && config.url) {
        try {
          const postgresConfig = parsePostgresUrl(config.url)
          testConfig = { postgres: postgresConfig }
        } catch (error) {
          return c.json({ error: 'Malformed connection URL' }, 400)
        }
      } else {
        testConfig = { [type]: config }
      }
      
      const testResult = await testConnection(type, testConfig)
      
      return c.json(testResult)
    } catch (error) {
      return c.json({ 
        success: false, 
        message: 'Connection test failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 500)
    }
  })
  
  // Create new connection
  api.post('/connections', async (c) => {
    try {
      const { type, config, name } = await c.req.json()
      
      if (!validateConnectionName(name)) {
        return c.json({ error: 'Invalid connection name' }, 400)
      }
      
      const connectionId = createConnectionId(name)
      
      let db
      let postgresConfig: TConnectionConfig['postgres']
      
      if (type === 'sqlite') {
        db = createSqliteConnection(config)
        connections.set(connectionId, { type: 'sqlite', db, config: { sqlite: config } })
      } else if (type === 'postgres') {
        // Handle both URL and direct config for postgres
        if (config.url) {
          try {
            postgresConfig = parsePostgresUrl(config.url)
            db = await createPostgresConnection(postgresConfig)
            connections.set(connectionId, { type: 'postgres', db, config: { url: config.url } })
          } catch (error) {
            return c.json({ error: 'Malformed connection URL' }, 400)
          }
        } else {
          postgresConfig = config
          db = await createPostgresConnection(postgresConfig)
          connections.set(connectionId, { type: 'postgres', db, config: { postgres: config } })
        }
      } else {
        return c.json({ error: 'Unsupported database type' }, 400)
      }
      
      return c.json({ id: connectionId, message: 'Connection created successfully' })
    } catch (error) {
      // Log error without exposing sensitive connection details
      const sanitizedError = error instanceof Error ? error.message : 'Unknown error'
      return c.json({ error: sanitizedError }, 500)
    }
  })
  
  // Execute query
  api.post('/connections/:id/query', async (c) => {
    try {
      const connectionId = c.req.param('id')
      const { query } = await c.req.json()
      
      const connection = connections.get(connectionId)
      if (!connection) {
        return c.json({ error: 'Connection not found' }, 404)
      }
      
      const result = await executeQuery(connection, query)
      
      return c.json({ 
        result,
        executedAt: new Date().toISOString(),
        query 
      })
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500)
    }
  })
  
  // Get tables for a connection
  api.get('/connections/:id/tables', async (c) => {
    try {
      const connectionId = c.req.param('id')
      const connection = connections.get(connectionId)
      
      if (!connection) {
        return c.json({ error: 'Connection not found' }, 404)
      }
      
      let tables
      if (connection.type === 'sqlite') {
        const db = connection.db as Database
        tables = db.prepare(getTablesQuery('sqlite')).all()
      } else if (connection.type === 'postgres') {
        const client = connection.db as Client
        const result = await client.query(getTablesQuery('postgres'))
        tables = result.rows
      }
      
      return c.json(tables)
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500)
    }
  })
  
  return api
}

// Setup application
function setupApplication() {
  const app = createApp()
  const api = createApi()
  
  // Mount API routes
  app.route('/api', api)
  
  // Fallback to serve index.html for SPA routing
  app.get('*', serveStatic({ path: './public/index.html' }))
  
  return app
}

const app = setupApplication()

export default {
  port: 3002,
  fetch: app.fetch,
}
