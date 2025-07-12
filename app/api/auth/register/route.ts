import { type NextRequest, NextResponse } from "next/server"
import { userDb } from "@/lib/db-users"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, name, password } = body

    // Validate input
    if (!username || !email || !name || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate username (alphanumeric and underscore only)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters and contain only letters, numbers, and underscores" },
        { status: 400 },
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Create user
    const user = await userDb.createUser({
      username,
      email,
      name,
      password,
    })

    // Return user without sensitive data
    const { ...userResponse } = user
    return NextResponse.json({
      message: "User created successfully",
      user: userResponse,
    })
  } catch (error: any) {
    console.error("Registration error:", error)

    if (error.message === "Username already exists" || error.message === "Email already exists") {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
