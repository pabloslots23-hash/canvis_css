<?php
session_start();
require_once '../php/config.php';
require_once '../php/admin-auth.php';

// Verificar autenticación
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: index.php');
    exit;
}

// Pedidos de ejemplo
$orders = [
    [
        'id' => 'VOURNE-12345',
        'customer' => 'Ana García',
        'email' => 'ana@email.com',
        'date' => '2025-01-15',
        'total' => 129.00,
        'status' => 'completed',
        'payment' => 'paypal'
    ],
    [
        'id' => 'VOURNE-12346',
        'customer' => 'Carlos López',
        'email' => 'carlos@email.com',
        'date' => '2025-01-14',
        'total' => 89.00,
        'status' => 'processing',
        'payment' => 'card'
    ],
    [
        'id' => 'VOURNE-12347',
        'customer' => 'María Rodríguez',
        'email' => 'maria@email.com',
        'date' => '2025-01-13',
        'total' => 149.90,
        'status' => 'pending',
        'payment' => 'transfer'
    ]
];
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Pedidos - VOURNE Admin</title>
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
                <a href="orders.php" class="nav-item active">
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

        <!-- Main Content -->
        <main class="admin-main">
            <header class="admin-header">
                <h1>Gestión de Pedidos</h1>
                <div class="admin-actions">
                    <button class="btn btn--secondary">
                        <i class="fas fa-download"></i>
                        Exportar
                    </button>
                </div>
            </header>

            <div class="admin-content">
                <!-- Orders Table -->
                <div class="content-card">
                    <div class="table-header">
                        <h3>Todos los Pedidos</h3>
                        <div class="table-actions">
                            <input type="text" placeholder="Buscar pedidos..." class="search-input">
                            <select class="filter-select">
                                <option value="all">Todos los estados</option>
                                <option value="pending">Pendiente</option>
                                <option value="processing">Procesando</option>
                                <option value="completed">Completado</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Nº Pedido</th>
                                    <th>Cliente</th>
                                    <th>Fecha</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th>Pago</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($orders as $order): ?>
                                <tr>
                                    <td>
                                        <strong><?php echo $order['id']; ?></strong>
                                    </td>
                                    <td>
                                        <div class="customer-info">
                                            <strong><?php echo $order['customer']; ?></strong>
                                            <span><?php echo $order['email']; ?></span>
                                        </div>
                                    </td>
                                    <td><?php echo $order['date']; ?></td>
                                    <td>
                                        <strong><?php echo number_format($order['total'], 2); ?>€</strong>
                                    </td>
                                    <td>
                                        <span class="status-badge status-<?php echo $order['status']; ?>">
                                            <?php 
                                            $statuses = [
                                                'pending' => 'Pendiente',
                                                'processing' => 'Procesando', 
                                                'completed' => 'Completado'
                                            ];
                                            echo $statuses[$order['status']];
                                            ?>
                                        </span>
                                    </td>
                                    <td>
                                        <span class="payment-badge payment-<?php echo $order['payment']; ?>">
                                            <i class="fas fa-<?php echo $order['payment'] === 'paypal' ? 'paypal' : ($order['payment'] === 'card' ? 'credit-card' : 'university'); ?>"></i>
                                            <?php echo ucfirst($order['payment']); ?>
                                        </span>
                                    </td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="btn-icon view" title="Ver Detalles">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button class="btn-icon edit" title="Editar Estado">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn-icon print" title="Imprimir">
                                                <i class="fas fa-print"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Order Statistics -->
                <div class="stats-grid compact">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-shopping-bag"></i>
                        </div>
                        <div class="stat-info">
                            <h3>42</h3>
                            <p>Total Pedidos</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-info">
                            <h3>3</h3>
                            <p>Pendientes</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-euro-sign"></i>
                        </div>
                        <div class="stat-info">
                            <h3>2.845€</h3>
                            <p>Ingresos Mes</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-info">
                            <h3>39</h3>
                            <p>Completados</p>
                        </div>
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