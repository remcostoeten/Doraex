import { type NextRequest, NextResponse } from "next/server"
import { SQLiteConnection } from "@/lib/db-connections/sqlite"
import path from "path"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; tableName: string; columnName: string } },
) {
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
    const connection = new SQLiteConnection({
      filePath,
      fileName: config.fileName,
    })

    await connection.modifyColumn(params.tableName, params.columnName, {
      name,
      type,
      nullable,
      primary,
      default: defaultValue,
      autoIncrement,
    })

    return NextResponse.json({ success: true, message: "Column modified successfully" })
  } catch (error) {
    console.error("Modify column error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to modify column" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; tableName: string; columnName: string } },
) {
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
    const connection = new SQLiteConnection({
      filePath,
      fileName: config.fileName,
    })

    await connection.dropColumn(params.tableName, params.columnName)

    return NextResponse.json({ success: true, message: "Column deleted successfully" })
  } catch (error) {
    console.error("Delete column error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete column" },
      { status: 500 },
    )
  }
}
