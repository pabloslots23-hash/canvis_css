<?php
require_once 'config.php';

function authenticate_admin($username, $password) {
    // En un entorno real, esto verificaría contra la base de datos
    // Por ahora, usamos credenciales hardcodeadas para desarrollo
    
    $admin_users = [
        'admin' => password_hash('admin123', PASSWORD_DEFAULT)
    ];
    
    if (isset($admin_users[$username])) {
        return password_verify($password, $admin_users[$username]);
    }
    
    return false;
}

function require_admin_auth() {
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        header('Location: ../admin/index.php');
        exit;
    }
}

function change_admin_password($username, $current_password, $new_password) {
    if (authenticate_admin($username, $current_password)) {
        // En un entorno real, actualizaríamos la base de datos
        $new_hash = password_hash($new_password, PASSWORD_DEFAULT);
        
        // Por ahora, solo simulamos el cambio
        return true;
    }
    
    return false;
}

// Función para verificar permisos (para futuras expansiones)
function has_permission($permission) {
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        return false;
    }
    
    // Por ahora, todos los usuarios admin tienen todos los permisos
    // En el futuro, podrías implementar un sistema de roles
    return true;
}

// Función para registrar actividad del admin
function log_admin_activity($action, $details = '') {
    $log_file = __DIR__ . '/../logs/admin_activity.log';
    $timestamp = date('Y-m-d H:i:s');
    $username = $_SESSION['admin_username'] ?? 'unknown';
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    
    $log_entry = "[$timestamp] [$ip_address] [$username] $action";
    if ($details) {
        $log_entry .= " - $details";
    }
    $log_entry .= PHP_EOL;
    
    // Crear directorio de logs si no existe
    $log_dir = dirname($log_file);
    if (!is_dir($log_dir)) {
        mkdir($log_dir, 0755, true);
    }
    
    file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
}
?>