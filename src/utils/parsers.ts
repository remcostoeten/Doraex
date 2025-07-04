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
