-- Production Database Setup for gas_supply_db on Clever Cloud
-- Run this script after creating your Clever Cloud database

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'storekeeper', 'filler', 'technician') DEFAULT 'filler',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Gas types table
CREATE TABLE IF NOT EXISTS gas_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Cylinders table
CREATE TABLE IF NOT EXISTS cylinders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(255) UNIQUE NOT NULL,
  size VARCHAR(50) NOT NULL,
  gas_type_id INT,
  status ENUM('empty', 'filled', 'delivered', 'returned', 'maintenance') DEFAULT 'empty',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (gas_type_id) REFERENCES gas_types(id) ON DELETE SET NULL
);

-- Supplies table
CREATE TABLE IF NOT EXISTS supplies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hospital_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  cylinder_count INT DEFAULT 0,
  total_price DECIMAL(10, 2) DEFAULT 0.00,
  status ENUM('pending', 'delivered', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Cylinder assignments table
CREATE TABLE IF NOT EXISTS cylinder_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cylinder_id INT NOT NULL,
  supply_id INT,
  vehicle_number VARCHAR(100),
  driver_name VARCHAR(255),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP NULL,
  returned_at TIMESTAMP NULL,
  status ENUM('assigned', 'delivered', 'returned') DEFAULT 'assigned',
  notes TEXT,
  FOREIGN KEY (cylinder_id) REFERENCES cylinders(id) ON DELETE CASCADE,
  FOREIGN KEY (supply_id) REFERENCES supplies(id) ON DELETE SET NULL
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supply_id INT NOT NULL,
  invoice_number VARCHAR(255) UNIQUE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('draft', 'sent', 'paid', 'overdue') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supply_id) REFERENCES supplies(id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (username, email, password, role) VALUES 
('admin', 'admin@gassupply.com', '$2b$10$rQZ9QmjytWIeJqM.FaHYdOuiM4EdDfkbmxMjy6TnurWgMjGjjxXzK', 'admin');

-- Insert sample gas types
INSERT IGNORE INTO gas_types (name, description, price) VALUES 
('Oxygen', 'Medical grade oxygen', 25.00),
('Nitrogen', 'Industrial nitrogen', 15.00),
('Argon', 'Welding grade argon', 30.00),
('CO2', 'Food grade carbon dioxide', 20.00);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cylinders_status ON cylinders(status);
CREATE INDEX IF NOT EXISTS idx_cylinders_gas_type ON cylinders(gas_type_id);
CREATE INDEX IF NOT EXISTS idx_supplies_status ON supplies(status);
CREATE INDEX IF NOT EXISTS idx_supplies_created_at ON supplies(created_at);
CREATE INDEX IF NOT EXISTS idx_cylinder_assignments_status ON cylinder_assignments(status);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

SELECT 'Database setup completed successfully!' as message;
