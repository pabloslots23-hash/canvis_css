<?php
// VOURNE E-commerce Configuration
define('SITE_NAME', 'VOURNE');
define('SITE_URL', 'https://vourneofficial.com');
define('ADMIN_EMAIL', 'contact@vourneofficial.com');

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'vourne_db');
define('DB_USER', 'vourne_user');
define('DB_PASS', 'your_password_here');

// PayPal Configuration (Update with your credentials)
define('PAYPAL_CLIENT_ID', 'your_paypal_client_id');
define('PAYPAL_CLIENT_SECRET', 'your_paypal_client_secret');
define('PAYPAL_MODE', 'sandbox'); // sandbox or live

// Stripe Configuration (Update with your credentials)
define('STRIPE_PUBLISHABLE_KEY', 'pk_test_your_stripe_key');
define('STRIPE_SECRET_KEY', 'sk_test_your_stripe_secret');

// Email Configuration
define('SMTP_HOST', 'mail.vourneofficial.com');
define('SMTP_USER', 'contact@vourneofficial.com');
define('SMTP_PASS', 'your_email_password');
define('SMTP_PORT', 587);

// Shipping Configuration
define('FREE_SHIPPING_MIN', 100.00);
define('STANDARD_SHIPPING_COST', 4.95);
define('EXPRESS_SHIPPING_COST', 9.95);

// Error Reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Timezone
date_default_timezone_set('Europe/Madrid');

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// CORS headers for API requests
header('Access-Control-Allow-Origin: ' . SITE_URL);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Security headers
header('X-Frame-Options: SAMEORIGIN');
header('X-Content-Type-Options: nosniff');
header('X-XSS-Protection: 1; mode=block');

// Function to sanitize input
function sanitize_input($data) {
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// Function to validate email
function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Function to generate order number
function generate_order_number() {
    return 'VOURNE-' . date('Ymd') . '-' . strtoupper(uniqid());
}

// Function to format currency
function format_currency($amount) {
    return number_format($amount, 2, ',', '.') . ' €';
}

// Function to calculate shipping cost
function calculate_shipping_cost($subtotal, $shipping_method) {
    if ($subtotal >= FREE_SHIPPING_MIN) {
        return 0;
    }
    
    switch ($shipping_method) {
        case 'express':
            return EXPRESS_SHIPPING_COST;
        case 'standard':
        default:
            return STANDARD_SHIPPING_COST;
    }
}
?>