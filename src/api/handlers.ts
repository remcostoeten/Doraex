import type { Context } from 'hono'
import { testConnection, createConnection, executeQuery, getTables, getConnections, getSavedConnections } from '../db'
import { createSanitizedConnectionInfo, createConnectionId, validateConnectionName, parsePostgresUrl } from '../utils/parsers'
import type { TConnectionConfig } from '../types/connections'

async function getAllConnections(c: Context) {
  try {
    const connectionList = Array.from(getConnections().keys()).map(id => {
      const connection = getConnections().get(id)
      if (!connection) {
        return { id, type: 'unknown', name: 'Unknown', isConnected: false }
      }
      
      const sanitizedInfo = createSanitizedConnectionInfo(connection.config, connection.type)
      return {
        id,
        name: sanitizedInfo.database || sanitizedInfo.name || id,
        type: connection.type,
        database: sanitizedInfo.database || 'unknown',
        host: sanitizedInfo.host,
        port: sanitizedInfo.port,
        isConnected: true,
        ...sanitizedInfo
      }
    })
    
    return c.json({ success: true, data: connectionList })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500)
  }
}

async function testConnectionHandler(c: Context) {
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
}

async function createConnectionHandler(c: Context) {
  try {
    const { type, config, name } = await c.req.json()
    
    if (!validateConnectionName(name)) {
      return c.json({ error: 'Invalid connection name' }, 400)
    }
    
    const connectionId = createConnectionId(name)
    
    let finalConfig: TConnectionConfig
    
    if (type === 'postgres' && config.url) {
      try {
        const postgresConfig = parsePostgresUrl(config.url)
        finalConfig = { postgres: postgresConfig, url: config.url }
      } catch (error) {
        return c.json({ error: 'Malformed connection URL' }, 400)
      }
    } else {
      finalConfig = { [type]: config }
    }
    
    await createConnection(type, finalConfig, connectionId, name, true)
    return c.json({ id: connectionId, message: 'Connection created successfully' })
  } catch (error) {
    const sanitizedError = error instanceof Error ? error.message : 'Unknown error'
    return c.json({ error: sanitizedError }, 500)
  }
}

async function executeQueryHandler(c: Context) {
  try {
    const connectionId = c.req.param('id')
    const { query } = await c.req.json()
    
    if (!connectionId) {
      return c.json({ success: false, error: 'Connection ID is required' }, 400)
    }
    
    const result = await executeQuery(connectionId, query)
    
    return c.json({
      success: true,
      data: {
        rows: Array.isArray(result) ? result : [result],
        executedAt: new Date().toISOString(),
        query
      }
    })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500)
  }
}

async function getTablesHandler(c: Context) {
  try {
    const connectionId = c.req.param('id')
    
    if (!connectionId) {
      return c.json({ success: false, error: 'Connection ID is required' }, 400)
    }
    
    const tables = await getTables(connectionId)
    return c.json({ success: true, data: tables })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500)
  }
}

export { getAllConnections, testConnectionHandler, createConnectionHandler, executeQueryHandler, getTablesHandler }
