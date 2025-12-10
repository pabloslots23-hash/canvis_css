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

$product = null;
$message = null;
$error = null;
$action = $_GET['action'] ?? 'list';
$product_id = $_GET['id'] ?? null;

// --- 1. Manejar Solicitudes POST (Guardar/Actualizar) ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $product_id = $_POST['id'] ?? null;
    
    // NOTA: La subida de archivos (imágenes) debe ser implementada por el desarrollador.
    // Aquí usamos una simulación de la URL de la imagen.
    $image_url = $_POST['image_url'] ?? 'assets/images/products/default.jpg';
    
    if ($action === 'save' || $action === 'update') {
        // Recoger datos del formulario
        $data = [
            'name' => sanitize_input($_POST['name']),
            'description' => sanitize_input($_POST['description']),
            'price' => (float)$_POST['price'],
            'category' => sanitize_input($_POST['category']),
            'subcategory' => sanitize_input($_POST['subcategory'] ?? ''),
            'image_url' => $image_url,
            'stock_quantity' => (int)$_POST['stock_quantity'],
            'featured' => isset($_POST['featured']) ? 1 : 0
        ];
        
        if ($action === 'save') {
            if ($database->createProduct($data)) {
                $message = "Producto creado correctamente.";
                $action = 'list';
            } else {
                $error = "Error al crear el producto. Verifique la conexión a la base de datos.";
            }
        } elseif ($action === 'update' && $product_id) {
            $id = (int)$product_id;
            // Se asume que updateProduct maneja todos los campos para la actualización
            if ($database->updateProduct($id, $data)) {
                $message = "Producto actualizado correctamente.";
                $action = 'list';
            } else {
                $error = "Error al actualizar el producto. Verifique la conexión a la base de datos.";
            }
        }
    }
}

// --- 2. Manejar Acciones GET (Editar/Borrar) ---
if ($action === 'edit' && $product_id) {
    $product = $database->getProduct((int)$product_id);
    if (!$product) {
        $error = "Producto no encontrado.";
        $action = 'list';
    }
} elseif ($action === 'delete' && $product_id) {
    // Borrado LÓGICO: se recomienda cambiar 'active' a 0 en lugar de borrar el registro
    $data = ['active' => 0]; 
    if ($database->updateProduct((int)$product_id, $data)) {
        $message = "Producto eliminado (ocultado) correctamente.";
    } else {
        $error = "Error al eliminar el producto.";
    }
    $action = 'list'; // Volver a la vista de lista
}

