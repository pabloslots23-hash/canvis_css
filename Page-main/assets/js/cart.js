/**
 * Vourne Store - Shopping Cart Management
 * Gestión completa del carrito de compras
 */

class ShoppingCart {
    constructor() {
        this.cart = this.loadCart();
        this.init();
    }

    init() {
        this.updateCartUI();
        this.setupEventListeners();
        console.log('Carrito inicializado:', this.cart);
    }

    // Cargar carrito desde localStorage
    loadCart() {
        try {
            const savedCart = localStorage.getItem('vourneo_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    }

    // Guardar carrito en localStorage
    saveCart() {
        try {
            localStorage.setItem('vourneo_cart', JSON.stringify(this.cart));
            this.updateCartUI();
            this.dispatchCartUpdate();
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    // Disparar evento de actualización del carrito
    dispatchCartUpdate() {
        const event = new CustomEvent('cartUpdated', {
            detail: { itemCount: this.getItemCount() }
        });
        document.dispatchEvent(event);
    }

    // Agregar producto al carrito
    addProduct(product) {
        // Validar producto
        if (!this.validateProduct(product)) {
            this.showError('Producto inválido');
            return false;
        }

        const existingItem = this.findCartItem(product);

        if (existingItem) {
            existingItem.quantity += product.quantity;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                image: product.image,
                size: product.size || 'Única',
                color: product.color || 'Estándar',
                quantity: parseInt(product.quantity) || 1,
                sku: product.sku,
                category: product.category
            });
        }

        this.saveCart();
        this.showAddToCartMessage(product.name);
        return true;
    }

    // Buscar item en el carrito
    findCartItem(product) {
        return this.cart.find(item => 
            item.id === product.id && 
            item.size === (product.size || 'Única') && 
            item.color === (product.color || 'Estándar')
        );
    }

    // Validar producto
    validateProduct(product) {
        return product.id && product.name && product.price && product.image;
    }

    // Eliminar producto del carrito
    removeProduct(productId, size = 'Única', color = 'Estándar') {
        this.cart = this.cart.filter(item => 
            !(item.id === productId && item.size === size && item.color === color)
        );
        this.saveCart();
        this.showMessage('Producto eliminado del carrito');
    }

    // Actualizar cantidad
    updateQuantity(productId, size = 'Única', color = 'Estándar', newQuantity) {
        const item = this.cart.find(item => 
            item.id === productId && item.size === size && item.color === color
        );

        if (item) {
            if (newQuantity <= 0) {
                this.removeProduct(productId, size, color);
            } else {
                item.quantity = parseInt(newQuantity);
                this.saveCart();
            }
        }
    }

    // Calcular subtotal
    calculateSubtotal() {
        return this.cart.reduce((total, item) => {
            return total + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0);
    }

    // Calcular total con envío e impuestos
    calculateTotal(shippingCost = 0, taxRate = 0.21) {
        const subtotal = this.calculateSubtotal();
        const tax = subtotal * taxRate;
        return {
            subtotal: subtotal,
            tax: tax,
            shipping: shippingCost,
            total: subtotal + tax + shippingCost
        };
    }

    // Obtener número de items
    getItemCount() {
        return this.cart.reduce((total, item) => total + parseInt(item.quantity), 0);
    }

    // Actualizar UI del carrito
    updateCartUI() {
        this.updateCartCounter();
        this.updateCartSidebar();
        this.updateCartPage();
    }

    // Actualizar contador del carrito
    updateCartCounter() {
        const cartCounters = document.querySelectorAll('.cart-count, .cart-counter');
        const itemCount = this.getItemCount();
        
        cartCounters.forEach(counter => {
            counter.textContent = itemCount;
            counter.style.display = itemCount > 0 ? 'flex' : 'none';
        });
    }

    // Actualizar sidebar del carrito
    updateCartSidebar() {
        const sidebar = document.querySelector('.cart-sidebar');
        if (!sidebar) return;

        const itemsContainer = sidebar.querySelector('.cart-items');
        const subtotalElement = sidebar.querySelector('.cart-subtotal');
        const emptyCart = sidebar.querySelector('.empty-cart');
        const cartContent = sidebar.querySelector('.cart-content');

        if (this.cart.length === 0) {
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartContent) cartContent.style.display = 'none';
            return;
        }

        if (emptyCart) emptyCart.style.display = 'none';
        if (cartContent) cartContent.style.display = 'block';

        if (itemsContainer) {
            this.renderCartItems(itemsContainer);
        }

        if (subtotalElement) {
            subtotalElement.textContent = `€${this.calculateSubtotal().toFixed(2)}`;
        }
    }

    // Actualizar página del carrito
    updateCartPage() {
        // Solo ejecutar en página del carrito
        if (!document.querySelector('.cart-page')) return;

        const itemsContainer = document.querySelector('.cart-items-container');
        const summaryElement = document.querySelector('.cart-summary');
        const emptyCart = document.querySelector('.cart-empty');
        const cartContent = document.querySelector('.cart-content');

        if (this.cart.length === 0) {
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartContent) cartContent.style.display = 'none';
            return;
        }

        if (emptyCart) emptyCart.style.display = 'none';
        if (cartContent) cartContent.style.display = 'block';

        if (itemsContainer) {
            this.renderCartItems(itemsContainer);
        }

        if (summaryElement) {
            this.updateCartSummary(summaryElement);
        }
    }

    // Renderizar items del carrito
    renderCartItems(container) {
        if (this.cart.length === 0) {
            container.innerHTML = this.getEmptyCartHTML();
            return;
        }

        container.innerHTML = this.cart.map(item => this.getCartItemHTML(item)).join('');
        this.attachItemEvents(container);
    }

    // HTML para carrito vacío
    getEmptyCartHTML() {
        return `
            <div class="empty-cart">
                <div class="empty-cart-icon">
                    <i class="fas fa-shopping-bag"></i>
                </div>
                <h3>Tu carrito está vacío</h3>
                <p>Descubre nuestras últimas prendas</p>
                <a href="/catalog/all.html" class="btn btn-primary">
                    <i class="fas fa-arrow-right"></i>
                    Seguir comprando
                </a>
            </div>
        `;
    }

    // HTML para item del carrito
    getCartItemHTML(item) {
        return `
            <div class="cart-item" data-id="${item.id}" data-size="${item.size}" data-color="${item.color}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                    <button class="remove-item-mobile" onclick="cart.removeProduct('${item.id}', '${item.size}', '${item.color}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="cart-item-details">
                    <h4 class="item-name">${item.name}</h4>
                    <div class="item-variants">
                        <span class="variant">Talla: ${item.size}</span>
                        <span class="variant">Color: ${item.color}</span>
                        ${item.sku ? `<span class="variant">SKU: ${item.sku}</span>` : ''}
                    </div>
                    <p class="item-price">€${parseFloat(item.price).toFixed(2)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" aria-label="Reducir cantidad">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" aria-label="Aumentar cantidad">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="cart-item-total">
                    €${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}
                </div>
                <button class="remove-item" onclick="cart.removeProduct('${item.id}', '${item.size}', '${item.color}')" aria-label="Eliminar producto">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }

    // Adjuntar eventos a los items
    attachItemEvents(container) {
        container.querySelectorAll('.cart-item').forEach(itemElement => {
            const minusBtn = itemElement.querySelector('.minus');
            const plusBtn = itemElement.querySelector('.plus');
            const itemData = itemElement.dataset;

            minusBtn.addEventListener('click', () => {
                const currentQty = parseInt(itemElement.querySelector('.quantity').textContent);
                this.updateQuantity(itemData.id, itemData.size, itemData.color, currentQty - 1);
            });

            plusBtn.addEventListener('click', () => {
                const currentQty = parseInt(itemElement.querySelector('.quantity').textContent);
                this.updateQuantity(itemData.id, itemData.size, itemData.color, currentQty + 1);
            });
        });
    }

    // Actualizar resumen del carrito
    updateCartSummary(container) {
        const totals = this.calculateTotal(4.95, 0.21); // Envío estándar e IVA
        
        container.innerHTML = `
            <div class="summary-section">
                <h3>Resumen del pedido</h3>
                <div class="summary-line">
                    <span>Subtotal (${this.getItemCount()} productos)</span>
                    <span>€${totals.subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-line">
                    <span>Envío</span>
                    <span>€${totals.shipping.toFixed(2)}</span>
                </div>
                <div class="summary-line">
                    <span>IVA (21%)</span>
                    <span>€${totals.tax.toFixed(2)}</span>
                </div>
                <div class="summary-total">
                    <span>Total</span>
                    <span>€${totals.total.toFixed(2)}</span>
                </div>
                <a href="/checkout.html" class="btn btn-primary btn-checkout">
                    <i class="fas fa-lock"></i>
                    Proceder al pago
                </a>
                <a href="/catalog/all.html" class="btn btn-secondary">
                    Seguir comprando
                </a>
            </div>
        `;
    }

    // Configurar event listeners
    setupEventListeners() {
        // Botones "Añadir al carrito"
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                const button = e.target.closest('.add-to-cart-btn');
                this.handleAddToCart(button);
            }
        });

        // Abrir/cerrar carrito lateral
        this.setupCartSidebar();
    }

    // Manejar añadir al carrito
    handleAddToCart(button) {
        const product = {
            id: button.dataset.productId,
            name: button.dataset.productName,
            price: button.dataset.productPrice,
            image: button.dataset.productImage,
            size: button.dataset.productSize || 'Única',
            color: button.dataset.productColor || 'Estándar',
            quantity: parseInt(button.dataset.productQuantity || 1),
            sku: button.dataset.productSku,
            category: button.dataset.productCategory
        };

        if (this.addProduct(product)) {
            // Abrir sidebar del carrito después de añadir
            this.openCartSidebar();
        }
    }

    // Configurar sidebar del carrito
    setupCartSidebar() {
        const cartToggle = document.querySelector('.cart-toggle');
        const cartSidebar = document.querySelector('.cart-sidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
        const closeCart = document.querySelector('.close-cart');

        if (cartToggle && cartSidebar) {
            cartToggle.addEventListener('click', () => this.openCartSidebar());
            closeCart?.addEventListener('click', () => this.closeCartSidebar());
            cartOverlay?.addEventListener('click', () => this.closeCartSidebar());
        }
    }

    // Abrir sidebar del carrito
    openCartSidebar() {
        const cartSidebar = document.querySelector('.cart-sidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
        
        if (cartSidebar) {
            cartSidebar.classList.add('open');
            if (cartOverlay) cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // Cerrar sidebar del carrito
    closeCartSidebar() {
        const cartSidebar = document.querySelector('.cart-sidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
        
        if (cartSidebar) {
            cartSidebar.classList.remove('open');
            if (cartOverlay) cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Mostrar mensaje de producto añadido
    showAddToCartMessage(productName) {
        this.showMessage(`✓ ${productName} añadido al carrito`, 'success');
    }

    // Mostrar mensaje genérico
    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `notification notification-${type}`;
        messageEl.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(messageEl);

        setTimeout(() => messageEl.classList.add('show'), 100);
        setTimeout(() => {
            messageEl.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(messageEl)) {
                    document.body.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }

    // Mostrar error
    showError(message) {
        this.showMessage(message, 'error');
    }

    // Vaciar carrito
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.showMessage('Carrito vaciado');
    }

    // Obtener resumen para checkout
    getCheckoutSummary() {
        return {
            items: this.cart,
            subtotal: this.calculateSubtotal(),
            itemCount: this.getItemCount(),
            totals: this.calculateTotal(4.95, 0.21)
        };
    }

    // Verificar si el carrito está vacío
    isEmpty() {
        return this.cart.length === 0;
    }

    // Obtener todos los items
    getItems() {
        return [...this.cart];
    }
}

// Inicializar carrito global
let cart;

document.addEventListener('DOMContentLoaded', function() {
    cart = new ShoppingCart();
    
    // Hacer disponible globalmente
    window.cart = cart;

    // Prevenir envío de formulario en checkout si el carrito está vacío
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            if (cart.isEmpty()) {
                e.preventDefault();
                cart.showError('Tu carrito está vacío');
                setTimeout(() => {
                    window.location.href = '/cart.html';
                }, 2000);
            }
        });
    }
});

// Manejar cambios de página SPA (si aplica)
document.addEventListener('pageChanged', function() {
    if (cart) {
        cart.updateCartUI();
    }
});