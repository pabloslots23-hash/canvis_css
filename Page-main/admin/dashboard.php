<?php
session_start();
require_once '../php/config.php';
require_once '../php/admin-auth.php';
require_once '../php/database.php'; // Incluir conexión a base de datos

// Verificar autenticación
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: index.php');
    exit;
}

// Obtener estadísticas REALES de la base de datos
// La función format_currency() está en php/config.php
$stats = $database->getOrderStats();
$total_orders = $stats['total_orders'] ?? 0;
$total_products = $stats['total_products'] ?? 0;
$total_revenue = $stats['total_revenue'] ?? 0;
$pending_orders = $stats['pending_orders'] ?? 0;

// Obtener pedidos recientes (limit 5 para el dashboard)
$recent_orders = $database->getOrders(5);

// Función auxiliar para formatear estado de pedido
function format_order_status($status) {
    $statuses = [
        'pending' => 'Pendiente',
        'processing' => 'Procesando', 
        'shipped' => 'Enviado',
        'delivered' => 'Entregado',
        'cancelled' => 'Cancelado'
    ];
    return $statuses[$status] ?? ucfirst($status);
}

// Función auxiliar para obtener clase CSS de estado de pedido
function get_status_class($status) {
    $classes = [
        'pending' => 'pending',
        'processing' => 'processing', 
        'shipped' => 'delivered', // Usar delivered para simular envío completado
        'delivered' => 'delivered',
        'cancelled' => 'cancelled'
    ];
    return $classes[$status] ?? 'info';
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - VOURNE Admin</title>
    <link rel="stylesheet" href="../assets/css/main.css">
    <link rel="stylesheet" href="../assets/css/admin.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="admin-dashboard">
    <div class="admin-layout">
        <aside class="admin-sidebar">
            <div class="sidebar-header">
                <h2>VOURNE</h2>
                <p>Admin Panel</p>
            </div>
            
            <nav class="sidebar-nav">
                <a href="dashboard.php" class="nav-item active">
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
                <a href="settings.php" class="nav-item">
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

        <main class="admin-main">
            <header class="admin-header">
                <h1>Dashboard</h1>
                <div class="admin-user">
                    <span>Hola, <?php echo $_SESSION['admin_username']; ?></span>
                </div>
            </header>

            <div class="admin-content">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-shopping-bag"></i>
                        </div>
                        <div class="stat-info">
                            <h3><?php echo $total_orders; ?></h3>
                            <p>Total Pedidos</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-tshirt"></i>
                        </div>
                        <div class="stat-info">
                            <h3><?php echo $total_products; ?></h3>
                            <p>Productos</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-euro-sign"></i>
                        </div>
                        <div class="stat-info">
                            <h3><?php echo format_currency($total_revenue); ?></h3>
                            <p>Ingresos Totales</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-info">
                            <h3><?php echo $pending_orders; ?></h3>
                            <p>Pedidos Pendientes</p>
                        </div>
                    </div>
                </div>

                <div class="content-grid">
                    <div class="content-card">
                        <h3>Actividad Reciente</h3>
                        <div class="activity-list">
                            <?php if (!empty($recent_orders)): ?>
                                <?php foreach ($recent_orders as $order): ?>
                                    <div class="activity-item">
                                        <div class="activity-icon success">
                                            <i class="fas fa-shopping-cart"></i>
                                        </div>
                                        <div class="activity-content">
                                            <p><strong>Nuevo pedido #<?php echo $order['order_number']; ?></strong></p>
                                            <span><?php echo format_currency($order['total_amount']); ?></span>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <p>No hay actividad reciente.</p>
                            <?php endif; ?>
                            <div class="activity-item">
                                <div class="activity-icon warning">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <div class="activity-content">
                                    <p><strong>Stock bajo: Parka Técnica</strong></p>
                                    <span>Quedan 5 unidades (Simulado)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="content-card">
                        <h3>Pedidos Recientes</h3>
                        <div class="orders-list">
                            <?php if (!empty($recent_orders)): ?>
                                <?php foreach ($recent_orders as $order): 
                                    $customer_data = json_decode($order['customer_data'], true);
                                    $customer_name = $customer_data['firstName'] ?? 'Cliente';
                                ?>
                                    <div class="order-item">
                                        <div class="order-info">
                                            <strong>#<?php echo $order['order_number']; ?></strong>
                                            <span><?php echo $customer_name; ?></span>
                                        </div>
                                        <div class="order-status <?php echo get_status_class($order['order_status']); ?>">
                                            <?php echo format_order_status($order['order_status']); ?>
                                        </div>
                                        <div class="order-amount">
                                            <?php echo format_currency($order['total_amount']); ?>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <p>No hay pedidos recientes.</p>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>

                <div class="content-card">
                    <h3>Acciones Rápidas</h3>
                    <div class="quick-actions">
                        <a href="products.php?action=new" class="btn btn--primary">
                            <i class="fas fa-plus"></i>
                            Añadir Producto
                        </a>
                        <a href="orders.php" class="btn btn--secondary">
                            <i class="fas fa-list"></i>
                            Ver Todos los Pedidos
                        </a>
                        <a href="settings.php" class="btn btn--secondary">
                            <i class="fas fa-cog"></i>
                            Configuración
                        </a>
                    </div>
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
