# Database Security & Configuration Guide

## Overview

This project now implements a secure database system with proper authentication, environment variable management, and data protection.

## Security Features Implemented

### 1. Environment Variables
- **JWT Secrets**: Secure JWT signing keys with minimum 32-character length
- **Database Credentials**: Centralized database connection management
- **CORS Configuration**: Configurable origin and credentials settings
- **Session Management**: Secure session and cookie configuration

### 2. Authentication System
- **JWT Tokens**: Access and refresh token system with proper expiration
- **Password Hashing**: bcrypt with configurable rounds (default: 12 for production, 10 for development)
- **Token Validation**: Proper JWT verification with issuer and audience checks
- **Role-based Access**: Support for user roles and permissions

### 3. API Protection
- **Middleware**: Authentication middleware for protected routes
- **Route Guards**: Required authentication for database operations
- **Error Handling**: Secure error responses without sensitive data leakage

## Configuration

### Environment Variables (.env)

```bash
# Copy from .env.example and customize
cp .env.example .env
```

**Required Variables:**
- `JWT_SECRET`: JWT signing secret (min 32 chars)
- `JWT_REFRESH_SECRET`: Refresh token secret (min 32 chars)
- `SESSION_SECRET`: Session management secret (min 32 chars)
- `COOKIE_SECRET`: Cookie signing secret (min 32 chars)

**Database Configuration:**
- `DATABASE_URL`: PostgreSQL connection string
- `SQLITE_PATH`: SQLite database file path
- `SYSTEM_DB_PATH`: System database for storing connections

**Server Configuration:**
- `PORT`: Server port (default: 3002)
- `NODE_ENV`: Environment mode (development/production/test)
- `CORS_ORIGIN`: Allowed CORS origins
- `CORS_CREDENTIALS`: Enable CORS credentials

## Authentication Flow

### 1. User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### 2. User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### 3. Token Refresh
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "your_refresh_token_here"
}
```

### 4. Accessing Protected Routes
```http
GET /api/connections
Authorization: Bearer your_access_token_here
```

## Database Connections

### Protected Operations
All database operations now require authentication:

- **GET /api/connections** - List all connections
- **POST /api/connections** - Create new connection
- **POST /api/connections/:id/query** - Execute queries
- **GET /api/connections/:id/tables** - List tables

### Test Connection (Public)
```http
POST /api/test-connection
Content-Type: application/json

{
  "type": "postgres",
  "config": {
    "host": "localhost",
    "port": 5432,
    "database": "testdb",
    "user": "username",
    "password": "password"
  }
}
```

## Security Best Practices

### 1. Production Deployment
- Generate strong, unique secrets for production
- Use HTTPS only (`SECURE_COOKIES=true`)
- Set `NODE_ENV=production`
- Use environment-specific `.env` files

### 2. Secret Management
- Never commit `.env` files to version control
- Use a secrets management service in production
- Rotate secrets regularly
- Use different secrets for different environments

### 3. Database Security
- Use connection pooling for PostgreSQL
- Implement query timeouts
- Use prepared statements to prevent SQL injection
- Regularly backup databases

### 4. Access Control
- Implement role-based permissions
- Use the principle of least privilege
- Monitor and log database access
- Implement rate limiting

## Development Setup

1. **Install Dependencies**
   ```bash
   bun install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start Development Server**
   ```bash
   bun run dev
   ```

4. **Test Authentication**
   - Visit `/auth-demo` to test auth flow
   - Use the built-in admin account: `admin@example.com` / `admin123`

## Monitoring & Logging

### Log Levels
- `error`: Critical errors only
- `warn`: Warnings and errors
- `info`: General information
- `debug`: Detailed debugging (development only)

### Security Events
The system logs:
- Authentication attempts
- Failed login attempts
- Database connection failures
- Authorization violations

## Troubleshooting

### Common Issues

1. **"JWT_SECRET must be at least 32 characters"**
   - Update your `.env` file with longer secrets

2. **"Authorization header missing or invalid"**
   - Include `Authorization: Bearer <token>` header
   - Ensure token hasn't expired

3. **"Connection test failed"**
   - Check database credentials
   - Verify network connectivity
   - Ensure database server is running

### Debug Mode
Set `LOG_LEVEL=debug` in your `.env` file for detailed logging.

## Migration from Previous Version

If upgrading from a version without authentication:

1. Update your `.env` file with new required variables
2. Restart the server to apply new configuration
3. Existing database connections will be preserved
4. Users will need to authenticate to access the system

## Security Considerations

- **Token Storage**: Frontend uses localStorage (consider httpOnly cookies for production)
- **CORS**: Properly configured for your frontend domain
- **Rate Limiting**: Consider implementing rate limiting for auth endpoints
- **Audit Logging**: Consider implementing comprehensive audit logs

For production deployments, consider additional security measures like:
- WAF (Web Application Firewall)
- DDoS protection
- Regular security audits
- Penetration testing
