import Database from 'better-sqlite3'
import type { TConnectionConfig } from '../types/connections'

function createSqliteConnection(config: { path: string }): Database {
  return new Database(config.path)
}

function getTablesQuery(): string {
  return `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
}

function executeQuery(db: Database, query: string) {
  if (query.trim().toLowerCase().startsWith('select')) {
    return db.prepare(query).all()
  } else {
    return db.prepare(query).run()
  }
}

async function testConnection(config: TConnectionConfig['sqlite']): Promise<void> {
  const testDb = createSqliteConnection(config!)
  testDb.prepare('SELECT 1').get()
  testDb.close()
}

export { createSqliteConnection, getTablesQuery, executeQuery, testConnection }
