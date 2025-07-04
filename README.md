# Database Viewer

A modern web-based database viewer built with Bun, Hono, and vanilla JavaScript that supports both SQLite and PostgreSQL databases.

## Features

- 🔗 **Multi-Database Support**: Connect to SQLite and PostgreSQL databases
- 📊 **Visual Query Results**: Clean, responsive table display of query results
- 🗂️ **Table Browser**: Browse and explore database tables
- ⚡ **Fast Execution**: Query execution with real-time results
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS
- ⌨️ **Keyboard Shortcuts**: `Ctrl+Enter` to execute queries
- 📝 **Query History**: Track executed queries and results

## Tech Stack

- **Backend**: [Bun](https://bun.sh/) runtime with [Hono](https://hono.dev/) framework
- **Frontend**: Vanilla JavaScript with [Tailwind CSS](https://tailwindcss.com/)
- **Databases**: SQLite (better-sqlite3), PostgreSQL (pg)
- **Language**: TypeScript

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) installed on your system

### Installation

1. Clone or create the project:
   ```bash
   mkdir database-viewer && cd database-viewer
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Start the development server:
   ```bash
   bun run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Adding a Database Connection

1. **SQLite Database**:
   - Select "SQLite" from the database type dropdown
   - Enter a connection name
   - Provide the path to your SQLite database file (use `:memory:` for in-memory database)
   - Click "Add Connection"

2. **PostgreSQL Database**:
   - Select "PostgreSQL" from the database type dropdown
   - Enter a connection name
   - Fill in the connection details (host, port, database, username, password)
   - Click "Add Connection"

### Executing Queries

1. Select an active connection from the dropdown
2. Enter your SQL query in the editor
3. Click "Execute Query" or press `Ctrl+Enter`
4. View results in the results table below

### Browsing Tables

Once connected, you can browse tables by clicking on table names in the "Tables" section. This will auto-populate a `SELECT * FROM table_name LIMIT 100` query.

## API Endpoints

The application exposes a REST API:

- `GET /api/connections` - List all connections
- `POST /api/connections` - Create a new connection
- `POST /api/connections/:id/query` - Execute a query
- `GET /api/connections/:id/tables` - Get tables for a connection

## Example Queries

### SQLite
```sql
-- Create a sample table
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (name, email) VALUES 
  ('John Doe', 'john@example.com'),
  ('Jane Smith', 'jane@example.com');

-- Query data
SELECT * FROM users WHERE name LIKE '%John%';
```

### PostgreSQL
```sql
-- Create a sample table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2),
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO products (name, price, category) VALUES 
  ('Laptop', 999.99, 'Electronics'),
  ('Coffee Mug', 12.50, 'Kitchen');

-- Query with aggregation
SELECT category, COUNT(*) as product_count, AVG(price) as avg_price 
FROM products 
GROUP BY category;
```

## Development

### Project Structure

```
├── src/
│   └── server.ts          # Main server application
├── public/
│   ├── index.html         # Frontend HTML
│   └── app.js            # Frontend JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts

- `bun run dev` - Start development server with hot reload
- `bun run build` - Build the application
- `bun run start` - Start production server

### Adding New Database Types

To add support for additional database types:

1. Add the database driver dependency
2. Update the `TConnectionConfig` type in `server.ts`
3. Implement connection logic in `createApi()`
4. Update the frontend to include configuration fields

## Security Considerations

⚠️ **Important**: This tool is designed for development and testing purposes. For production use, consider:

- Adding authentication and authorization
- Implementing rate limiting
- Sanitizing and validating all inputs
- Using connection pooling
- Securing database credentials
- Adding HTTPS support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. Feel free to use and modify as needed.
