import { type NextRequest, NextResponse } from "next/server"
import { PostgreSQLConnection, parsePostgreSQLUrl } from "@/lib/db-connections"
import { SQLiteConnection } from "@/lib/db-connections/sqlite"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, config } = body

    console.log("Connection test request:", { type, config: { ...config, password: "***" } })

    if (type === "sqlite") {
      try {
        const { filePath, fileName } = config
        const sqliteConnection = new SQLiteConnection({ filePath, fileName })
        const result = await sqliteConnection.testConnection()
        return NextResponse.json(result)
      } catch (error) {
        return NextResponse.json({
          success: false,
          message: error instanceof Error ? error.message : "SQLite connection failed",
        })
      }
    }

    if (type !== "postgresql") {
      return NextResponse.json(
        { success: false, message: "Only PostgreSQL and SQLite connections are supported currently" },
        { status: 400 },
      )
    }

    let pgConfig
    try {
      if (config.url) {
        pgConfig = parsePostgreSQLUrl(config.url)
        console.log("Parsed config for connection:", {
          host: pgConfig.host,
          port: pgConfig.port,
          database: pgConfig.database,
          username: pgConfig.username,
          ssl: pgConfig.ssl,
        })
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
    } catch (parseError) {
      console.error("URL parsing failed during connection test:", parseError)
      return NextResponse.json({
        success: false,
        message: `URL parsing failed: ${parseError instanceof Error ? parseError.message : "Invalid URL format"}`,
      })
    }

    // Use the real PostgreSQL connection
    const connection = new PostgreSQLConnection(pgConfig)
    const result = await connection.testConnection()

    return NextResponse.json(result)
  } catch (error: any) {
    // Catch the error with 'any' type to access properties like 'code'
    console.error("Connection test error:", error)

    // Provide more specific error messages based on pg error codes or messages
    let errorMessage = "Connection test failed"
    if (error instanceof Error) {
      if (error.message.includes("ENOTFOUND")) {
        errorMessage = "Host not found. Please check the hostname and your internet connection."
      } else if (error.message.includes("ECONNREFUSED")) {
        errorMessage = "Connection refused. Please check if the database server is running and accessible."
      } else if (error.message.includes("authentication failed")) {
        errorMessage = "Authentication failed. Please check your username and password."
      } else if (error.message.includes("database") && error.message.includes("does not exist")) {
        errorMessage = "Database does not exist. Please check the database name."
      } else if (error.message.includes("SSL")) {
        errorMessage = "SSL connection failed. Please check your SSL configuration."
      } else if (error.code === "28P01") {
        // PostgreSQL specific error code for invalid_password
        errorMessage = "Authentication failed. Invalid username or password."
      } else if (error.code === "ENETUNREACH") {
        errorMessage = "Network unreachable. Check your internet connection or firewall."
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 },
    )
  }
}
