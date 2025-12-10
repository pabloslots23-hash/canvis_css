<?php
require_once 'config.php';
require_once 'database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

try {
    // Get and validate input data
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Datos de entrada inválidos');
    }

    // Validate required fields
    $required = ['customer', 'items', 'shipping', 'payment'];
    foreach ($required as $field) {
        if (!isset($input[$field])) {
            throw new Exception("Campo requerido faltante: $field");
        }
    }

    // Validate customer data
    $customer_required = ['email', 'firstName', 'lastName', 'address', 'city', 'postalCode', 'country'];
    foreach ($customer_required as $field) {
        if (!isset($input['customer'][$field]) || empty($input['customer'][$field])) {
            throw new Exception("Campo de cliente requerido faltante: $field");
        }
    }

    // Validate email
    if (!validate_email($input['customer']['email'])) {
        throw new Exception('Email no válido');
    }

    // Calculate totals
    $subtotal = 0;
    foreach ($input['items'] as $item) {
        if (!isset($item['price']) || !isset($item['quantity'])) {
            throw new Exception('Datos de producto inválidos');
        }
        $subtotal += $item['price'] * $item['quantity'];
    }

    $shipping_cost = calculate_shipping_cost($subtotal, $input['shipping']);
    $total = $subtotal + $shipping_cost;

    // Generate order number
    $order_number = generate_order_number();

    // Create order data
    $order_data = [
        'order_number' => $order_number,
        'customer_email' => $input['customer']['email'],
        'customer_data' => json_encode($input['customer']),
        'items' => json_encode($input['items']),
        'subtotal' => $subtotal,
        'shipping_cost' => $shipping_cost,
        'total_amount' => $total,
        'shipping_method' => $input['shipping'],
        'payment_method' => $input['payment'],
        'shipping_address' => json_encode([
            'firstName' => $input['customer']['firstName'],
            'lastName' => $input['customer']['lastName'],
            'address' => $input['customer']['address'],
            'city' => $input['customer']['city'],
            'postalCode' => $input['customer']['postalCode'],
            'country' => $input['customer']['country']
        ])
    ];

    // Save order to database
    $database = new Database();
    $order_saved = $database->createOrder($order_data);

    if ($order_saved) {
        // Save customer information
        $customer_data = [
            'email' => $input['customer']['email'],
            'first_name' => $input['customer']['firstName'],
            'last_name' => $input['customer']['lastName'],
            'phone' => $input['customer']['phone'] ?? '',
            'address' => $input['customer']['address'],
            'city' => $input['customer']['city'],
            'postal_code' => $input['customer']['postalCode'],
            'country' => $input['customer']['country']
        ];
        
        $database->createCustomer($customer_data);

        // Send confirmation email
        send_order_confirmation($input['customer']['email'], $order_data);
        
        // Process payment (simulated)
        $payment_result = process_payment($input['payment'], $total, $order_number);
        
        if ($payment_result['success']) {
            echo json_encode([
                'success' => true,
                'order_number' => $order_number,
                'message' => 'Pedido procesado correctamente',
                'payment' => $payment_result
            ]);
        } else {
            throw new Exception('Error en el procesamiento del pago: ' . $payment_result['message']);
        }
    } else {
        throw new Exception('Error al guardar el pedido en la base de datos');
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

function process_payment($method, $amount, $order_number) {
    // Simulate payment processing
    // In real implementation, integrate with PayPal, Stripe, etc.
    
    $transaction_id = '';
    
    switch ($method) {
        case 'card':
            // Process card payment via Stripe
            $transaction_id = 'stripe_' . uniqid();
            break;
            
        case 'paypal':
            // Process PayPal payment
            $transaction_id = 'paypal_' . uniqid();
            break;
            
        case 'transfer':
            // Bank transfer - mark as pending
            $transaction_id = 'transfer_' . uniqid();
            break;
            
        default:
            return ['success' => false, 'message' => 'Método de pago no válido'];
    }
    
    return [
        'success' => true, 
        'transaction_id' => $transaction_id,
        'method' => $method,
        'amount' => $amount
    ];
}

function send_order_confirmation($email, $order_data) {
    $subject = "Confirmación de Pedido - " . $order_data['order_number'];
    
    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #1a1a1a; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .order-details { background: #f8f8f8; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .footer { background: #1a1a1a; color: white; padding: 20px; text-align: center; font-size: 14px; }
            .product-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h1>VOURNE</h1>
            <p>MINIMAL LUXURY</p>
        </div>
        
        <div class='content'>
            <h2>¡Gracias por tu pedido!</h2>
            <p>Tu pedido <strong>{$order_data['order_number']}</strong> ha sido recibido correctamente.</p>
            
            <div class='order-details'>
                <h3>Resumen del Pedido</h3>
                
                <div class='product-list'>";
    
    $items = json_decode($order_data['items'], true);
    foreach ($items as $item) {
        $message .= "
                    <div class='product-item'>
                        <span>{$item['name']} x {$item['quantity']}</span>
                        <span>" . number_format($item['price'] * $item['quantity'], 2) . " €</span>
                    </div>";
    }
    
    $message .= "
                </div>
                
                <div class='total'>
                    <div style='display: flex; justify-content: space-between;'>
                        <span>Subtotal:</span>
                        <span>" . number_format($order_data['subtotal'], 2) . " €</span>
                    </div>
                    <div style='display: flex; justify-content: space-between;'>
                        <span>Envío:</span>
                        <span>" . number_format($order_data['shipping_cost'], 2) . " €</span>
                    </div>
                    <div style='display: flex; justify-content: space-between; margin-top: 10px; border-top: 1px solid #ddd; padding-top: 10px;'>
                        <span><strong>Total:</strong></span>
                        <span><strong>" . number_format($order_data['total_amount'], 2) . " €</strong></span>
                    </div>
                </div>
                
                <p><strong>Método de envío:</strong> " . ucfirst($order_data['shipping_method']) . "</p>
                <p><strong>Método de pago:</strong> " . ucfirst($order_data['payment_method']) . "</p>
            </div>
            
            <p>Te mantendremos informado sobre el estado de tu pedido. Si tienes alguna pregunta, no dudes en contactarnos.</p>
        </div>
        
        <div class='footer'>
            <p>&copy; 2025 VOURNE. Todos los derechos reservados.</p>
            <p>contact@vourneofficial.com</p>
        </div>
    </body>
    </html>
    ";
    
    // Email headers
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: VOURNE <contact@vourneofficial.com>" . "\r\n";
    $headers .= "Reply-To: contact@vourneofficial.com" . "\r\n";
    
    // Send email
    $sent = mail($email, $subject, $message, $headers);
    
    // Log email sending
    error_log("Order confirmation email " . ($sent ? "sent" : "failed") . " to: $email");
    
    return $sent;
}
?>