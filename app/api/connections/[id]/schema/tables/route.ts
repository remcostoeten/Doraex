import { type NextRequest, NextResponse } from "next/server"
import { SQLiteConnection } from "@/lib/db-connections/sqlite"
import path from "path"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, columns } = body

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

    await connection.createTable(name, columns)

    return NextResponse.json({ success: true, message: "Table created successfully" })
  } catch (error) {
    console.error("Create table error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create table" },
      { status: 500 },
    )
  }
}
