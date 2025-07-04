import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { TJwtPayload } from '../types/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

function generateToken(payload: TJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

function verifyToken(token: string): TJwtPayload {
  return jwt.verify(token, JWT_SECRET) as TJwtPayload
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidPassword(password: string): boolean {
  return password.length >= 6
}

export {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  isValidEmail,
  isValidPassword
}
