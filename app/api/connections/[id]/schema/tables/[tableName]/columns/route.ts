import { type NextRequest, NextResponse } from "next/server"
import path from "path"
import { getSQLiteConnection } from "@/lib/sqlite-helper"

export async function GET(request: NextRequest, { params }: { params: { id: string; tableName: string } }) {
  try {
    const connectionConfig = request.headers.get("x-connection-config")
    if (!connectionConfig) {
      return NextResponse.json({ error: "Connection configuration not provided" }, { status: 400 })
    }

    const config = JSON.parse(connectionConfig)

    if (config.type !== "sqlite") {
      return NextResponse.json({ error: "Schema editing only supported for SQLite" }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), "uploads", config.fileName)
    const SQLiteConnection = await getSQLiteConnection()
    const connection = new SQLiteConnection({
      filePath,
      fileName: config.fileName,
    })

    const columns = await connection.getTableColumns(params.tableName)

    return NextResponse.json({ columns })
  } catch (error) {
    console.error("Get columns error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get columns" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string; tableName: string } }) {
  try {
    const body = await request.json()
    const { name, type, nullable = true, primary = false, defaultValue, autoIncrement = false } = body

    const connectionConfig = request.headers.get("x-connection-config")
    if (!connectionConfig) {
      return NextResponse.json({ error: "Connection configuration not provided" }, { status: 400 })
    }

    const config = JSON.parse(connectionConfig)

    if (config.type !== "sqlite") {
      return NextResponse.json({ error: "Schema editing only supported for SQLite" }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), "uploads", config.fileName)
    const SQLiteConnection = await getSQLiteConnection()
    const connection = new SQLiteConnection({
      filePath,
      fileName: config.fileName,
    })

    await connection.addColumn(params.tableName, {
      name,
      type,
      nullable,
      primary,
      default: defaultValue,
      autoIncrement,
    })

    return NextResponse.json({ success: true, message: "Column added successfully" })
  } catch (error) {
    console.error("Add column error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add column" },
      { status: 500 },
    )
  }
}
