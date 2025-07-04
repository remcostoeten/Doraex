import { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { verifyToken } from '../utils/auth'
import { getUserById } from '../db/auth'

async function requireAuth(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization')
    const cookieToken = getCookie(c, 'auth-token')
    
    let token: string | undefined
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else if (cookieToken) {
      token = cookieToken
    }
    
    if (!token) {
      return c.json({ error: 'No token provided' }, 401)
    }
    
    const payload = verifyToken(token)
    const user = getUserById(payload.userId)
    
    if (!user) {
      return c.json({ error: 'User not found' }, 401)
    }
    
    c.set('user', user)
    await next()
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

async function optionalAuth(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization')
    const cookieToken = getCookie(c, 'auth-token')
    
    let token: string | undefined
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else if (cookieToken) {
      token = cookieToken
    }
    
    if (token) {
      const payload = verifyToken(token)
      const user = getUserById(payload.userId)
      
      if (user) {
        c.set('user', user)
      }
    }
    
    await next()
  } catch (error) {
    await next()
  }
}

export {
  requireAuth,
  optionalAuth
}
