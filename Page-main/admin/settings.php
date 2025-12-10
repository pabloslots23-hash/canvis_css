<?php
session_start();
require_once '../php/config.php';
require_once '../php/admin-auth.php';

// Verificar autenticación
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: index.php');
    exit;
}

// Procesar cambios de configuración
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $message = "Configuración actualizada correctamente";
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configuración - VOURNE Admin</title>
    <link rel="stylesheet" href="../assets/css/main.css">
    <link rel="stylesheet" href="../assets/css/admin.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="admin-dashboard">
    <div class="admin-layout">
        <!-- Sidebar -->
        <aside class="admin-sidebar">
            <div class="sidebar-header">
                <h2>VOURNE</h2>
                <p>Admin Panel</p>
            </div>
            
            <nav class="sidebar-nav">
                <a href="dashboard.php" class="nav-item">
                    <i class="fas fa-tachometer-alt"></i>
                    <span>Dashboard</span>
                </a>
                <a href="products.php" class="nav-item">
                    <i class="fas fa-tshirt"></i>
                    <span>Productos</span>
                </a>
                <a href="orders.php" class="nav-item">
                    <i class="fas fa-shopping-bag"></i>
                    <span>Pedidos</span>
                </a>
                <a href="settings.php" class="nav-item active">
                    <i class="fas fa-cog"></i>
                    <span>Configuración</span>
                </a>
                <a href="../index.html" class="nav-item">
                    <i class="fas fa-store"></i>
                    <span>Ver Tienda</span>
                </a>
                <a href="?logout=1" class="nav-item logout">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Cerrar Sesión</span>
                </a>
            </nav>
        </aside>

        <!-- Main Content -->
        <main class="admin-main">
            <header class="admin-header">
                <h1>Configuración</h1>
                <div class="admin-actions">
                    <button type="submit" form="settingsForm" class="btn btn--primary">
                        <i class="fas fa-save"></i>
                        Guardar Cambios
                    </button>
                </div>
            </header>

            <div class="admin-content">
                <?php if (isset($message)): ?>
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    <?php echo $message; ?>
                </div>
                <?php endif; ?>

                <form id="settingsForm" method="POST" class="settings-form">
                    <!-- Información General -->
                    <div class="settings-section">
                        <h3>Información General</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="store_name">Nombre de la Tienda</label>
                                <input type="text" id="store_name" name="store_name" value="VOURNE" required>
                            </div>
                            <div class="form-group">
                                <label for="store_email">Email de Contacto</label>
                                <input type="email" id="store_email" name="store_email" value="contact@vourneofficial.com" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="store_description">Descripción de la Tienda</label>
                            <textarea id="store_description" name="store_description" rows="3">Minimal Luxury - Ropa y accesorios diseñados con atención al detalle y materiales de calidad.</textarea>
                        </div>
                    </div>

                    <!-- Configuración de Pagos -->
                    <div class="settings-section">
                        <h3>Configuración de Pagos</h3>
                        
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="paypal_enabled" checked>
                                <span class="checkmark"></span>
                                Habilitar PayPal
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label for="paypal_email">Email de PayPal</label>
                            <input type="email" id="paypal_email" name="paypal_email" placeholder="tu-email@paypal.com">
                        </div>

                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="stripe_enabled" checked>
                                <span class="checkmark"></span>
                                Habilitar Stripe (Tarjetas)
                            </label>
                        </div>

                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="transfer_enabled" checked>
                                <span class="checkmark"></span>
                                Habilitar Transferencia Bancaria
                            </label>
                        </div>

                        <div class="form-group">
                            <label for="bank_details">Datos Bancarios</label>
                            <textarea id="bank_details" name="bank_details" rows="3" placeholder="IBAN: ESXX XXXX XXXX XXXX XXXX XXXX&#10;Beneficiario: VOURNE OFFICIAL">IBAN: ESXX XXXX XXXX XXXX XXXX XXXX
