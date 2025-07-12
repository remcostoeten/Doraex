import sqlite3 from "sqlite3"
import path from "path"
import fs from "fs"
import { promisify } from "util"

export interface SQLiteConnectionConfig {
  id?: string
  name?: string
  filePath: string
  fileName?: string
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
    this.dbPath = config.filePath
  }

  private async getDatabase(): Promise<sqlite3.Database> {
    if (!fs.existsSync(this.dbPath)) {
      throw new Error(`SQLite database file not found: ${this.dbPath}`)
    }
    
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve(db)
        }
      })
    })
  }

  private async runQuery(db: sqlite3.Database, query: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
        if (err) {
          reject(err)
        } else {
          resolve({ lastID: this.lastID, changes: this.changes })
        }
      })
    })
  }

  private async getAllRows(db: sqlite3.Database, query: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }

  private async getRow(db: sqlite3.Database, query: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  }

  private async closeDatabase(db: sqlite3.Database): Promise<void> {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const db = await this.getDatabase()
      
      // Test with a simple query
      await this.getRow(db, "SELECT 1 as test")
      await this.closeDatabase(db)

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
    const db = await this.getDatabase()

    try {
      const query = `
        SELECT name, sql, type, tbl_name, rootpage
        FROM sqlite_master 
        WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `
      
      const tables = await this.getAllRows(db, query) as TableInfo[]
      return tables
    } finally {
      await this.closeDatabase(db)
    }
  }

  async getTableColumns(tableName: string): Promise<ColumnInfo[]> {
    const db = await this.getDatabase()

    try {
      const query = `PRAGMA table_info("${tableName}")`
      const columns = await this.getAllRows(db, query) as ColumnInfo[]
      return columns
    } finally {
      await this.closeDatabase(db)
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
    const db = await this.getDatabase()

    try {
      // Get column information
      const columnsQuery = `PRAGMA table_info("${tableName}")`
      const columns = await this.getAllRows(db, columnsQuery) as ColumnInfo[]

      // Get total count
      const countQuery = `SELECT COUNT(*) as count FROM "${tableName}"`
      const countResult = await this.getRow(db, countQuery) as { count: number }
      const total = countResult.count

      // Get data with pagination
      const dataQuery = `SELECT * FROM "${tableName}" LIMIT ? OFFSET ?`
      const data = await this.getAllRows(db, dataQuery, [limit, offset])

      return {
        data,
        total,
        columns,
      }
    } finally {
      await this.closeDatabase(db)
    }
  }

  async executeQuery(query: string): Promise<{
    data: any[]
    columns: string[]
    rowsAffected?: number
  }> {
    const db = await this.getDatabase()

    try {
      const trimmedQuery = query.trim().toLowerCase()
      let resultData = []
      let columns = []
      let rowsAffected = undefined

      if (trimmedQuery.startsWith("select")) {
        // For SELECT queries
        resultData = await this.getAllRows(db, query)
        columns = resultData.length > 0 ? Object.keys(resultData[0]) : []
      } else {
        // For INSERT, UPDATE, DELETE queries
        const result = await this.runQuery(db, query)
        rowsAffected = result.changes
      }

      return {
        data: resultData,
        columns,
        rowsAffected,
      }
    } finally {
      await this.closeDatabase(db)
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
    const db = await this.getDatabase()

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
      await this.runQuery(db, createTableSQL)
    } finally {
      await this.closeDatabase(db)
    }
  }

  async dropTable(tableName: string): Promise<void> {
    const db = await this.getDatabase()

    try {
      const dropTableSQL = `DROP TABLE IF EXISTS ${tableName}`
      await this.runQuery(db, dropTableSQL)
    } finally {
      await this.closeDatabase(db)
    }
  }

  async renameTable(oldName: string, newName: string): Promise<void> {
    const db = await this.getDatabase()

    try {
      const renameTableSQL = `ALTER TABLE ${oldName} RENAME TO ${newName}`
      await this.runQuery(db, renameTableSQL)
    } finally {
      await this.closeDatabase(db)
    }
  }

  async addColumn(
    tableName: string,
    column: {
      name: string
      type: string
      nullable?: boolean
      primary?: boolean
      default?: string
      autoIncrement?: boolean
    }
  ): Promise<void> {
    const db = await this.getDatabase()

    try {
      let alterSQL = `ALTER TABLE ${tableName} ADD COLUMN ${column.name} ${column.type}`
      if (!column.nullable && !column.primary) alterSQL += " NOT NULL"
      if (column.primary) alterSQL += " PRIMARY KEY"
      if (column.autoIncrement && column.primary) alterSQL += " AUTOINCREMENT"
      if (column.default) alterSQL += ` DEFAULT ${column.default}`

      await this.runQuery(db, alterSQL)
    } finally {
      await this.closeDatabase(db)
    }
  }

  async modifyColumn(
    tableName: string,
    columnName: string,
    newColumn: {
      name: string
      type: string
      nullable?: boolean
      primary?: boolean
      default?: string
      autoIncrement?: boolean
    }
  ): Promise<void> {
    const db = await this.getDatabase()

    try {
      // SQLite doesn't support ALTER COLUMN directly, so we need to recreate the table
      const columns = await this.getTableColumns(tableName)
      const columnIndex = columns.findIndex((col) => col.name === columnName)
      
      if (columnIndex === -1) {
        throw new Error(`Column ${columnName} not found in table ${tableName}`)
      }

      // Update the column definition
      const updatedColumns = [...columns]
      updatedColumns[columnIndex] = {
        ...updatedColumns[columnIndex],
        name: newColumn.name,
        type: newColumn.type,
        notnull: newColumn.nullable === false ? 1 : 0,
        pk: newColumn.primary ? 1 : 0,
        dflt_value: newColumn.default || null
      }

      // Start transaction
      await this.runQuery(db, "BEGIN TRANSACTION")

      try {
        // Create new table with updated schema
        const columnDefs = updatedColumns
          .map((col) => {
            let def = `${col.name} ${col.type}`
            if (col.pk) def += " PRIMARY KEY"
            if (col.pk && newColumn.autoIncrement) def += " AUTOINCREMENT"
            if (col.notnull && !col.pk) def += " NOT NULL"
            if (col.dflt_value !== null) def += ` DEFAULT ${col.dflt_value}`
            return def
          })
          .join(", ")

        const tempTableName = `${tableName}_temp_${Date.now()}`
        await this.runQuery(db, `CREATE TABLE ${tempTableName} (${columnDefs})`)

        // Copy data (handling column name change)
        const oldColumnNames = columns.map((col) => col.name === columnName ? columnName : col.name).join(", ")
        const newColumnNames = updatedColumns.map((col) => col.name).join(", ")
        await this.runQuery(db, `INSERT INTO ${tempTableName} (${newColumnNames}) SELECT ${oldColumnNames} FROM ${tableName}`)

        // Drop old table and rename new one
        await this.runQuery(db, `DROP TABLE ${tableName}`)
        await this.runQuery(db, `ALTER TABLE ${tempTableName} RENAME TO ${tableName}`)

        await this.runQuery(db, "COMMIT")
      } catch (error) {
        await this.runQuery(db, "ROLLBACK")
        throw error
      }
    } finally {
      await this.closeDatabase(db)
    }
  }

  async dropColumn(tableName: string, columnName: string): Promise<void> {
    const db = await this.getDatabase()

    try {
      // SQLite doesn't support DROP COLUMN directly, so we need to recreate the table
      const columns = await this.getTableColumns(tableName)
      const remainingColumns = columns.filter((col) => col.name !== columnName)

      if (remainingColumns.length === 0) {
        throw new Error("Cannot drop all columns from table")
      }

      // Start transaction
      await this.runQuery(db, "BEGIN TRANSACTION")

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
        await this.runQuery(db, `CREATE TABLE ${tempTableName} (${columnDefs})`)

        // Copy data
        const columnNames = remainingColumns.map((col) => col.name).join(", ")
        await this.runQuery(db, `INSERT INTO ${tempTableName} (${columnNames}) SELECT ${columnNames} FROM ${tableName}`)

        // Drop old table and rename new one
        await this.runQuery(db, `DROP TABLE ${tableName}`)
        await this.runQuery(db, `ALTER TABLE ${tempTableName} RENAME TO ${tableName}`)

        await this.runQuery(db, "COMMIT")
      } catch (error) {
        await this.runQuery(db, "ROLLBACK")
        throw error
      }
    } finally {
      await this.closeDatabase(db)
    }
  }

  getConfig(): SQLiteConnectionConfig {
    return this.config
  }
}
