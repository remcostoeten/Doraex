import Database from "better-sqlite3"
import bcrypt from "bcryptjs"
import path from "path"
import fs from "fs"

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
  private dbPath: string
  private db: Database.Database | null = null

  constructor() {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "uploads")
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    this.dbPath = path.join(uploadsDir, "auth.db")
  }

  private getDatabase(): Database.Database {
    if (!this.db) {
      this.db = new Database(this.dbPath)
    }
    return this.db
  }

initializeDatabase(): void {
    const db = this.getDatabase()

    try {
      // Create users table if it doesn't exist
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Create indexes for faster lookups
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      `)

      console.log("User database initialized successfully")
    } catch (error) {
      console.error("Failed to initialize user database:", error)
      throw error
    }
  }

async createUser(userData: CreateUserData): Promise<User> {
    const db = this.getDatabase()

    try {
      // Hash the password
      const saltRounds = 12
      const passwordHash = await bcrypt.hash(userData.password, saltRounds)

      const insertStmt = db.prepare(`
        INSERT INTO users (username, email, name, password_hash)
        VALUES (?, ?, ?, ?)
      `)
      
      const result = insertStmt.run(
        userData.username,
        userData.email,
        userData.name,
        passwordHash
      )

      // Get the created user
      const selectStmt = db.prepare(`
        SELECT id, username, email, name, created_at, updated_at
        FROM users 
        WHERE rowid = ?
      `)
      
      const user = selectStmt.get(result.lastInsertRowid) as User

      return user
    } catch (error: any) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        if (error.message.includes("username")) {
          throw new Error("Username already exists")
        } else if (error.message.includes("email")) {
          throw new Error("Email already exists")
        }
      }
      throw error
    }
  }

findUserByEmailOrUsername(identifier: string): User | null {
    const db = this.getDatabase()

    const stmt = db.prepare(`
      SELECT id, username, email, name, created_at, updated_at
      FROM users 
      WHERE email = ? OR username = ?
    `)

    const user = stmt.get(identifier, identifier) as User | undefined

    return user || null
  }

async verifyPassword(identifier: string, password: string): Promise<User | null> {
    const db = this.getDatabase()

    const stmt = db.prepare(`
      SELECT id, username, email, name, password_hash, created_at, updated_at
      FROM users 
      WHERE email = ? OR username = ?
    `)

    const user = stmt.get(identifier, identifier) as (User & { password_hash: string }) | undefined

    if (!user) {
      return null
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return null
    }

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword
  }

getUserById(id: string): User | null {
    const db = this.getDatabase()

    const stmt = db.prepare(`
      SELECT id, username, email, name, created_at, updated_at
      FROM users 
      WHERE id = ?
    `)

    const user = stmt.get(id) as User | undefined

    return user || null
  }
}

// Export a singleton instance
export const userDb = new UserDatabase()
