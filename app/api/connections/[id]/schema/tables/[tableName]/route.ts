import { type NextRequest, NextResponse } from "next/server"
import { SQLiteConnection } from "@/lib/sqlite-connection"
import path from "path"

export async function PUT(request: NextRequest, { params }: { params: { id: string; tableName: string } }) {
  try {
    const body = await request.json()
    const { newName } = body

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

    await connection.renameTable(params.tableName, newName)

    return NextResponse.json({ success: true, message: "Table renamed successfully" })
  } catch (error) {
    console.error("Rename table error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to rename table" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; tableName: string } }) {
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

    await connection.dropTable(params.tableName)

    return NextResponse.json({ success: true, message: "Table deleted successfully" })
  } catch (error) {
    console.error("Delete table error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete table" },
      { status: 500 },
    )
  }
}
