# Doraex
Aka Dora the explorer.

This repository provides a interface for viewing and managing local SQLite or cloud-hosted PostgreSQL databases. It is primarily built for personal use and as part of my journey transitioning from a front-end–only developer to a full-stack developer, while exploring new technologies.

Normally I exclusivly write NextJS + server functions + Drizzle via PostgreSQL or SQLite. This project is split in two parts:
- Frontend: Svelte
- Backend: Bun + Hono

## Quick Start

### Prerequisites
- [Bun](https://bun.sh) runtime
- Node.js (for frontend dependencies)

### Setup

1. **Install backend dependencies:**
   ```bash
   bun install
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend-svelte
   npm install
   cd ..
   ```

3. **Setup environment:**
   ```bash
   cp .env.example .env
   ```
   The defaults work for local development with SQLite.

### Running the Application

**Option 1: Run both frontend and backend together (recommended)**
```bash
bun run dev:all
```

**Option 2: Run separately**
```bash
# Terminal 1 - Backend
bun run dev

# Terminal 2 - Frontend  
bun run dev:frontend
```

### Access
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3002
- **Default admin login:** admin@example.com / admin123

### Database
The application automatically:
- Creates a SQLite database (`sample.db`) with sample data
- Sets up sample tables (users, products, orders)
- Creates a default admin user for authentication

No manual database setup required!

