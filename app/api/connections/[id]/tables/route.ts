import { type NextRequest, NextResponse } from "next/server"
import { PostgreSQLConnection, parsePostgreSQLUrl } from "@/lib/db-connections"
import { SQLiteConnection } from "@/lib/db-connections/sqlite"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const connectionConfig = request.headers.get("x-connection-config")

    if (!connectionConfig) {
      return NextResponse.json({ error: "Connection configuration not provided" }, { status: 400 })
    }

    const config = JSON.parse(connectionConfig)

    if (config.type === "sqlite") {
      try {
        const { filePath, fileName } = config
        const sqliteConnection = new SQLiteConnection({ filePath, fileName })
        const tables = await sqliteConnection.getTables()
        return NextResponse.json({ tables })
      } catch (error) {
        console.error("SQLite tables error:", error)
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Failed to get SQLite tables" },
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

    console.log("Fetching tables with config:", {
      host: pgConfig.host,
      port: pgConfig.port,
      database: pgConfig.database,
      username: pgConfig.username,
      ssl: pgConfig.ssl,
    })

    const connection = new PostgreSQLConnection(pgConfig)
    const tables = await connection.getTables()

    console.log(
      "Found tables:",
      tables.map((t) => ({ name: t.name, rowCount: t.rowCount })),
    )

    return NextResponse.json({ tables })
  } catch (error) {
    console.error("Get tables error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get tables" },
      { status: 500 },
    )
  }
}
