import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

export interface User {
  id: string
  username: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  username: string
  email: string
  name: string
  password: string
}

export class UserDatabase {
  private sql: ReturnType<typeof neon>

  constructor() {
    // You'll need to set your DATABASE_URL environment variable
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is required")
    }
    this.sql = neon(databaseUrl)
  }

  async initializeDatabase(): Promise<void> {
    try {
      // Create users table if it doesn't exist
      await this.sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `

      // Create indexes for faster lookups
      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
      `
      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
      `

      console.log("User database initialized successfully")
    } catch (error) {
      console.error("Failed to initialize user database:", error)
      throw error
    }
  }

  async createUser(userData: CreateUserData): Promise<User> {
    try {
      // Hash the password
      const saltRounds = 12
      const passwordHash = await bcrypt.hash(userData.password, saltRounds)

      const [user] = await this.sql`
        INSERT INTO users (username, email, name, password_hash)
        VALUES (${userData.username}, ${userData.email}, ${userData.name}, ${passwordHash})
        RETURNING id, username, email, name, created_at, updated_at
      `

      return user as User
    } catch (error: any) {
      if (error.code === "23505") { // PostgreSQL unique constraint violation
        if (error.detail?.includes("username")) {
          throw new Error("Username already exists")
        } else if (error.detail?.includes("email")) {
          throw new Error("Email already exists")
        }
      }
      throw error
    }
  }

  async findUserByEmailOrUsername(identifier: string): Promise<User | null> {
    const [user] = await this.sql`
      SELECT id, username, email, name, created_at, updated_at
      FROM users 
      WHERE email = ${identifier} OR username = ${identifier}
    `

    return user as User || null
  }

  async verifyPassword(identifier: string, password: string): Promise<User | null> {
    console.log('🔍 Verifying password for identifier:', identifier)
    
    const users = await this.sql`
      SELECT id, username, email, name, password_hash, created_at, updated_at
      FROM users 
      WHERE email = ${identifier} OR username = ${identifier}
    `
    
    const user = users[0]
    console.log('👤 User found:', user ? 'Yes' : 'No')
    
    if (!user) {
      console.log('❌ No user found with identifier:', identifier)
      return null
    }

    console.log('🔐 Comparing password...')
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    console.log('✅ Password valid:', isValidPassword)

    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', user.email)
      return null
    }

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user
    console.log('✅ Login successful for user:', userWithoutPassword.email)
    return userWithoutPassword as User
  }

  async getUserById(id: string): Promise<User | null> {
    const [user] = await this.sql`
      SELECT id, username, email, name, created_at, updated_at
      FROM users 
      WHERE id = ${id}
    `

    return user as User || null
  }
}

// Export a singleton instance
export const userDb = new UserDatabase()
