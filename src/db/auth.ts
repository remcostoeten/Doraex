 import { Database } from 'bun:sqlite'
import { TUser, TCreateUser, TProtectedUser } from '../types/auth'

const db = new Database(':memory:')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

function createUser(userData: TCreateUser): TUser {
  const id = generateId()
  const now = new Date()

  const stmt = db.prepare(`
    INSERT INTO users (id, email, password, name, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  stmt.run(id, userData.email, userData.password, userData.name, now.toISOString(), now.toISOString())

  return {
    id,
    email: userData.email,
    password: userData.password,
    name: userData.name,
    createdAt: now,
    updatedAt: now
  }
}

function getUserByEmail(email: string): TUser | null {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
  const row = stmt.get(email) as any

  if (!row) return null

  return {
    id: row.id,
    email: row.email,
    password: row.password,
    name: row.name,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }
}

function getUserById(id: string): TProtectedUser | null {
  const stmt = db.prepare('SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?')
  const row = stmt.get(id) as any

  if (!row) return null

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }
}

function updateUser(id: string, updates: Partial<TUser>): TProtectedUser | null {
  const now = new Date()
  const fields = []
  const values = []

  if (updates.email) {
    fields.push('email = ?')
    values.push(updates.email)
  }

  if (updates.name) {
    fields.push('name = ?')
    values.push(updates.name)
  }

  if (updates.password) {
    fields.push('password = ?')
    values.push(updates.password)
  }

  if (fields.length === 0) return getUserById(id)

  fields.push('updated_at = ?')
  values.push(now.toISOString())
  values.push(id)

  const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`)
  stmt.run(...values)

  return getUserById(id)
}

export {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser
}
