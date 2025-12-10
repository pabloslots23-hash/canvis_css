<?php
require_once 'config.php';

class Database {
    private $connection;
    
    public function __construct() {
        try {
            $this->connection = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            die("Error de conexión: " . $e->getMessage());
        }
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    // Product methods
    public function getProducts($category = null, $featured = false) {
        $sql = "SELECT * FROM products WHERE active = 1";
        $params = [];
        
        if ($category) {
            $sql .= " AND category = ?";
            $params[] = $category;
        }
        
        if ($featured) {
            $sql .= " AND featured = 1";
        }
        
        $sql .= " ORDER BY created_at DESC";
        
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll();
    }
    
    public function getProduct($id) {
        $sql = "SELECT * FROM products WHERE id = ? AND active = 1";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute([$id]);
        
        return $stmt->fetch();
    }
    
    public function createProduct($data) {
        $sql = "INSERT INTO products (name, description, price, category, subcategory, image_url, stock_quantity, featured) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->connection->prepare($sql);
        return $stmt->execute([
            $data['name'],
            $data['description'],
            $data['price'],
            $data['category'],
            $data['subcategory'],
            $data['image_url'],
            $data['stock_quantity'],
            $data['featured'] ? 1 : 0
        ]);
    }
    
    public function updateProduct($id, $data) {
        $sql = "UPDATE products SET name = ?, description = ?, price = ?, category = ?, subcategory = ?, 
                image_url = ?, stock_quantity = ?, featured = ?, updated_at = NOW() WHERE id = ?";
        
        $stmt = $this->connection->prepare($sql);
        return $stmt->execute([
            $data['name'],
            $data['description'],
            $data['price'],
            $data['category'],
            $data['subcategory'],
            $data['image_url'],
            $data['stock_quantity'],
            $data['featured'] ? 1 : 0,
            $id
        ]);
    }
    
    // Order methods
    public function createOrder($data) {
        $sql = "INSERT INTO orders (order_number, customer_email, customer_data, items, subtotal, 
                shipping_cost, total_amount, shipping_method, payment_method, shipping_address) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->connection->prepare($sql);
        return $stmt->execute([
            $data['order_number'],
            $data['customer_email'],
            $data['customer_data'],
            $data['items'],
            $data['subtotal'],
            $data['shipping_cost'],
            $data['total_amount'],
            $data['shipping_method'],
            $data['payment_method'],
            $data['shipping_address']
        ]);
    }
    
    public function getOrders($limit = null) {
        $sql = "SELECT * FROM orders ORDER BY created_at DESC";
        
        if ($limit) {
            $sql .= " LIMIT ?";
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$limit]);
        } else {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute();
        }
        
        return $stmt->fetchAll();
    }
    
    public function getOrder($order_number) {
        $sql = "SELECT * FROM orders WHERE order_number = ?";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute([$order_number]);
        
        return $stmt->fetch();
    }
    
    public function updateOrderStatus($order_number, $status) {
        $sql = "UPDATE orders SET order_status = ?, updated_at = NOW() WHERE order_number = ?";
        $stmt = $this->connection->prepare($sql);
        return $stmt->execute([$status, $order_number]);
    }
    
    // Customer methods
    public function createCustomer($data) {
        $sql = "INSERT INTO customers (email, first_name, last_name, phone, address, city, postal_code, country) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->connection->prepare($sql);
        return $stmt->execute([
            $data['email'],
            $data['first_name'],
            $data['last_name'],
            $data['phone'],
            $data['address'],
            $data['city'],
            $data['postal_code'],
            $data['country']
        ]);
    }
    
    public function getCustomer($email) {
        $sql = "SELECT * FROM customers WHERE email = ?";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute([$email]);
        
        return $stmt->fetch();
    }
    
    // Newsletter methods
    public function addNewsletterSubscriber($email) {
        // Check if already subscribed
        $sql = "SELECT id FROM newsletter_subscribers WHERE email = ? AND active = 1";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute([$email]);
        
        if ($stmt->fetch()) {
            return false; // Already subscribed
        }
        
        // Insert new subscriber
        $sql = "INSERT INTO newsletter_subscribers (email) VALUES (?) 
                ON DUPLICATE KEY UPDATE active = 1, subscribed_at = NOW()";
        $stmt = $this->connection->prepare($sql);
        return $stmt->execute([$email]);
    }
    
    // Statistics methods
    public function getOrderStats() {
        $stats = [];
        
        // Total orders
        $sql = "SELECT COUNT(*) as total FROM orders";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute();
        $stats['total_orders'] = $stmt->fetch()['total'];
        
        // Pending orders
        $sql = "SELECT COUNT(*) as pending FROM orders WHERE order_status = 'pending'";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute();
        $stats['pending_orders'] = $stmt->fetch()['pending'];
        
        // Total revenue
        $sql = "SELECT SUM(total_amount) as revenue FROM orders WHERE payment_status = 'completed'";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute();
        $stats['total_revenue'] = $stmt->fetch()['revenue'] ?: 0;
        
        // Total products
        $sql = "SELECT COUNT(*) as total FROM products WHERE active = 1";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute();
        $stats['total_products'] = $stmt->fetch()['total'];
        
        return $stats;
    }
}

// Create global database instance
$database = new Database();
?>