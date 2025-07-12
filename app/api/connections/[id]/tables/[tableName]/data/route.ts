import { type NextRequest, NextResponse } from "next/server"
import { PostgreSQLConnection, parsePostgreSQLUrl } from "@/lib/db-connections"
import { SQLiteConnection } from "@/lib/db-connections/sqlite"

export async function GET(request: NextRequest, { params }: { params: { id: string; tableName: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const connectionConfig = request.headers.get("x-connection-config")

    if (!connectionConfig) {
      return NextResponse.json({ error: "Connection configuration not provided" }, { status: 400 })
    }

    const config = JSON.parse(connectionConfig)

    if (config.type === "sqlite") {
      try {
        const { filePath, fileName } = config
        const sqliteConnection = new SQLiteConnection({ filePath, fileName })
        const data = await sqliteConnection.getTableData(params.tableName, limit, offset)
        return NextResponse.json(data)
      } catch (error) {
        console.error("SQLite table data error:", error)
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Failed to get SQLite table data" },
          { status: 500 },
        )
      }
    }

    let pgConfig
    if (config.url) {
      pgConfig = parsePostgreSQLUrl(config.url)
    } else {
      pgConfig = {
        host: config.host,
        port: Number.parseInt(config.port),
        database: config.database,
        username: config.username,
        password: config.password,
        ssl: config.ssl,
      }
    }

    const connection = new PostgreSQLConnection(pgConfig)
    const data = await connection.getTableData(params.tableName, limit, offset)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Get table data error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get table data" },
      { status: 500 },
    )
  }
}