// --- 3. Vista por defecto: Lista ---
if ($action === 'list') {
    // Obtener todos los productos activos de la base de datos
    $products = $database->getProducts();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Productos - VOURNE Admin</title>
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
                <a href="dashboard.php" class="nav-item">
                    <i class="fas fa-tachometer-alt"></i>
                    <span>Dashboard</span>
                </a>
                <a href="products.php" class="nav-item active">
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
                <h1>Gestión de Productos</h1>
                <div class="admin-actions">
                    <?php if ($action === 'list'): ?>
                    <a href="products.php?action=new" class="btn btn--primary">
                        <i class="fas fa-plus"></i>
                        Nuevo Producto
                    </a>
                    <?php endif; ?>
                </div>
            </header>

            <div class="admin-content">
                <?php if (isset($message)): ?>
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    <?php echo $message; ?>
                </div>
                <?php endif; ?>
                <?php if (isset($error)): ?>
                <div class="alert alert-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <?php echo $error; ?>
                </div>
                <?php endif; ?>

                <?php if ($action === 'list'): ?>
                <div class="content-card">
                    <div class="table-header">
                        <h3>Todos los Productos</h3>
                        <div class="table-actions">
                            <input type="text" placeholder="Buscar productos..." class="search-input">
                            <select class="filter-select">
                                <option value="all">Todas las categorías</option>
                                <option value="men">Hombre</option>
                                <option value="women">Mujer</option>
                                <option value="accessories">Accesorios</option>
                            </select>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Producto</th>
                                    <th>Categoría</th>
                                    <th>Precio</th>
                                    <th>Stock</th>
                                    <th>Estado</th>
                                    <th>Destacado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (empty($products)): ?>
                                    <tr><td colspan="8" class="text-center">No hay productos activos.</td></tr>
                                <?php endif; ?>
                                <?php foreach ($products as $product): 
                                    $category_name = ucfirst($product['category']);
                                    $stock_status = $product['stock_quantity'] < 10 ? 'low-stock' : 'in-stock';
                                    $active_status = $product['active'] ? 'active' : 'inactive';
                                ?>
                                <tr>
                                    <td><?php echo $product['id']; ?></td>
                                    <td>
                                        <div class="product-info">
                                            <img src="<?php echo !empty($product['image_url']) ? '../' . $product['image_url'] : '../assets/images/products/default.jpg'; ?>" 
                                                 alt="<?php echo $product['name']; ?>" 
                                                 class="product-thumb">
                                            <span><?php echo $product['name']; ?></span>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge category-<?php echo $product['category']; ?>">
                                            <?php echo $category_name; ?>
                                        </span>
                                    </td>
                                    <td><?php echo format_currency($product['price']); ?></td>
                                    <td>
                                        <span class="stock-badge <?php echo $stock_status; ?>">
                                            <?php echo $product['stock_quantity']; ?> unidades
                                        </span>
                                    </td>
                                    <td>
                                        <span class="status-badge <?php echo $active_status; ?>">
                                            <?php echo $product['active'] ? 'Activo' : 'Inactivo'; ?>
                                        </span>
                                    </td>
                                    <td>
                                        <label class="toggle-switch">
                                            <input type="checkbox" <?php echo $product['featured'] ? 'checked' : ''; ?>>
                                            <span class="slider"></span>
                                        </label>
                                    </td>
                                    <td>
                                        <div class="action-buttons">
                                            <a href="products.php?action=edit&id=<?php echo $product['id']; ?>" class="btn-icon edit" title="Editar">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <a href="products.php?action=delete&id=<?php echo $product['id']; ?>" class="btn-icon delete" title="Eliminar" onclick="return confirm('¿Estás seguro de que quieres eliminar (ocultar) el producto <?php echo $product['name']; ?>?');">
                                                <i class="fas fa-trash"></i>
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="stats-grid compact">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-tshirt"></i>
                        </div>
                        <div class="stat-info">
                            <h3><?php echo count($products); ?></h3>
                            <p>Total Productos Activos</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-star"></i>
                        </div>
                        <div class="stat-info">
                            <h3><?php echo count(array_filter($products, function($p) { return $p['featured']; })); ?></h3>
                            <p>Productos Destacados</p>
                        </div>
                    </div>
                </div>

                <?php elseif ($action === 'new' || $action === 'edit'): ?>
                <div class="content-card">
                    <h3><?php echo $action === 'new' ? 'Nuevo Producto' : 'Editar Producto: ' . $product['name']; ?></h3>
                    <form method="POST" action="products.php" enctype="multipart/form-data" class="settings-form">
                        <input type="hidden" name="action" value="<?php echo $action === 'new' ? 'save' : 'update'; ?>">
                        <?php if ($action === 'edit'): ?>
                            <input type="hidden" name="id" value="<?php echo $product['id']; ?>">
                        <?php endif; ?>

                        <div class="settings-section">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="name">Nombre del Producto *</label>
                                    <input type="text" id="name" name="name" value="<?php echo $product['name'] ?? ''; ?>" required>
                                </div>
                                <div class="form-group">
                                    <label for="price">Precio (€) *</label>
                                    <input type="number" id="price" name="price" value="<?php echo $product['price'] ?? ''; ?>" step="0.01" min="0" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="description">Descripción</label>
                                <textarea id="description" name="description" rows="4"><?php echo $product['description'] ?? ''; ?></textarea>
                            </div>
                        </div>

                        <div class="settings-section">
                            <h3>Clasificación y Stock</h3>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="category">Categoría Principal *</label>
                                    <select id="category" name="category" required>
                                        <?php $current_cat = $product['category'] ?? ''; ?>
                                        <option value="men" <?php echo $current_cat === 'men' ? 'selected' : ''; ?>>Hombre</option>
                                        <option value="women" <?php echo $current_cat === 'women' ? 'selected' : ''; ?>>Mujer</option>
                                        <option value="accessories" <?php echo $current_cat === 'accessories' ? 'selected' : ''; ?>>Accesorios</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="subcategory">Subcategoría</label>
                                    <input type="text" id="subcategory" name="subcategory" value="<?php echo $product['subcategory'] ?? ''; ?>">
                                </div>
                                <div class="form-group">
                                    <label for="stock_quantity">Cantidad en Stock *</label>
                                    <input type="number" id="stock_quantity" name="stock_quantity" value="<?php echo $product['stock_quantity'] ?? 0; ?>" min="0" required>
                                </div>
                                <div class="form-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="featured" <?php echo isset($product['featured']) && $product['featured'] ? 'checked' : ''; ?>>
                                        <span class="checkmark"></span>
                                        Marcar como Destacado
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h3>Imágenes</h3>
                            <?php if ($action === 'edit' && !empty($product['image_url'])): ?>
                                <div class="form-group">
                                    <label>Imagen Actual</label>
                                    <img src="<?php echo '../' . $product['image_url']; ?>" style="max-width: 150px; height: auto; border-radius: 4px;">
                                    <input type="hidden" name="image_url" value="<?php echo $product['image_url']; ?>">
                                </div>
                            <?php else: ?>
                                <input type="hidden" name="image_url" value="<?php echo $product['image_url'] ?? ''; ?>">
                            <?php endif; ?>
                            <div class="form-group">
                                <label for="image_file">Subir Nueva Imagen</label>
                                <input type="file" id="image_file" name="image_file" accept="image/*">
                                <small>Para la subida real de la imagen, debe implementar el procesamiento en PHP.</small>
                            </div>
                        </div>


                        <div class="admin-actions mt-3">
                            <button type="submit" class="btn btn--primary">
                                <i class="fas fa-save"></i>
                                <?php echo $action === 'new' ? 'Guardar Producto' : 'Actualizar Producto'; ?>
                            </button>
                            <a href="products.php" class="btn btn--secondary">
                                <i class="fas fa-times"></i>
                                Cancelar
                            </a>
                        </div>
                    </form>
                </div>
                <?php endif; ?>

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
    <script src="../assets/js/admin.js"></script>
</body>
</html>
