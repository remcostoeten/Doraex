import type { TConnectionConfig } from '../types/connections'

function parsePostgresUrl(url: string): TConnectionConfig['postgres'] {
  try {
    const trimmedUrl = url.trim()
    const parsedUrl = new URL(trimmedUrl)
    
    if (parsedUrl.protocol !== 'postgres:' && parsedUrl.protocol !== 'postgresql:') {
      throw new Error('Invalid protocol. Only postgres:// and postgresql:// schemes are allowed')
    }
    
    const host = parsedUrl.hostname
    const port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : 5432
    const database = parsedUrl.pathname.slice(1)
    const user = parsedUrl.username
    const password = parsedUrl.password
    
    if (!host || !database || !user) {
      throw new Error('Missing required connection parameters')
    }
    
    // Parse query parameters for SSL and other options
    const searchParams = parsedUrl.searchParams
    const config: TConnectionConfig['postgres'] = {
      host,
      port,
      database,
      user,
      password
    }
    
    // Handle SSL parameters
    const sslMode = searchParams.get('sslmode') || searchParams.get('ssl')
    if (sslMode) {
      if (sslMode === 'require' || sslMode === 'true') {
        config.ssl = true
      } else if (sslMode === 'disable' || sslMode === 'false') {
        config.ssl = false
      } else if (sslMode === 'prefer') {
        config.ssl = { rejectUnauthorized: false }
      }
    }
    
    // Handle connection timeout
    const connectTimeout = searchParams.get('connect_timeout')
    if (connectTimeout) {
      config.connectionTimeoutMillis = parseInt(connectTimeout, 10) * 1000
    }
    
    // Handle application name
    const applicationName = searchParams.get('application_name')
    if (applicationName) {
      config.application_name = applicationName
    }
    
    // Handle max connections
    const maxConnections = searchParams.get('max_connections')
    if (maxConnections) {
      config.max = parseInt(maxConnections, 10)
    }
    
    return config
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
      return {
        type,
        config: { isUrlConnection: true }
      }
    } else if (config.postgres) {
      return {
        type,
        config: {
          postgres: {
            host: config.postgres.host,
            port: config.postgres.port,
            database: config.postgres.database,
            user: config.postgres.user
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

export { parsePostgresUrl, createSanitizedConnectionInfo, createConnectionId, validateConnectionName }
