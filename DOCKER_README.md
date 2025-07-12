# Docker Setup for Doraex

This project includes Docker Compose configurations that automatically set up all required services and environment variables.

## Quick Start

### Development Mode (Recommended for development)
```bash
# Start services in development mode with hot reload
docker-compose -f docker-compose.dev.yml up

# Or run in background
docker-compose -f docker-compose.dev.yml up -d
```

### Production Mode
```bash
# Build and start services in production mode
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

## What Gets Set Up Automatically

### 🗄️ PostgreSQL Database
- **Host**: localhost:5432
- **Database**: doraex
- **Username**: doraex_user
- **Password**: doraex_password_123
- **Connection String**: `postgresql://doraex_user:doraex_password_123@postgres:5432/doraex`

### 🌐 Next.js Application
- **URL**: http://localhost:3420
- **Port**: 3420 (mapped to container port 3000)

### 🔐 Pre-configured Environment Variables
- `NEXTAUTH_SECRET`: Auto-generated development secret
- `AUTH_SECRET`: Auto-generated development secret
- `DATABASE_URL`: Points to the containerized PostgreSQL
- `NEXTAUTH_URL`: Set to http://localhost:3420
- `NODE_ENV`: Set to development/production appropriately

## Available Commands

### Start Services
```bash
# Development mode (with hot reload)
docker-compose -f docker-compose.dev.yml up

# Production mode (optimized build)
docker-compose up --build
```

### Stop Services
```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (clears database)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Database Access
```bash
# Connect to PostgreSQL directly
docker exec -it doraex-postgres-dev psql -U doraex_user -d doraex

# Or using any PostgreSQL client:
# Host: localhost
# Port: 5432
# Database: doraex
# Username: doraex_user
# Password: doraex_password_123
```

## Configuration Files

- `docker-compose.yml` - Production setup with optimized builds
- `docker-compose.dev.yml` - Development setup with hot reload
- `Dockerfile` - Multi-stage build for production
- `.dockerignore` - Excludes unnecessary files from build context

## Adding OAuth Providers

If you want to add GitHub or Google OAuth, you can either:

1. **Set environment variables in the compose files**:
   ```yaml
   environment:
     GITHUB_CLIENT_ID: "your-github-client-id"
     GITHUB_CLIENT_SECRET: "your-github-client-secret"
     GOOGLE_CLIENT_ID: "your-google-client-id"
     GOOGLE_CLIENT_SECRET: "your-google-client-secret"
   ```

2. **Or create a `.env.docker` file** and modify the compose file to use it.

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Check logs: `docker-compose logs postgres`

### Port Conflicts
- If port 3420 or 5432 is already in use, modify the ports in the compose files

### Permission Issues
- On Linux/WSL, you might need to adjust file permissions for the uploads directory

### Reset Everything
```bash
# Stop containers and remove all data
docker-compose down -v
docker system prune -f

# Start fresh
docker-compose -f docker-compose.dev.yml up
```

## Security Notes

- The default database credentials are for development only
- Change `NEXTAUTH_SECRET` and `AUTH_SECRET` for production
- Don't commit real OAuth secrets to version control
