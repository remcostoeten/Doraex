import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.name.endsWith(".sqlite") && !file.name.endsWith(".db") && !file.name.endsWith(".sqlite3")) {
      return NextResponse.json({ error: "Invalid file type. Please upload a SQLite file." }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "uploads")
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`
    const filePath = path.join(uploadsDir, fileName)

    // Convert file to buffer and write to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      fileName,
      originalName: file.name,
      size: file.size,
      filePath,
    })
  } catch (error) {
    console.error("File upload error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
