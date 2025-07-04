import { Context } from 'hono'
import { setCookie } from 'hono/cookie'
import { createUser, getUserByEmail, getUserById, updateUser } from '../db/auth'
import { hashPassword, comparePassword, generateToken, isValidEmail, isValidPassword } from '../utils/auth'
import { TCreateUser, TLoginUser, TProtectedUser } from '../types/auth'

async function registerHandler(c: Context) {
  try {
    const body = await c.req.json() as TCreateUser
    
    if (!body.email || !body.password || !body.name) {
      return c.json({ error: 'Email, password, and name are required' }, 400)
    }
    
    if (!isValidEmail(body.email)) {
      return c.json({ error: 'Please provide a valid email address' }, 400)
    }
    
    if (!isValidPassword(body.password)) {
      return c.json({ error: 'Password must be at least 6 characters long' }, 400)
    }
    
    const existingUser = getUserByEmail(body.email)
    if (existingUser) {
      return c.json({ error: 'User with this email already exists' }, 409)
    }
    
    const hashedPassword = await hashPassword(body.password)
    const user = createUser({
      email: body.email,
      password: hashedPassword,
      name: body.name
    })
    
    const token = generateToken({
      userId: user.id,
      email: user.email
    })
    
    setCookie(c, 'auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60
    })
    
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}

async function loginHandler(c: Context) {
  try {
    const body = await c.req.json() as TLoginUser
    
    if (!body.email || !body.password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }
    
    const user = getUserByEmail(body.email)
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    const isPasswordValid = await comparePassword(body.password, user.password)
    if (!isPasswordValid) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    const token = generateToken({
      userId: user.id,
      email: user.email
    })
    
    setCookie(c, 'auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60
    })
    
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}

async function logoutHandler(c: Context) {
  setCookie(c, 'auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  })
  
  return c.json({ message: 'Logged out successfully' })
}

async function profileHandler(c: Context) {
  const user = c.get('user') as TProtectedUser
  return c.json({ user })
}

async function updateProfileHandler(c: Context) {
  try {
    const user = c.get('user') as TProtectedUser
    const body = await c.req.json()
    
    const updates: Partial<TCreateUser> = {}
    
    if (body.name) {
      updates.name = body.name
    }
    
    if (body.email) {
      if (!isValidEmail(body.email)) {
        return c.json({ error: 'Please provide a valid email address' }, 400)
      }
      
      const existingUser = getUserByEmail(body.email)
      if (existingUser && existingUser.id !== user.id) {
        return c.json({ error: 'Email already in use' }, 409)
      }
      
      updates.email = body.email
    }
    
    if (body.password) {
      if (!isValidPassword(body.password)) {
        return c.json({ error: 'Password must be at least 6 characters long' }, 400)
      }
      
      updates.password = await hashPassword(body.password)
    }
    
    const updatedUser = updateUser(user.id, updates)
    
    if (!updatedUser) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    return c.json({ user: updatedUser })
  } catch (error) {
    console.error('Profile update error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export {
  registerHandler,
  loginHandler,
  logoutHandler,
  profileHandler,
  updateProfileHandler
}
