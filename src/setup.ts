import { createConnection, executeQuery, loadSavedConnections } from './db';

// Initialize default SQLite connection and create sample tables
export async function setupDefaultConnection() {
  try {
    const connectionId = 'sample-db';
    const config = {
      sqlite: {
        path: './sample.db'
      }
    };
    
    await createConnection('sqlite', config, connectionId, 'System Database', false);
    console.log('✅ Default SQLite connection created:', connectionId);
    
    // Create sample tables if they don't exist
    await createSampleTables(connectionId);
    console.log('✅ Sample tables created/verified');
    
    // Load any previously saved connections
    await loadSavedConnections();
    console.log('✅ Saved connections loaded');
  } catch (error) {
    console.error('❌ Failed to create default connection:', error);
    throw error;
  }
}

async function createSampleTables(connectionId: string) {
  const createTablesSQL = [
    // Connections table to store database connections
    `CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('sqlite', 'postgres')),
      config TEXT NOT NULL, -- JSON string of connection config
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      age INTEGER,
      department TEXT,
      salary DECIMAL(10, 2),
      hire_date DATE,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Products table
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      category TEXT,
      stock_quantity INTEGER DEFAULT 0,
      is_available BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Orders table
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      total_amount DECIMAL(10, 2) NOT NULL,
      order_date DATE DEFAULT CURRENT_DATE,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`
  ];
  
  // Insert sample data
  const insertDataSQL = [
    // Sample users
    `INSERT OR IGNORE INTO users (id, name, email, age, department, salary, hire_date, is_active) VALUES
      (1, 'John Doe', 'john@company.com', 30, 'Engineering', 75000.00, '2022-01-15', 1),
      (2, 'Jane Smith', 'jane@company.com', 28, 'Marketing', 65000.00, '2022-03-20', 1),
      (3, 'Bob Johnson', 'bob@company.com', 35, 'Engineering', 85000.00, '2021-06-10', 1),
      (4, 'Alice Brown', 'alice@company.com', 26, 'Design', 60000.00, '2023-01-05', 1),
      (5, 'Charlie Wilson', 'charlie@company.com', 42, 'Management', 95000.00, '2020-08-12', 1)`,
    
    // Sample products
    `INSERT OR IGNORE INTO products (id, name, description, price, category, stock_quantity, is_available) VALUES
      (1, 'Laptop Pro 15"', 'High-performance laptop', 1299.99, 'Electronics', 25, 1),
      (2, 'Wireless Mouse', 'Ergonomic wireless mouse', 29.99, 'Electronics', 150, 1),
      (3, 'Coffee Maker', 'Programmable coffee maker', 89.99, 'Kitchen', 45, 1),
      (4, 'Standing Desk', 'Adjustable height desk', 449.99, 'Furniture', 12, 1),
      (5, 'Headphones', 'Noise canceling headphones', 299.99, 'Electronics', 35, 1)`,
    
    // Sample orders
    `INSERT OR IGNORE INTO orders (id, user_id, product_id, quantity, total_amount, order_date, status) VALUES
      (1, 1, 1, 1, 1299.99, '2023-06-01', 'completed'),
      (2, 1, 2, 2, 59.98, '2023-06-01', 'completed'),
      (3, 2, 3, 1, 89.99, '2023-06-15', 'completed'),
      (4, 3, 4, 1, 449.99, '2023-06-20', 'shipped'),
      (5, 4, 5, 1, 299.99, '2023-06-25', 'completed')`
  ];
  
  try {
    // Create tables
    for (const sql of createTablesSQL) {
      await executeQuery(connectionId, sql);
    }
    
    // Insert sample data
    for (const sql of insertDataSQL) {
      await executeQuery(connectionId, sql);
    }
  } catch (error) {
    console.error('Failed to create sample tables:', error);
    // Don't throw - let the app continue even if sample data fails
  }
}
