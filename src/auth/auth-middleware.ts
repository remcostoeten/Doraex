import type { Context, Next } from 'hono';
import { AuthService } from './auth-service';

const authService = new AuthService();

type TAuthContext = Context & {
  get: (key: 'user') => { userId: string; email: string } | undefined;
  set: (key: 'user', value: { userId: string; email: string }) => void;
};

async function requireAuth(c: TAuthContext, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Authorization header missing or invalid' }, 401);
  }
  
  const token = authHeader.slice(7); // Remove 'Bearer ' prefix
  const tokenPayload = authService.verifyAccessToken(token);
  
  if (!tokenPayload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
  
  // Add user info to context
  c.set('user', {
    userId: tokenPayload.userId,
    email: tokenPayload.email
  });
  
  await next();
}

async function optionalAuth(c: TAuthContext, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const tokenPayload = authService.verifyAccessToken(token);
    
    if (tokenPayload) {
      c.set('user', {
        userId: tokenPayload.userId,
        email: tokenPayload.email
      });
    }
  }
  
  await next();
}

function getCurrentUser(c: TAuthContext): { userId: string; email: string } | null {
  return c.get('user') || null;
}

function requireRole(roles: string[]) {
  return async (c: TAuthContext, next: Next) => {
    const user = getCurrentUser(c);
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }
    
    // In a real application, you would fetch the user's role from the database
    // For now, we'll assume admin@example.com is an admin
    const userRole = user.email === 'admin@example.com' ? 'admin' : 'user';
    
    if (!roles.includes(userRole)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    
    await next();
  };
}

export { requireAuth, optionalAuth, getCurrentUser, requireRole };
export type { TAuthContext };
