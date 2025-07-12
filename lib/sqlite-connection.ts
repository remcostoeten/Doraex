import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

export interface SQLiteConnectionConfig {
  id: string
  name: string
  filePath: string
}

export interface TableInfo {
  name: string
  sql: string
  type: string
  tbl_name: string
  rootpage: number
}

export interface ColumnInfo {
  cid: number
  name: string
  type: string
  notnull: number
  dflt_value: any
  pk: number
}

export class SQLiteConnection {
  private config: SQLiteConnectionConfig
  private dbPath: string

  constructor(config: SQLiteConnectionConfig) {
    this.config = config
    this.dbPath = path.join(process.cwd(), "uploads", config.filePath)
  }

  private getDatabase(): Database.Database {
    if (!fs.existsSync(this.dbPath)) {
      throw new Error(`SQLite database file not found: ${this.dbPath}`)
    }
    return new Database(this.dbPath)
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const db = this.getDatabase()

      // Test with a simple query
      const result = db.prepare("SELECT 1 as test").get()
      db.close()

      return {
        success: true,
        message: "Connection successful",
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Connection failed",
      }
    }
  }

  async getTables(): Promise<TableInfo[]> {
    const db = this.getDatabase()

    try {
      const stmt = db.prepare(`
        SELECT name, sql, type, tbl_name, rootpage
        FROM sqlite_master 
        WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `)

      const tables = stmt.all() as TableInfo[]
      return tables
    } finally {
      db.close()
    }
  }

  async getTableColumns(tableName: string): Promise<ColumnInfo[]> {
    const db = this.getDatabase()

    try {
      const stmt = db.prepare(`PRAGMA table_info(${tableName})`)
      const columns = stmt.all() as ColumnInfo[]
      return columns
    } finally {
      db.close()
    }
  }

  async getTableData(
    tableName: string,
    limit = 100,
    offset = 0,
  ): Promise<{
    data: any[]
    total: number
    columns: ColumnInfo[]
  }> {
    const db = this.getDatabase()

    try {
      // Get column information
      const columnsStmt = db.prepare(`PRAGMA table_info(${tableName})`)
      const columns = columnsStmt.all() as ColumnInfo[]

      // Get total count
      const countStmt = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`)
      const countResult = countStmt.get() as { count: number }
      const total = countResult.count

      // Get data with pagination
      const dataStmt = db.prepare(`SELECT * FROM ${tableName} LIMIT ? OFFSET ?`)
      const data = dataStmt.all(limit, offset)

      return {
        data,
        total,
        columns,
      }
    } finally {
      db.close()
    }
  }

  async executeQuery(query: string): Promise<{
    data: any[]
    columns: string[]
    rowsAffected?: number
  }> {
    const db = this.getDatabase()

    try {
      const trimmedQuery = query.trim().toLowerCase()

      if (trimmedQuery.startsWith("select")) {
        // For SELECT queries
        const stmt = db.prepare(query)
        const data = stmt.all()

        // Get column names from the first row or from the statement
        const columns = data.length > 0 ? Object.keys(data[0]) : []

        return {
          data,
          columns,
        }
      } else {
        // For INSERT, UPDATE, DELETE queries
        const stmt = db.prepare(query)
        const result = stmt.run()

        return {
          data: [],
          columns: [],
          rowsAffected: result.changes,
        }
      }
    } finally {
      db.close()
    }
  }

  async createTable(
    tableName: string,
    columns: Array<{
      name: string
      type: string
      nullable: boolean
      primaryKey: boolean
      defaultValue?: string
    }>,
  ): Promise<void> {
    const db = this.getDatabase()

    try {
      const columnDefinitions = columns
        .map((col) => {
          let def = `${col.name} ${col.type}`
          if (col.primaryKey) def += " PRIMARY KEY"
          if (!col.nullable && !col.primaryKey) def += " NOT NULL"
          if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`
          return def
        })
        .join(", ")

      const createTableSQL = `CREATE TABLE ${tableName} (${columnDefinitions})`
      db.exec(createTableSQL)
    } finally {
      db.close()
    }
  }

  async dropTable(tableName: string): Promise<void> {
    const db = this.getDatabase()

    try {
      db.exec(`DROP TABLE IF EXISTS ${tableName}`)
    } finally {
      db.close()
    }
  }

  async renameTable(oldName: string, newName: string): Promise<void> {
    const db = this.getDatabase()

    try {
      db.exec(`ALTER TABLE ${oldName} RENAME TO ${newName}`)
    } finally {
      db.close()
    }
  }

  async addColumn(
    tableName: string,
    columnName: string,
    columnType: string,
    nullable = true,
    defaultValue?: string,
  ): Promise<void> {
    const db = this.getDatabase()

    try {
      let alterSQL = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`
      if (!nullable) alterSQL += " NOT NULL"
      if (defaultValue) alterSQL += ` DEFAULT ${defaultValue}`

      db.exec(alterSQL)
    } finally {
      db.close()
    }
  }

  async dropColumn(tableName: string, columnName: string): Promise<void> {
    const db = this.getDatabase()

    try {
      // SQLite doesn't support DROP COLUMN directly, so we need to recreate the table
      const columns = await this.getTableColumns(tableName)
      const remainingColumns = columns.filter((col) => col.name !== columnName)

      if (remainingColumns.length === 0) {
        throw new Error("Cannot drop all columns from table")
      }

      // Start transaction
      db.exec("BEGIN TRANSACTION")

      try {
        // Create new table without the column
        const columnDefs = remainingColumns
          .map((col) => {
            let def = `${col.name} ${col.type}`
            if (col.pk) def += " PRIMARY KEY"
            if (col.notnull && !col.pk) def += " NOT NULL"
            if (col.dflt_value !== null) def += ` DEFAULT ${col.dflt_value}`
            return def
          })
          .join(", ")

        const tempTableName = `${tableName}_temp_${Date.now()}`
        db.exec(`CREATE TABLE ${tempTableName} (${columnDefs})`)

        // Copy data
        const columnNames = remainingColumns.map((col) => col.name).join(", ")
        db.exec(`INSERT INTO ${tempTableName} (${columnNames}) SELECT ${columnNames} FROM ${tableName}`)

        // Drop old table and rename new one
        db.exec(`DROP TABLE ${tableName}`)
        db.exec(`ALTER TABLE ${tempTableName} RENAME TO ${tableName}`)

        db.exec("COMMIT")
      } catch (error) {
        db.exec("ROLLBACK")
        throw error
      }
    } finally {
      db.close()
    }
  }

  getConfig(): SQLiteConnectionConfig {
    return this.config
  }
}
