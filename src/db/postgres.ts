import { Client } from 'pg'
import type { TConnectionConfig } from '../types/connections'

async function createPostgresConnection(config: TConnectionConfig['postgres']): Promise<Client> {
  if (!config) throw new Error('Postgres config is required')
  const client = new Client(config)
  await client.connect()
  return client
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
