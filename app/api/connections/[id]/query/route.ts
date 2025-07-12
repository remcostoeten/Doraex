import { type NextRequest, NextResponse } from "next/server"
import { PostgreSQLConnection, parsePostgreSQLUrl } from "@/lib/db-connections"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { query } = body

    const connectionConfig = request.headers.get("x-connection-config")

    if (!connectionConfig) {
      return NextResponse.json({ error: "Connection configuration not provided" }, { status: 400 })
    }

    const config = JSON.parse(connectionConfig)
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
    const result = await connection.executeQuery(query)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Query execution error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Query execution failed" },
      { status: 500 },
    )
  }
}