Beneficiario: VOURNE OFFICIAL</textarea>
                        </div>
                    </div>

                    <!-- Configuración de Envíos -->
                    <div class="settings-section">
                        <h3>Configuración de Envíos</h3>
                        
                        <div class="form-group">
                            <label for="shipping_cost">Coste de Envío Estándar (€)</label>
                            <input type="number" id="shipping_cost" name="shipping_cost" value="4.95" step="0.01" min="0">
                        </div>

                        <div class="form-group">
                            <label for="express_shipping_cost">Coste de Envío Express (€)</label>
                            <input type="number" id="express_shipping_cost" name="express_shipping_cost" value="9.95" step="0.01" min="0">
                        </div>

                        <div class="form-group">
                            <label for="free_shipping_min">Mínimo para Envío Gratuito (€)</label>
                            <input type="number" id="free_shipping_min" name="free_shipping_min" value="100.00" step="0.01" min="0">
                        </div>

                        <div class="form-group">
                            <label for="shipping_zones">Zonas de Envío</label>
                            <select id="shipping_zones" name="shipping_zones" multiple>
                                <option value="ES" selected>España</option>
                                <option value="FR" selected>Francia</option>
                                <option value="IT" selected>Italia</option>
                                <option value="DE" selected>Alemania</option>
                                <option value="PT" selected>Portugal</option>
                            </select>
                            <small>Mantén Ctrl (Cmd en Mac) para seleccionar múltiples países</small>
                        </div>
                    </div>

                    <!-- Configuración de Email -->
                    <div class="settings-section">
                        <h3>Configuración de Email</h3>
                        
                        <div class="form-group">
                            <label for="smtp_host">Servidor SMTP</label>
                            <input type="text" id="smtp_host" name="smtp_host" value="mail.vourneofficial.com">
                        </div>

                        <div class="form-grid">
                            <div class="form-group">
                                <label for="smtp_user">Usuario SMTP</label>
                                <input type="text" id="smtp_user" name="smtp_user" value="contact@vourneofficial.com">
                            </div>
                            <div class="form-group">
                                <label for="smtp_pass">Contraseña SMTP</label>
                                <input type="password" id="smtp_pass" name="smtp_pass" placeholder="••••••••">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="smtp_port">Puerto SMTP</label>
                            <input type="number" id="smtp_port" name="smtp_port" value="587">
                        </div>
                    </div>

                    <!-- Configuración de Seguridad -->
                    <div class="settings-section">
                        <h3>Seguridad</h3>
                        
                        <div class="form-group">
                            <label for="current_password">Contraseña Actual</label>
                            <input type="password" id="current_password" name="current_password">
                        </div>

                        <div class="form-grid">
                            <div class="form-group">
                                <label for="new_password">Nueva Contraseña</label>
                                <input type="password" id="new_password" name="new_password">
                            </div>
                            <div class="form-group">
                                <label for="confirm_password">Confirmar Contraseña</label>
                                <input type="password" id="confirm_password" name="confirm_password">
                            </div>
                        </div>
                    </div>
                </form>

                <!-- Danger Zone -->
                <div class="settings-section danger-zone">
                    <h3>Zona de Peligro</h3>
                    <div class="danger-actions">
                        <button class="btn btn--danger">
                            <i class="fas fa-trash"></i>
                            Eliminar Todos los Datos
                        </button>
                        <button class="btn btn--danger">
                            <i class="fas fa-download"></i>
                            Exportar Backup
                        </button>
                        <button class="btn btn--danger">
                            <i class="fas fa-upload"></i>
                            Restaurar Backup
                        </button>
                    </div>
                    <p class="danger-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        Estas acciones son irreversibles. Realiza backups regularmente.
                    </p>
                </div>
            </div>
        </main>
    </div>

    <?php
    // Logout
    if (isset($_GET['logout'])) {
        session_destroy();
        header('Location: index.php');
        exit;
    }
    ?>
</body>
</html>