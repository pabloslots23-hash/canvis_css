<?php
require_once 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

try {
    // Get and validate form data
    $name = sanitize_input($_POST['name'] ?? '');
    $email = sanitize_input($_POST['email'] ?? '');
    $subject = sanitize_input($_POST['subject'] ?? '');
    $message = sanitize_input($_POST['message'] ?? '');

    // Validate required fields
    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        throw new Exception('Todos los campos son obligatorios');
    }

    // Validate email
    if (!validate_email($email)) {
        throw new Exception('Email no válido');
    }

    // Prepare email content
    $email_subject = "Contacto VOURNE: $subject";
    
    $email_message = "
    Nuevo mensaje de contacto desde la web de VOURNE:

    Nombre: $name
    Email: $email
    Asunto: $subject

    Mensaje:
    $message

    ---
    Enviado el: " . date('d/m/Y H:i:s') . "
    IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'Desconocida') . "
    ";

    $html_message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .field { margin-bottom: 15px; }
            .field-label { font-weight: bold; color: #8B4513; }
            .footer { background: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h1>VOURNE - Nuevo Mensaje de Contacto</h1>
        </div>
        
        <div class='content'>
            <div class='field'>
                <span class='field-label'>Nombre:</span>
                <span>$name</span>
            </div>
            
            <div class='field'>
                <span class='field-label'>Email:</span>
                <span>$email</span>
            </div>
            
            <div class='field'>
                <span class='field-label'>Asunto:</span>
                <span>$subject</span>
            </div>
            
            <div class='field'>
                <span class='field-label'>Mensaje:</span>
                <div style='margin-top: 10px; padding: 15px; background: #f8f8f8; border-radius: 5px;'>
                    $message
                </div>
            </div>
        </div>
        
        <div class='footer'>
            <p>Enviado el: " . date('d/m/Y H:i:s') . " | IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'Desconocida') . "</p>
            <p>&copy; 2025 VOURNE</p>
        </div>
    </body>
    </html>
    ";

    // Email headers
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: VOURNE Web <contact@vourneofficial.com>" . "\r\n";
    $headers .= "Reply-To: $email" . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // Send email to admin
    $sent = mail(ADMIN_EMAIL, $email_subject, $html_message, $headers);

    if ($sent) {
        // Send confirmation to customer
        $customer_subject = "Confirmación de contacto - VOURNE";
        $customer_message = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .footer { background: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class='header'>
                <h1>VOURNE</h1>
                <p>MINIMAL LUXURY</p>
            </div>
            
            <div class='content'>
                <h2>¡Gracias por contactarnos!</h2>
                <p>Hemos recibido tu mensaje y te responderemos en un plazo máximo de 24 horas.</p>
                
                <div style='background: #f8f8f8; padding: 15px; border-radius: 5px; margin: 15px 0;'>
                    <p><strong>Resumen de tu mensaje:</strong></p>
                    <p><strong>Asunto:</strong> $subject</p>
                    <p><strong>Mensaje:</strong> $message</p>
                </div>
                
                <p>Si necesitas ayuda inmediata, puedes respondernos directamente a este email.</p>
            </div>
            
            <div class='footer'>
                <p>&copy; 2025 VOURNE. Todos los derechos reservados.</p>
                <p>contact@vourneofficial.com</p>
            </div>
        </body>
        </html>
        ";

        $customer_headers = "MIME-Version: 1.0" . "\r\n";
        $customer_headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $customer_headers .= "From: VOURNE <contact@vourneofficial.com>" . "\r\n";
        
        mail($email, $customer_subject, $customer_message, $customer_headers);

        // Save contact to database (opcional)
        save_contact_message($name, $email, $subject, $message);

        echo json_encode([
            'success' => true,
            'message' => 'Mensaje enviado correctamente. Te responderemos pronto.'
        ]);
    } else {
        throw new Exception('Error al enviar el mensaje. Por favor, inténtalo de nuevo.');
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

function save_contact_message($name, $email, $subject, $message) {
    // En un entorno real, guardarías en la base de datos
    // Por ahora, solo simulamos el guardado
    
    $log_file = __DIR__ . '/../logs/contact_messages.log';
    $timestamp = date('Y-m-d H:i:s');
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    
    $log_entry = "[$timestamp] [$ip_address] [$email] $subject - $message" . PHP_EOL;
    
    // Crear directorio de logs si no existe
    $log_dir = dirname($log_file);
    if (!is_dir($log_dir)) {
        mkdir($log_dir, 0755, true);
    }
    
    file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
    
    return true;
}
?>