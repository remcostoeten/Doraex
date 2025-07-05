// Simple mock server for testing frontend connections
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS
app.use('*', cors())

// Mock connections endpoint
app.get('/api/connections', (c) => {
  const connections = [
    {
      id: "sample-db",
      name: "Sample Database",
      type: "sqlite",
      database: "sample.db",
      isConnected: true
    }
  ]
  
  return c.json({ success: true, data: connections })
})

// Mock tables endpoint
app.get('/api/connections/:id/tables', (c) => {
  const tables = [
    { name: 'users' },
    { name: 'products' },
    { name: 'orders' }
  ]
  
  return c.json({ success: true, data: tables })
})

// Mock query endpoint
app.post('/api/connections/:id/query', async (c) => {
  const { query } = await c.req.json()
  
  // Mock data based on query
  let rows = []
  
  if (query.includes('users')) {
    rows = [
      { id: 1, name: 'John Doe', email: 'john@company.com', age: 30, department: 'Engineering', salary: 75000.00, hire_date: '2022-01-15', is_active: true, created_at: '2022-01-15 09:00:00' },
      { id: 2, name: 'Jane Smith', email: 'jane@company.com', age: 28, department: 'Marketing', salary: 65000.00, hire_date: '2022-03-20', is_active: true, created_at: '2022-03-20 10:30:00' },
      { id: 3, name: 'Bob Johnson', email: 'bob@company.com', age: 35, department: 'Engineering', salary: 85000.00, hire_date: '2021-06-10', is_active: true, created_at: '2021-06-10 14:15:00' },
      { id: 4, name: 'Alice Brown', email: 'alice@company.com', age: 26, department: 'Design', salary: 60000.00, hire_date: '2023-01-05', is_active: true, created_at: '2023-01-05 11:20:00' },
      { id: 5, name: 'Charlie Wilson', email: 'charlie@company.com', age: 42, department: 'Management', salary: 95000.00, hire_date: '2020-08-12', is_active: true, created_at: '2020-08-12 16:45:00' }
    ]
  } else if (query.includes('products')) {
    rows = [
      { id: 1, name: 'Laptop Pro 15"', description: 'High-performance laptop', price: 1299.99, category: 'Electronics', stock_quantity: 25, is_available: true, created_at: '2023-01-01 00:00:00' },
      { id: 2, name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', price: 29.99, category: 'Electronics', stock_quantity: 150, is_available: true, created_at: '2023-01-01 00:00:00' },
      { id: 3, name: 'Coffee Maker', description: 'Programmable coffee maker', price: 89.99, category: 'Kitchen', stock_quantity: 45, is_available: true, created_at: '2023-01-01 00:00:00' },
      { id: 4, name: 'Standing Desk', description: 'Adjustable height desk', price: 449.99, category: 'Furniture', stock_quantity: 12, is_available: true, created_at: '2023-01-01 00:00:00' },
      { id: 5, name: 'Headphones', description: 'Noise canceling headphones', price: 299.99, category: 'Electronics', stock_quantity: 35, is_available: true, created_at: '2023-01-01 00:00:00' }
    ]
  } else if (query.includes('orders')) {
    rows = [
      { id: 1, user_id: 1, product_id: 1, quantity: 1, total_amount: 1299.99, order_date: '2023-06-01', status: 'completed', created_at: '2023-06-01 10:30:00' },
      { id: 2, user_id: 1, product_id: 2, quantity: 2, total_amount: 59.98, order_date: '2023-06-01', status: 'completed', created_at: '2023-06-01 10:35:00' },
      { id: 3, user_id: 2, product_id: 3, quantity: 1, total_amount: 89.99, order_date: '2023-06-15', status: 'completed', created_at: '2023-06-15 14:20:00' },
      { id: 4, user_id: 3, product_id: 4, quantity: 1, total_amount: 449.99, order_date: '2023-06-20', status: 'shipped', created_at: '2023-06-20 09:15:00' },
      { id: 5, user_id: 4, product_id: 5, quantity: 1, total_amount: 299.99, order_date: '2023-06-25', status: 'completed', created_at: '2023-06-25 16:00:00' }
    ]
  } else if (query.includes('COUNT')) {
    // Handle count queries
    if (query.includes('users')) {
      rows = [{ count: 10 }]
    } else if (query.includes('products')) {
      rows = [{ count: 10 }]
    } else if (query.includes('orders')) {
      rows = [{ count: 15 }]
    }
  }
  
  return c.json({
    success: true,
    data: {
      rows,
      executedAt: new Date().toISOString(),
      query
    }
  })
})

export default {
  port: 3002,
  fetch: app.fetch,
}
