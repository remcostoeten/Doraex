import { Hono } from 'hono';
import { AuthService } from '../auth/auth-service';
import type { TUserCredentials } from '../auth/auth-service';

function createAuthApi() {
  const app = new Hono();
  const authService = new AuthService();

  // Register endpoint
  app.post('/register', async (c) => {
    try {
      const body = await c.req.json();
      const { email, password, name } = body;

      if (!email || !password || !name) {
        return c.json({ error: 'Email, password, and name are required' }, 400);
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return c.json({ error: 'Invalid email format' }, 400);
      }

      // Basic password validation
      if (password.length < 8) {
        return c.json({ error: 'Password must be at least 8 characters long' }, 400);
      }

      const credentials: TUserCredentials = { email, password, name };
      const result = await authService.register(credentials);

      if (!result.success) {
        return c.json({ error: result.error }, 400);
      }

      return c.json({
        success: true,
        user: result.user,
        tokens: result.tokens,
        message: 'Registration successful'
      });
    } catch (error) {
      console.error('Registration error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  // Login endpoint
  app.post('/login', async (c) => {
    try {
      const body = await c.req.json();
      const { email, password } = body;

      if (!email || !password) {
        return c.json({ error: 'Email and password are required' }, 400);
      }

      const credentials: TUserCredentials = { email, password };
      const result = await authService.login(credentials);

      if (!result.success) {
        return c.json({ error: result.error }, 401);
      }

      return c.json({
        success: true,
        user: result.user,
        tokens: result.tokens,
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  // Refresh token endpoint
  app.post('/refresh', async (c) => {
    try {
      const body = await c.req.json();
      const { refresh_token } = body;

      if (!refresh_token) {
        return c.json({ error: 'Refresh token is required' }, 400);
      }

      const tokenPayload = authService.verifyRefreshToken(refresh_token);
      
      if (!tokenPayload) {
        return c.json({ error: 'Invalid or expired refresh token' }, 401);
      }

      // In a real application, you would fetch the user from the database
      // For now, we'll create a mock user based on the token payload
      const user = {
        id: tokenPayload.userId,
        email: tokenPayload.email,
        name: 'User', // Mock name
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const newTokens = authService.generateTokens(user);

      return c.json({
        success: true,
        tokens: newTokens,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  // Logout endpoint (optional - mainly for client-side cleanup)
  app.post('/logout', async (c) => {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success response
    return c.json({
      success: true,
      message: 'Logout successful'
    });
  });

  // Password reset request endpoint
  app.post('/reset-password', async (c) => {
    try {
      const body = await c.req.json();
      const { email } = body;

      if (!email) {
        return c.json({ error: 'Email is required' }, 400);
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return c.json({ error: 'Invalid email format' }, 400);
      }

      const result = await authService.requestPasswordReset(email);

      if (!result.success) {
        return c.json({ error: result.error }, 400);
      }

      return c.json({
        success: true,
        message: result.message,
        // Include token in development only
        ...(result.token && { token: result.token })
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  // Password reset confirmation endpoint
  app.post('/reset-password-confirm', async (c) => {
    try {
      const body = await c.req.json();
      const { token, password } = body;

      if (!token || !password) {
        return c.json({ error: 'Token and password are required' }, 400);
      }

      // Basic password validation
      if (password.length < 8) {
        return c.json({ error: 'Password must be at least 8 characters long' }, 400);
      }

      const result = await authService.resetPassword(token, password);

      if (!result.success) {
        return c.json({ error: result.error }, 400);
      }

      return c.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  // Get current user endpoint
  app.get('/me', async (c) => {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Authorization header missing or invalid' }, 401);
    }
    
    const token = authHeader.slice(7);
    const tokenPayload = authService.verifyAccessToken(token);
    
    if (!tokenPayload) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    try {
      // Create a temporary UserRepository instance to fetch user data
      const { UserRepository } = await import('../auth/user-repository');
      const userRepository = new UserRepository();
      const userRecord = await userRepository.findById(tokenPayload.userId);
      
      if (!userRecord) {
        return c.json({ error: 'User not found' }, 404);
      }
      
      // Remove password hash from response
      const { password_hash, ...user } = userRecord;
      
      return c.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      return c.json({ error: 'Failed to fetch user data' }, 500);
    }
  });

  return app;
}

export { createAuthApi };
