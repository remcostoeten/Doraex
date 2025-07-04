-- Sample data for testing the Database Viewer
-- This can be used with SQLite or PostgreSQL (with minor modifications)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  age INTEGER,
  department TEXT,
  salary DECIMAL(10,2),
  hire_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  product_id INTEGER,
  quantity INTEGER NOT NULL,
  total_amount DECIMAL(10,2),
  order_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert sample users
INSERT INTO users (name, email, age, department, salary, hire_date) VALUES
  ('John Doe', 'john.doe@company.com', 30, 'Engineering', 75000.00, '2022-01-15'),
  ('Jane Smith', 'jane.smith@company.com', 28, 'Marketing', 65000.00, '2022-03-20'),
  ('Bob Johnson', 'bob.johnson@company.com', 35, 'Engineering', 85000.00, '2021-06-10'),
  ('Alice Brown', 'alice.brown@company.com', 26, 'Design', 60000.00, '2023-01-05'),
  ('Charlie Wilson', 'charlie.wilson@company.com', 42, 'Management', 95000.00, '2020-08-12'),
  ('Diana Davis', 'diana.davis@company.com', 31, 'Sales', 70000.00, '2022-11-30'),
  ('Eve Miller', 'eve.miller@company.com', 29, 'Engineering', 78000.00, '2023-02-14'),
  ('Frank Garcia', 'frank.garcia@company.com', 38, 'Marketing', 72000.00, '2021-09-25'),
  ('Grace Lee', 'grace.lee@company.com', 27, 'Design', 62000.00, '2023-05-18'),
  ('Henry Taylor', 'henry.taylor@company.com', 33, 'Sales', 68000.00, '2022-07-08');

-- Insert sample products
INSERT INTO products (name, description, price, category, stock_quantity) VALUES
  ('Laptop Pro 15"', 'High-performance laptop with 16GB RAM and 512GB SSD', 1299.99, 'Electronics', 25),
  ('Wireless Mouse', 'Ergonomic wireless mouse with USB receiver', 29.99, 'Electronics', 150),
  ('Coffee Maker', 'Programmable coffee maker with thermal carafe', 89.99, 'Kitchen', 45),
  ('Standing Desk', 'Adjustable height standing desk with memory settings', 449.99, 'Furniture', 12),
  ('Noise Canceling Headphones', 'Premium wireless headphones with active noise cancellation', 299.99, 'Electronics', 35),
  ('Mechanical Keyboard', 'RGB backlit mechanical gaming keyboard', 159.99, 'Electronics', 80),
  ('Office Chair', 'Ergonomic office chair with lumbar support', 249.99, 'Furniture', 20),
  ('Desk Lamp', 'LED desk lamp with adjustable brightness and color temperature', 79.99, 'Electronics', 60),
  ('Water Bottle', 'Insulated stainless steel water bottle 32oz', 24.99, 'Kitchen', 200),
  ('Monitor 27"', '4K UHD monitor with HDR support', 399.99, 'Electronics', 18);

-- Insert sample orders
INSERT INTO orders (user_id, product_id, quantity, total_amount, order_date, status) VALUES
  (1, 1, 1, 1299.99, '2023-06-01', 'completed'),
  (1, 2, 2, 59.98, '2023-06-01', 'completed'),
  (2, 3, 1, 89.99, '2023-06-15', 'completed'),
  (3, 4, 1, 449.99, '2023-06-20', 'shipped'),
  (4, 5, 1, 299.99, '2023-06-25', 'completed'),
  (5, 6, 1, 159.99, '2023-07-01', 'completed'),
  (6, 7, 1, 249.99, '2023-07-05', 'pending'),
  (7, 8, 2, 159.98, '2023-07-10', 'shipped'),
  (8, 9, 3, 74.97, '2023-07-15', 'completed'),
  (9, 10, 1, 399.99, '2023-07-20', 'pending'),
  (10, 1, 1, 1299.99, '2023-07-25', 'shipped'),
  (2, 5, 1, 299.99, '2023-08-01', 'completed'),
  (4, 9, 5, 124.95, '2023-08-05', 'completed'),
  (6, 2, 1, 29.99, '2023-08-10', 'completed'),
  (8, 8, 1, 79.99, '2023-08-15', 'pending');

-- Some useful sample queries to test the application:

-- Query 1: Get all users with their details
-- SELECT * FROM users ORDER BY hire_date DESC;

-- Query 2: Find products by category
-- SELECT name, price, stock_quantity FROM products WHERE category = 'Electronics' ORDER BY price DESC;

-- Query 3: Get order summary with user and product info
-- SELECT 
--   u.name as customer_name,
--   p.name as product_name,
--   o.quantity,
--   o.total_amount,
--   o.order_date,
--   o.status
-- FROM orders o
-- JOIN users u ON o.user_id = u.id
-- JOIN products p ON o.product_id = p.id
-- ORDER BY o.order_date DESC;

-- Query 4: Department salary analysis
-- SELECT 
--   department,
--   COUNT(*) as employee_count,
--   AVG(salary) as avg_salary,
--   MIN(salary) as min_salary,
--   MAX(salary) as max_salary
-- FROM users 
-- WHERE is_active = TRUE
-- GROUP BY department
-- ORDER BY avg_salary DESC;

-- Query 5: Product sales summary
-- SELECT 
--   p.name,
--   p.category,
--   SUM(o.quantity) as total_sold,
--   SUM(o.total_amount) as total_revenue,
--   COUNT(o.id) as order_count
-- FROM products p
-- LEFT JOIN orders o ON p.id = o.product_id
-- GROUP BY p.id, p.name, p.category
-- ORDER BY total_revenue DESC;
