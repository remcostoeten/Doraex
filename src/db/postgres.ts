import { Client, Pool } from 'pg'
import type { TConnectionConfig } from '../types/connections'

const pools = new Map<string, Pool>()

function createCloudConfig(config: TConnectionConfig['postgres']) {
  if (!config) throw new Error('Postgres config is required')
  
  // Default cloud configuration
  const cloudConfig = {
    ...config,
    // Enable SSL by default for cloud connections
    ssl: config.ssl !== undefined ? config.ssl : {
      rejectUnauthorized: false // Common for cloud providers
    },
    // Connection timeouts for cloud reliability
    connectionTimeoutMillis: config.connectionTimeoutMillis || 30000,
    idleTimeoutMillis: config.idleTimeoutMillis || 30000,
    // Pool settings for cloud efficiency
    max: config.max || 10,
    // Application identification
    application_name: config.application_name || 'db-viewer'
  }
  
  // Detect cloud providers and apply specific optimizations
  if (config.host?.includes('amazonaws.com')) {
    // AWS RDS optimizations
    cloudConfig.ssl = config.ssl !== undefined ? config.ssl : { rejectUnauthorized: false }
    cloudConfig.connectionTimeoutMillis = 30000
  } else if (config.host?.includes('supabase.co')) {
    // Supabase optimizations
    cloudConfig.ssl = config.ssl !== undefined ? config.ssl : true
    cloudConfig.connectionTimeoutMillis = 20000
  } else if (config.host?.includes('neon.tech')) {
    // Neon optimizations
    cloudConfig.ssl = config.ssl !== undefined ? config.ssl : true
    cloudConfig.connectionTimeoutMillis = 15000
  } else if (config.host?.includes('planetscale.com')) {
    // PlanetScale optimizations
    cloudConfig.ssl = config.ssl !== undefined ? config.ssl : true
    cloudConfig.connectionTimeoutMillis = 20000
  } else if (config.host?.includes('railway.app')) {
    // Railway optimizations
    cloudConfig.ssl = config.ssl !== undefined ? config.ssl : true
    cloudConfig.connectionTimeoutMillis = 25000
  } else if (config.host?.includes('render.com')) {
    // Render optimizations
    cloudConfig.ssl = config.ssl !== undefined ? config.ssl : true
    cloudConfig.connectionTimeoutMillis = 25000
  }
  
  return cloudConfig
}

async function createPostgresConnection(config: TConnectionConfig['postgres']): Promise<Client> {
  if (!config) throw new Error('Postgres config is required')
  
  const cloudConfig = createCloudConfig(config)
  const client = new Client(cloudConfig)
  
  try {
    await client.connect()
    return client
  } catch (error) {
    throw new Error(`PostgreSQL connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function createPostgresPool(config: TConnectionConfig['postgres'], poolId: string): Promise<Pool> {
  if (!config) throw new Error('Postgres config is required')
  
  const cloudConfig = createCloudConfig(config)
  const pool = new Pool(cloudConfig)
  
  // Handle pool errors
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err)
  })
  
  pools.set(poolId, pool)
  return pool
}

function getPool(poolId: string): Pool | undefined {
  return pools.get(poolId)
}

function getTablesQuery(): string {
  return `SELECT table_name as name FROM information_schema.tables WHERE table_schema = 'public'`
}

async function executeQuery(client: Client, query: string) {
  const result = await client.query(query)
  return result.rows
}

async function testConnection(config: TConnectionConfig['postgres']): Promise<void> {
  const testClient = await createPostgresConnection(config)
  await testClient.query('SELECT 1')
  await testClient.end()
}

export { createPostgresConnection, getTablesQuery, executeQuery, testConnection }
