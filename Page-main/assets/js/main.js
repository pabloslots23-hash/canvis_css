// VOURNE E-commerce Application - Enhanced Version
class VourneApp {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('vourne-cart')) || [];
        this.products = [];
        this.user = this.getUserData();
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.renderFeaturedProducts();
        this.updateCart();
        this.setupEventListeners();
        this.setupScrollEffects();
        this.setupServiceWorker();
        this.setupAnalytics();
    }

    async loadProducts() {
        try {
            // Try to load from API first
            const response = await fetch('/api/products');
            if (response.ok) {
                this.products = await response.json();
            } else {
                throw new Error('API not available');
            }
        } catch (error) {
            console.log('Using sample products:', error.message);
            this.products = this.getSampleProducts();
        }
    }

    getSampleProducts() {
        return [
            {
                id: 1,
                name: "Parka Técnica",
                price: 129.00,
                image: "assets/images/products/parka-tecnica.jpg",
                category: "men",
                description: "Parka técnica de alta calidad con protección contra el viento y agua.",
                featured: true,
                inStock: true,
                sizes: ["S", "M", "L", "XL"],
                colors: ["Negro", "Verde Militar", "Azul Marino"]
            },
            {
                id: 2,
                name: "Jersey Oversize",
                price: 59.90,
                image: "assets/images/products/jersey-oversize.jpg",
                category: "women", 
                description: "Jersey oversize cómodo y elegante para el día a día.",
                featured: true,
                inStock: true,
                sizes: ["XS", "S", "M", "L"],
                colors: ["Beige", "Negro", "Blanco"]
            },
            {
                id: 3,
                name: "Jeans Flare", 
                price: 59.99,
                image: "assets/images/products/jeans-flare.jpg",
                category: "men",
                description: "Jeans flare con corte moderno y ajuste perfecto.",
                featured: true,
                inStock: true,
                sizes: ["28", "30", "32", "34", "36"],
                colors: ["Azul Claro", "Azul Oscuro", "Negro"]
            },
            {
                id: 4,
                name: "Chaqueta Mixta",
                price: 89.00,
                image: "assets/images/products/chaqueta-mixta.jpg", 
                category: "women",
                description: "Chaqueta mixta versátil para diferentes ocasiones.",
                featured: true,
                inStock: true,
                sizes: ["S", "M", "L", "XL"],
                colors: ["Negro", "Camel", "Gris"]
            }
        ];
    }

    getUserData() {
        return JSON.parse(localStorage.getItem('vourne-user')) || {
            sessionId: this.generateSessionId(),
            firstVisit: new Date().toISOString(),
            preferences: {}
        };
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    saveUserData() {
        localStorage.setItem('vourne-user', JSON.stringify(this.user));
    }

    renderFeaturedProducts() {
        const grid = document.getElementById('featuredGrid');
        if (!grid) return;

        const featuredProducts = this.products.filter(product => product.featured);
        
        if (featuredProducts.length === 0) {
            grid.innerHTML = `
                <div class="no-products">
                    <i class="far fa-tshirt"></i>
                    <h3>Próximamente</h3>
                    <p>Estamos preparando nuevos productos destacados</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = featuredProducts.map(product => `
            <div class="product-card animate-fade-in-up" data-product-id="${product.id}">
                <div class="product-badges">
                    ${product.featured ? '<span class="badge featured">Destacado</span>' : ''}
                    ${!product.inStock ? '<span class="badge out-of-stock">Agotado</span>' : ''}
                </div>
                <img src="${product.image}" alt="${product.name}" class="product-card__image" loading="lazy">
                <div class="product-card__content">
                    <h3 class="product-card__name">${product.name}</h3>
                    <p class="product-card__price">${product.price.toFixed(2)} €</p>
                    <p class="product-card__description">${product.description}</p>
                    <div class="product-card__actions">
                        <button class="btn btn--primary add-to-cart" data-id="${product.id}" 
                                ${!product.inStock ? 'disabled' : ''}>
                            ${!product.inStock ? 'Agotado' : 'Añadir al Carrito'}
                        </button>
                        <button class="btn btn--secondary view-details" data-id="${product.id}">
                            Ver Detalles
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        this.setupProductInteractions();
    }

    setupProductInteractions() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.id);
                this.addToCart(productId);
                this.trackEvent('add_to_cart', { product_id: productId });
            });
        });

        // View details buttons
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.id);
                this.viewProductDetails(productId);
                this.trackEvent('view_product', { product_id: productId });
            });
        });

        // Quick view on product card click
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.product-card__actions')) {
                    const productId = parseInt(card.dataset.productId);
                    this.quickViewProduct(productId);
                }
            });
        });
    }

    quickViewProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Create quick view modal
        const modal = this.createQuickViewModal(product);
        document.body.appendChild(modal);
        
        // Animate in
        setTimeout(() => modal.classList.add('active'), 10);
        
        this.trackEvent('quick_view', { product_id: productId });
    }

    createQuickViewModal(product) {
        const modal = document.createElement('div');
        modal.className = 'quick-view-modal';
        modal.innerHTML = `
            <div class="quick-view-overlay"></div>
            <div class="quick-view-content">
                <button class="quick-view-close">&times;</button>
                <div class="quick-view-grid">
                    <div class="quick-view-image">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                    </div>
                    <div class="quick-view-details">
                        <h2>${product.name}</h2>
                        <p class="price">${product.price.toFixed(2)} €</p>
                        <p class="description">${product.description}</p>
                        
                        ${product.sizes ? `
                        <div class="size-selector">
                            <label>Talla:</label>
                            <div class="sizes">
                                ${product.sizes.map(size => `
                                    <button class="size-option" data-size="${size}">${size}</button>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                        
                        ${product.colors ? `
                        <div class="color-selector">
                            <label>Color:</label>
                            <div class="colors">
                                ${product.colors.map(color => `
                                    <button class="color-option" data-color="${color}" 
                                            style="background-color: ${this.getColorValue(color)}"
                                            title="${color}">
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                        
                        <div class="quick-view-actions">
                            <button class="btn btn--primary add-to-cart-quick" data-id="${product.id}">
                                Añadir al Carrito
                            </button>
                            <button class="btn btn--secondary view-full-details" data-id="${product.id}">
                                Ver Detalles Completos
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        modal.querySelector('.quick-view-overlay').addEventListener('click', () => this.closeQuickView(modal));
        modal.querySelector('.quick-view-close').addEventListener('click', () => this.closeQuickView(modal));
        modal.querySelector('.add-to-cart-quick').addEventListener('click', () => {
            this.addToCart(product.id);
            this.closeQuickView(modal);
        });
        modal.querySelector('.view-full-details').addEventListener('click', () => {
            this.viewProductDetails(product.id);
            this.closeQuickView(modal);
        });

        // Size and color selection
        modal.querySelectorAll('.size-option').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });

        modal.querySelectorAll('.color-option').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });

        return modal;
    }

    closeQuickView(modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }

    getColorValue(colorName) {
        const colors = {
            'Negro': '#000000',
            'Blanco': '#ffffff', 
            'Beige': '#f5f5dc',
            'Gris': '#808080',
            'Camel': '#c19a6b',
            'Azul Marino': '#000080',
            'Azul Claro': '#add8e6',
            'Azul Oscuro': '#00008b',
            'Verde Militar': '#78866b'
        };
        return colors[colorName] || '#cccccc';
    }

    addToCart(productId, quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        if (!product.inStock) {
            this.showNotification('Producto agotado', 'error');
            return;
        }

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }

        this.saveCart();
        this.updateCart();
        
        // Animation feedback
        this.animateAddToCart(productId);
    }

    animateAddToCart(productId) {
        const button = document.querySelector(`[data-id="${productId}"]`);
        if (!button) return;

        const originalText = button.textContent;
        button.textContent = '✓ Añadido';
        button.style.background = 'var(--success)';
        button.style.borderColor = 'var(--success)';
        
        // Create flying animation
        this.createFlyingAnimation(productId);
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.style.borderColor = '';
        }, 2000);
    }

    createFlyingAnimation(productId) {
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        const cartIcon = document.querySelector('.cart-dropdown__toggle');
        
        if (!productCard || !cartIcon) return;

        const productRect = productCard.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();

        const flyingElement = document.createElement('div');
        flyingElement.className = 'flying-product';
        flyingElement.style.cssText = `
            position: fixed;
            width: 40px;
            height: 40px;
            background: var(--accent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            left: ${productRect.left + productRect.width / 2 - 20}px;
            top: ${productRect.top + productRect.height / 2 - 20}px;
        `;

        document.body.appendChild(flyingElement);

        // Animate to cart
        flyingElement.animate([
            { 
                transform: 'translate(0, 0) scale(1)',
                opacity: 1
            },
            { 
                transform: `translate(${cartRect.left - productRect.left}px, ${cartRect.top - productRect.top}px) scale(0.5)`,
                opacity: 0
            }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }).onfinish = () => {
            flyingElement.remove();
        };
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCart();
        this.trackEvent('remove_from_cart', { product_id: productId });
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCart();
                this.trackEvent('update_quantity', { product_id: productId, quantity: quantity });
            }
        }
    }

    saveCart() {
        localStorage.setItem('vourne-cart', JSON.stringify(this.cart));
        
        // Update user data with cart info
        this.user.lastCartUpdate = new Date().toISOString();
        this.user.cartItemsCount = this.cart.reduce((total, item) => total + item.quantity, 0);
        this.saveUserData();
    }

    updateCart() {
        // Update cart count
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(element => {
            element.textContent = count;
            element.classList.toggle('pulse', count > 0);
        });

        // Update cart modal
        this.renderCartItems();
    }

    renderCartItems() {
        const container = document.getElementById('cartItems');
        const viewCartBtn = document.getElementById('viewCartBtn');
        const cartTotal = document.getElementById('cartTotal');

        if (!container) return;

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <i class="far fa-shopping-bag"></i>
                    <h4>Tu carrito está vacío</h4>
                    <p>Agrega algunos productos para continuar</p>
                </div>
            `;
            if (viewCartBtn) viewCartBtn.style.display = 'none';
            if (cartTotal) cartTotal.textContent = '0,00 €';
            return;
        }

        container.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item__image" loading="lazy">
                <div class="cart-item__details">
                    <h4 class="cart-item__title">${item.name}</h4>
                    <p class="cart-item__price">${item.price.toFixed(2)} €</p>
                    <div class="cart-item__actions">
                        <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                        <span class="cart-item__quantity">${item.quantity}</span>
                        <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                        <button class="cart-item__remove" data-id="${item.id}">
                            <i class="far fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Calculate total
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotal) cartTotal.textContent = `${total.toFixed(2)} €`;
        if (viewCartBtn) viewCartBtn.style.display = 'block';

        // Add event listeners to cart items
        this.setupCartInteractions();
    }

    setupCartInteractions() {
        // Quantity buttons
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.id);
                const action = e.target.dataset.action;
                
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    if (action === 'increase') {
                        this.updateQuantity(productId, item.quantity + 1);
                    } else if (action === 'decrease') {
                        this.updateQuantity(productId, item.quantity - 1);
                    }
                }
            });
        });

        // Remove buttons
        document.querySelectorAll('.cart-item__remove').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('button').dataset.id);
                this.removeFromCart(productId);
                this.showNotification('Producto eliminado del carrito', 'info');
            });
        });
    }

    viewProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            // In a real app, this would navigate to a product detail page
            this.showProductDetailModal(product);
        }
    }

    showProductDetailModal(product) {
        // Similar to quick view but with more details
        this.showNotification(`Viendo detalles de: ${product.name}`, 'info');
        
        // For demo purposes, show an alert with full details
        const details = `
Detalles del producto:

${product.name}
Precio: ${product.price.toFixed(2)} €

${product.description}

${product.sizes ? `Tallas disponibles: ${product.sizes.join(', ')}` : ''}
${product.colors ? `Colores disponibles: ${product.colors.join(', ')}` : ''}

¿Te interesa este producto? Visita nuestra página de catálogo para más información.
        `;
        
        alert(details);
    }

    setupEventListeners() {
        // Cart toggle
        const cartToggle = document.getElementById('cartToggle');
        if (cartToggle) {
            cartToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCart();
                this.trackEvent('toggle_cart');
            });
        }

        // Cart close
        const cartClose = document.getElementById('cartClose');
        if (cartClose) {
            cartClose.addEventListener('click', () => {
                this.toggleCart();
            });
        }

        // Overlay close
        const cartOverlay = document.getElementById('cartOverlay');
        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => {
                this.toggleCart();
            });
        }

        // Continue shopping
        const continueShopping = document.getElementById('continueShopping');
        if (continueShopping) {
            continueShopping.addEventListener('click', () => {
                this.toggleCart();
            });
        }

        // Newsletter form
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSubscription(newsletterForm);
            });
        }

        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Page visibility tracking
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('page_hidden');
            } else {
                this.trackEvent('page_visible');
            }
        });
    }

    handleNewsletterSubscription(form) {
        const email = form.querySelector('input[type="email"]').value;
        
        if (!this.validateEmail(email)) {
            this.showNotification('Por favor, introduce un email válido', 'error');
            return;
        }

        // Simulate subscription
        this.showNotification('¡Gracias por suscribirte! Te hemos enviado un email de confirmación.', 'success');
        
        // Track subscription
        this.trackEvent('newsletter_subscription', { email: email });
        
        form.reset();
        
        // In a real app, you would send this to your server
        console.log('Newsletter subscription:', email);
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    toggleCart() {
        const cartModal = document.getElementById('cartModal');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartModal && cartOverlay) {
            cartModal.classList.toggle('active');
            cartOverlay.classList.toggle('active');
            
            // Prevent body scroll when cart is open
            document.body.style.overflow = cartModal.classList.contains('active') ? 'hidden' : '';
            
            // Track cart toggle
            if (cartModal.classList.contains('active')) {
                this.trackEvent('cart_opened');
            }
        }
    }

    setupScrollEffects() {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateHeader = () => {
            const header = document.getElementById('header');
            if (header) {
                if (window.scrollY > 100) {
                    header.classList.add('scrolled');
                    
                    // Hide header on scroll down, show on scroll up
                    if (window.scrollY > lastScrollY) {
                        header.style.transform = 'translateY(-100%)';
                    } else {
                        header.style.transform = 'translateY(0)';
                    }
                } else {
                    header.classList.remove('scrolled');
                    header.style.transform = 'translateY(0)';
                }
                
                lastScrollY = window.scrollY;
            }
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });

        // Intersection Observer for animations
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    this.trackEvent('element_in_view', { 
                        element: entry.target.tagName,
                        id: entry.target.id || 'no-id'
                    });
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements for animation
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }
    }

    setupAnalytics() {
        // Basic analytics tracking
        this.trackEvent('page_view', {
            page: window.location.pathname,
            referrer: document.referrer
        });

        // Track time on page
        this.pageLoadTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeSpent = Date.now() - this.pageLoadTime;
            this.trackEvent('page_exit', { time_spent: timeSpent });
        });
    }

    trackEvent(eventName, properties = {}) {
        // Simple analytics tracking
        const eventData = {
            event: eventName,
            properties: {
                ...properties,
                session_id: this.user.sessionId,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                user_agent: navigator.userAgent
            }
        };

        console.log('Track event:', eventData);

        // In a real app, send to your analytics service
        // this.sendToAnalytics(eventData);
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success)' : 
                        type === 'error' ? 'var(--error)' : 'var(--primary-dark)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 4px;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            box-shadow: var(--shadow-lg);
        `;

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    closeAllModals() {
        // Close cart modal
        const cartModal = document.getElementById('cartModal');
        const cartOverlay = document.getElementById('cartOverlay');
        if (cartModal && cartModal.classList.contains('active')) {
            this.toggleCart();
        }

        // Close quick view modals
        document.querySelectorAll('.quick-view-modal').forEach(modal => {
            this.closeQuickView(modal);
        });
    }

    // Utility methods
    formatPrice(amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.vourneApp = new VourneApp();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VourneApp;
}