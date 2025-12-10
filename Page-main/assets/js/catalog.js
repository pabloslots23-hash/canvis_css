// Catalog Page Functionality
class CatalogPage {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentCategory = this.getCategoryFromURL();
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupEventListeners();
        this.setupFilters();
    }

    getCategoryFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('category') || 'all';
    }

    async loadProducts() {
        try {
            // In a real implementation, this would fetch from an API
            this.products = this.getSampleProducts();
            this.applyFilters();
        } catch (error) {
            console.error('Error loading products:', error);
            this.showEmptyState();
        }
    }

    getSampleProducts() {
        // Sample products data
        return [
            {
                id: 1,
                name: "Parka Técnica",
                price: 129.00,
                image: "../assets/images/products/parka-tecnica.jpg",
                category: "men",
                subcategory: "jackets",
                description: "Parka técnica de alta calidad con protección contra el viento y agua.",
                featured: true,
                inStock: true
            },
            {
                id: 2,
                name: "Jersey Oversize",
                price: 59.90,
                image: "../assets/images/products/jersey-oversize.jpg",
                category: "women",
                subcategory: "sweaters",
                description: "Jersey oversize cómodo y elegante para el día a día.",
                featured: true,
                inStock: true
            },
            {
                id: 3,
                name: "Jeans Flare",
                price: 59.99,
                image: "../assets/images/products/jeans-flare.jpg",
                category: "men",
                subcategory: "pants",
                description: "Jeans flare con corte moderno y ajuste perfecto.",
                featured: true,
                inStock: true
            },
            {
                id: 4,
                name: "Chaqueta Mixta",
                price: 89.00,
                image: "../assets/images/products/chaqueta-mixta.jpg",
                category: "women",
                subcategory: "jackets",
                description: "Chaqueta mixta versátil para diferentes ocasiones.",
                featured: true,
                inStock: true
            }
        ];
    }

    setupEventListeners() {
        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.value = this.currentCategory;
            categoryFilter.addEventListener('change', (e) => {
                this.handleCategoryFilter(e.target.value);
            });
        }

        // Sort filter
        const sortFilter = document.getElementById('sort-filter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.handleSortFilter(e.target.value);
            });
        }

        // Add to cart buttons will be handled by main.js
    }

    setupFilters() {
        // Initialize filters based on current category
        this.applyFilters();
    }

    handleCategoryFilter(category) {
        this.currentCategory = category;
        this.applyFilters();
        
        // Update URL without page reload
        const url = new URL(window.location);
        if (category === 'all') {
            url.searchParams.delete('category');
        } else {
            url.searchParams.set('category', category);
        }
        window.history.replaceState({}, '', url);
    }

    handleSortFilter(sortBy) {
        this.sortProducts(sortBy);
        this.renderProducts();
    }

    applyFilters() {
        // Filter by category
        if (this.currentCategory === 'all') {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product => 
                product.category === this.currentCategory
            );
        }

        // Apply initial sort
        this.sortProducts('newest');
        this.renderProducts();
    }

    sortProducts(sortBy) {
        switch (sortBy) {
            case 'price-low':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
            default:
                // Keep original order (newest first based on sample data)
                break;
        }
    }

    renderProducts() {
        const grid = document.getElementById('catalogGrid');
        const emptyState = document.getElementById('catalogEmpty');

        if (!grid) return;

        if (this.filteredProducts.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.classList.add('active');
            return;
        }

        if (emptyState) emptyState.classList.remove('active');

        grid.innerHTML = this.filteredProducts.map(product => `
            <div class="product-card animate-fade-in-up">
                <div class="category-badge">
                    ${product.category === 'men' ? 'Hombre' : 
                      product.category === 'women' ? 'Mujer' : 'Accesorios'}
                </div>
                <img src="${product.image}" alt="${product.name}" class="product-card__image">
                <div class="product-card__content">
                    <h3 class="product-card__name">${product.name}</h3>
                    <p class="product-card__price">${product.price.toFixed(2)} €</p>
                    <div class="product-card__actions">
                        <button class="btn btn--primary add-to-cart" data-id="${product.id}">
                            Añadir al Carrito
                        </button>
                        <button class="btn btn--secondary view-details" data-id="${product.id}">
                            Ver Detalles
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Re-attach event listeners for the new buttons
        this.setupProductInteractions();
    }

    setupProductInteractions() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.id);
                this.addToCart(productId);
            });
        });

        // View details buttons
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.id);
                this.viewProductDetails(productId);
            });
        });
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Use the main app's cart functionality if available
        if (window.vourneApp) {
            window.vourneApp.addToCart(productId);
        } else {
            // Fallback cart functionality
            this.showNotification('Producto añadido al carrito', 'success');
            
            // Update cart count
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                const currentCount = parseInt(cartCount.textContent) || 0;
                cartCount.textContent = currentCount + 1;
            }
        }
    }

    viewProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            // In a real app, this would navigate to a product detail page
            // For now, show a modal or alert with product details
            this.showProductModal(product);
        }
    }

    showProductModal(product) {
        // Create modal HTML
        const modalHTML = `
            <div class="product-modal-overlay">
                <div class="product-modal">
                    <button class="modal-close">&times;</button>
                    <div class="modal-content">
                        <div class="modal-image">
                            <img src="${product.image}" alt="${product.name}">
                        </div>
                        <div class="modal-details">
                            <h2>${product.name}</h2>
                            <p class="modal-price">${product.price.toFixed(2)} €</p>
                            <p class="modal-description">${product.description}</p>
                            <div class="modal-actions">
                                <button class="btn btn--primary add-to-cart-modal" data-id="${product.id}">
                                    Añadir al Carrito
                                </button>
                                <button class="btn btn--secondary close-modal">
                                    Seguir Viendo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add modal styles if not already present
        this.addModalStyles();

        // Setup modal event listeners
        this.setupModalEvents(product.id);
    }

    addModalStyles() {
        if (document.getElementById('product-modal-styles')) return;

        const styles = `
            <style id="product-modal-styles">
                .product-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    padding: 2rem;
                }
                
                .product-modal {
                    background: white;
                    border-radius: 12px;
                    max-width: 800px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                    animation: modalSlideIn 0.3s ease-out;
                }
                
                .modal-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    font-size: 2rem;
                    cursor: pointer;
                    color: var(--text-light);
                    z-index: 2;
                }
                
                .modal-close:hover {
                    color: var(--text-dark);
                }
                
                .modal-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0;
                }
                
                .modal-image img {
                    width: 100%;
                    height: 400px;
                    object-fit: cover;
                    border-radius: 12px 0 0 12px;
                }
                
                .modal-details {
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                
                .modal-details h2 {
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                }
                
                .modal-price {
                    font-size: 1.25rem;
                    color: var(--accent);
                    font-weight: 500;
                    margin-bottom: 1rem;
                }
                
                .modal-description {
                    color: var(--text-light);
                    line-height: 1.6;
                    margin-bottom: 2rem;
                }
                
                .modal-actions {
                    display: flex;
                    gap: 1rem;
                }
                
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-50px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                @media (max-width: 768px) {
                    .modal-content {
                        grid-template-columns: 1fr;
                    }
                    
                    .modal-image img {
                        border-radius: 12px 12px 0 0;
                        height: 300px;
                    }
                    
                    .modal-actions {
                        flex-direction: column;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    setupModalEvents(productId) {
        // Close modal events
        const closeBtn = document.querySelector('.modal-close');
        const overlay = document.querySelector('.product-modal-overlay');
        const closeModalBtn = document.querySelector('.close-modal');

        const closeModal = () => {
            document.querySelector('.product-modal-overlay')?.remove();
        };

        closeBtn?.addEventListener('click', closeModal);
        overlay?.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        closeModalBtn?.addEventListener('click', closeModal);

        // Add to cart from modal
        const addToCartBtn = document.querySelector('.add-to-cart-modal');
        addToCartBtn?.addEventListener('click', () => {
            this.addToCart(productId);
            closeModal();
        });
    }

    showEmptyState() {
        const grid = document.getElementById('catalogGrid');
        const emptyState = document.getElementById('catalogEmpty');
        
        if (grid) grid.innerHTML = '';
        if (emptyState) emptyState.classList.add('active');
    }

    showNotification(message, type = 'info') {
        // Reuse the notification system from main.js or create a simple one
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
        `;

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    }
}

// Initialize catalog when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.catalogPage = new CatalogPage();
});