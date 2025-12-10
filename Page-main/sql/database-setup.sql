-- VOURNE E-commerce Database Setup
CREATE DATABASE IF NOT EXISTS vourne_db;
USE vourne_db;

-- Products Table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category ENUM('men', 'women', 'accessories') NOT NULL,
    subcategory VARCHAR(100),
    image_url VARCHAR(500),
    stock_quantity INT DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    sizes JSON,
    colors JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT,
    customer_email VARCHAR(255) NOT NULL,
    customer_data JSON,
    items JSON NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_method VARCHAR(50),
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Admin Users Table
CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager') DEFAULT 'manager',
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Newsletter Subscribers Table
CREATE TABLE newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact Messages Table
CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Sample Products
INSERT INTO products (name, description, price, category, subcategory, image_url, stock_quantity, featured, sizes, colors) VALUES
('Parka Técnica', 'Parka técnica de alta calidad con protección contra el viento y agua.', 129.00, 'men', 'jackets', 'assets/images/products/parka-tecnica.jpg', 50, TRUE, '["S", "M", "L", "XL"]', '["Negro", "Verde Militar", "Azul Marino"]'),
('Jersey Oversize', 'Jersey oversize cómodo y elegante para el día a día.', 59.90, 'women', 'sweaters', 'assets/images/products/jersey-oversize.jpg', 75, TRUE, '["XS", "S", "M", "L"]', '["Beige", "Negro", "Blanco"]'),
('Jeans Flare', 'Jeans flare con corte moderno y ajuste perfecto.', 59.99, 'men', 'pants', 'assets/images/products/jeans-flare.jpg', 60, TRUE, '["28", "30", "32", "34", "36"]', '["Azul Claro", "Azul Oscuro", "Negro"]'),
('Chaqueta Mixta', 'Chaqueta mixta versátil para diferentes ocasiones.', 89.00, 'women', 'jackets', 'assets/images/products/chaqueta-mixta.jpg', 45, TRUE, '["S", "M", "L", "XL"]', '["Negro", "Camel", "Gris"]'),
('Vestido Midi', 'Vestido midi elegante para ocasiones especiales.', 79.00, 'women', 'dresses', 'assets/images/products/vestido-midi.jpg', 30, FALSE, '["XS", "S", "M", "L"]', '["Negro", "Rojo", "Azul Marino"]'),
('Sudadera Capucha', 'Sudadera con capucha cómoda y casual.', 49.90, 'men', 'sweaters', 'assets/images/products/sudadera-capucha.jpg', 80, FALSE, '["S", "M", "L", "XL", "XXL"]', '["Gris", "Negro", "Verde"]');

-- Insert Admin User (default password: admin123)
INSERT INTO admin_users (username, email, password_hash, role) VALUES
('admin', 'contact@vourneofficial.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert Sample Orders
INSERT INTO orders (order_number, customer_email, customer_data, items, subtotal, shipping_cost, total_amount, shipping_method, payment_method, payment_status, order_status, shipping_address) VALUES
('VOURNE-20250001', 'cliente@ejemplo.com', '{"firstName": "María", "lastName": "García", "email": "cliente@ejemplo.com", "phone": "+34600123456"}', '[{"id": 1, "name": "Parka Técnica", "price": 129.00, "quantity": 1, "image": "assets/images/products/parka-tecnica.jpg"}]', 129.00, 4.95, 133.95, 'standard', 'paypal', 'completed', 'delivered', '{"firstName": "María", "lastName": "García", "address": "Calle Principal 123", "city": "Madrid", "postalCode": "28001", "country": "ES"}'),
('VOURNE-20250002', 'otro@cliente.com', '{"firstName": "Carlos", "lastName": "López", "email": "otro@cliente.com", "phone": "+34600234567"}', '[{"id": 2, "name": "Jersey Oversize", "price": 59.90, "quantity": 2, "image": "assets/images/products/jersey-oversize.jpg"}]', 119.80, 0.00, 119.80, 'free', 'card', 'completed', 'processing', '{"firstName": "Carlos", "lastName": "López", "address": "Avenida Central 456", "city": "Barcelona", "postalCode": "08001", "country": "ES"}');

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_customer ON orders(customer_email);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_customers_email ON customers(email);

-- Create views for common queries
CREATE VIEW featured_products AS
SELECT * FROM products WHERE featured = TRUE AND active = TRUE ORDER BY created_at DESC;

CREATE VIEW recent_orders AS
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

CREATE VIEW customer_orders AS
SELECT o.*, c.first_name, c.last_name 
FROM orders o 
LEFT JOIN customers c ON o.customer_email = c.email 
ORDER BY o.created_at DESC;