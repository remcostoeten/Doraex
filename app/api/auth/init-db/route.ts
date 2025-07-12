import { type NextRequest, NextResponse } from "next/server"
import { userDb } from "@/lib/db-users"

export async function POST(request: NextRequest) {
  try {
    await userDb.initializeDatabase()
    return NextResponse.json({ message: "Database initialized successfully" })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
  }
}
