// NEW: neon-based Postgres client – no native code!
import { neon } from "@neondatabase/serverless"

export interface PostgreSQLConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl?: boolean
}

/**
 * Lightweight, fetch-based Postgres client using @neondatabase/serverless.
 * Zero native dependencies ⇒ no node-gyp during Vercel / Bun install.
 */
export class PostgreSQLConnection {
  private sql: ReturnType<typeof neon>

  constructor(private config: PostgreSQLConfig) {
    const { host, port, database, username, password, ssl } = config
    const sslmode = ssl ? "require" : "disable"
    const conn = `postgres://${encodeURIComponent(username)}:${encodeURIComponent(
      password,
    )}@${host}:${port}/${database}?sslmode=${sslmode}`
    this.sql = neon(conn)
  }

  /* ---------- Connection test ---------- */
  async testConnection() {
    try {
      const start = Date.now()
      const [{ version }] = await this.sql`SELECT version()`
      const [{ size }] = await this.sql`SELECT pg_size_pretty(pg_database_size(current_database())) as size`
      const [{ count }] = await this
        .sql`SELECT COUNT(*)::int FROM information_schema.tables WHERE table_schema = 'public'`
      const connectionTime = Date.now() - start

      return {
        success: true,
        message: "Connection successful! Database is ready to use.",
        details: {
          serverVersion: version.split(" ")[1],
          connectionTime: `${connectionTime} ms`,
          databaseSize: size,
          tablesFound: count,
          encoding: "UTF8",
          timezone: "UTC",
          sslStatus: this.config.ssl ? "SSL connection established" : "No SSL",
        },
      }
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || "Connection failed",
      }
    }
  }

  /* ---------- Table-listing ---------- */
  async getTables() {
    type Row = {
      table_name: string
      table_type: string
      row_count: number
    }
    const rows: Row[] = await this.sql`
      SELECT t.table_name,
             t.table_type,
             COALESCE(s.n_tup_ins + s.n_tup_upd + s.n_tup_del, 0) as row_count
      FROM information_schema.tables t
      LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
      WHERE t.table_schema = 'public'
      ORDER BY t.table_name`
    const tables = await Promise.all(
      rows.map(async (r) => {
        const cols = await this.sql`
          SELECT column_name,
                 data_type,
                 is_nullable = 'YES' as nullable,
                 column_default,
                 EXISTS (
                   SELECT 1
                   FROM information_schema.table_constraints tc
                   JOIN information_schema.key_column_usage ku
                     ON ku.constraint_name = tc.constraint_name
                   WHERE tc.constraint_type = 'PRIMARY KEY'
                     AND tc.table_name = ${r.table_name}
                     AND ku.column_name = c.column_name
                 ) as is_primary
          FROM information_schema.columns c
          WHERE table_schema = 'public' AND table_name = ${r.table_name}
          ORDER BY ordinal_position`
        return {
          name: r.table_name,
          type: r.table_type === "VIEW" ? "view" : "table",
          rowCount: r.row_count,
          columns: cols.map((c: any) => ({
            name: c.column_name,
            type: c.data_type,
            nullable: c.nullable,
            primary: c.is_primary,
            default: c.column_default,
          })),
        }
      }),
    )
    return tables
  }

  /* ---------- Data fetch ---------- */
  async getTableData(table: string, limit = 50, offset = 0) {
    const [{ count }] = await this.sql`SELECT COUNT(*)::int FROM ${this.sql(table)}`
    const rows = await this.sql`
      SELECT * FROM ${this.sql(table)}
      ORDER BY 1
      LIMIT ${limit} OFFSET ${offset}`
    return { columns: rows.length ? Object.keys(rows[0]) : [], rows, totalCount: count }
  }

  /* ---------- Arbitrary query ---------- */
  async executeQuery(query: string) {
    const start = Date.now()
    const rows = await this.sql.unsafe(query)
    const executionTime = Date.now() - start
    return {
      columns: rows.length ? Object.keys(rows[0]) : [],
      rows,
      rowCount: rows.length,
      executionTime,
    }
  }
}

export function parsePostgreSQLUrl(url: string): PostgreSQLConfig {
  try {
    const parsed = new URL(url)
    
    if (!parsed.protocol.startsWith('postgres')) {
      throw new Error('URL must start with postgresql:// or postgres://')
    }
    
    return {
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port) : 5432,
      database: parsed.pathname.slice(1), // Remove leading '/'
      username: parsed.username,
      password: parsed.password,
      ssl: parsed.searchParams.get('sslmode') === 'require'
    }
  } catch (error) {
    throw new Error(`Invalid PostgreSQL URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

