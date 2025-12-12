// STR4WRLD / VOURNE ENGINE v2.1
// Logic: Catalog, Cart, Animations & Persistence

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. DATOS ---
    const products = [
        { id: 1, name: "PARKA TÉCNICA V1", price: 129.00, image: "assets/images/products/parka-tecnica.jpg", category: "jackets", section: "men" },
        { id: 2, name: "JERSEY OVERSIZE DISTRESSED", price: 59.90, image: "assets/images/products/jersey-oversize.jpg", category: "sweaters", section: "women" },
        { id: 3, name: "JEANS FLARE BLACK", price: 59.99, image: "assets/images/products/jeans-flare.jpg", category: "pants", section: "men" },
        { id: 4, name: "CHAQUETA MIXTA HYBRID", price: 89.00, image: "assets/images/products/chaqueta-mixta.jpg", category: "jackets", section: "women" },
        { id: 5, name: "HOODIE NO-RULES", price: 79.00, image: "assets/images/products/sudadera-capucha.jpg", category: "sweaters", section: "men" },
        { id: 6, name: "VESTIDO MIDI NIGHT", price: 65.00, image: "assets/images/products/vestido-midi.jpg", category: "dresses", section: "women" }
    ];

    let cart = JSON.parse(localStorage.getItem('vourne_cart')) || [];

    // Elementos DOM
    const catalogGrid = document.getElementById('catalogGrid');
    const featuredGrid = document.getElementById('featuredGrid');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalEl = document.querySelector('.cart-subtotal');
    const cartCountEls = document.querySelectorAll('.cart-count');

    // --- 2. SMOOTH SCROLL (JS Fallback) ---
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

    // --- 3. FUNCIONES CARRITO ---
    function updateCartUI() {
        localStorage.setItem('vourne_cart', JSON.stringify(cart));
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

        cartCountEls.forEach(el => el.innerText = totalQty);

        if (cartItemsContainer) {
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<div class="empty-msg">CARRITO VACÍO</div>';
                if(cartTotalEl) cartTotalEl.innerText = '0.00 €';
            } else {
                cartItemsContainer.innerHTML = cart.map(item => `
                    <div class="cart-item animate-fade-in">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80/111/555'">
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span>${item.qty} x ${item.price.toFixed(2)} €</span>
                                <button class="cart-item-remove" data-id="${item.id}">X</button>
                            </div>
                        </div>
                    </div>
                `).join('');
                if(cartTotalEl) cartTotalEl.innerText = totalPrice.toFixed(2) + ' €';
            }
        }
    }

    function toggleCart(show) {
        if (show) {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('active');
        } else {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('active');
        }
    }

    function addToCart(id) {
        const product = products.find(p => p.id === id);
        if (!product) return;
        const existing = cart.find(item => item.id === id);
        if (existing) existing.qty++;
        else cart.push({ ...product, qty: 1 });
        updateCartUI();
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
    }

    // --- 4. ANIMACIÓN DE VUELO ---
    function animateFlyToCart(btn) {
        const card = btn.closest('.product-card');
        const img = card.querySelector('img');
        const cartIcon = document.querySelector('.nav__right .cart-toggle');
        
        if (!img || !cartIcon) return;

        const flyImg = img.cloneNode();
        flyImg.classList.add('flying-img');
        
        const start = img.getBoundingClientRect();
        const end = cartIcon.getBoundingClientRect();

        flyImg.style.left = start.left + 'px';
        flyImg.style.top = start.top + 'px';
        flyImg.style.width = start.width + 'px';
        flyImg.style.height = start.height + 'px';

        document.body.appendChild(flyImg);

        // Forzar reflow
        void flyImg.offsetWidth;

        flyImg.style.left = (end.left + 5) + 'px';
        flyImg.style.top = (end.top + 5) + 'px';
        flyImg.style.width = '20px';
        flyImg.style.height = '20px';
        flyImg.style.opacity = '0';

        setTimeout(() => {
            flyImg.remove();
            cartIcon.classList.add('bump');
            setTimeout(() => cartIcon.classList.remove('bump'), 300);
            toggleCart(true); // Abrir carrito al terminar
        }, 800);
    }

    // --- 5. RENDER ---
    const renderCard = (product) => `
        <div class="product-card animate-fade-in">
            <div class="product-badges"><span class="badge">${product.section}</span></div>
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}" class="product-card__image" 
                     onerror="this.src='https://via.placeholder.com/400x500/111/555?text=VOURNE'">
            </div>
            <div class="product-card__content">
                <h3 class="product-card__name">${product.name}</h3>
                <p class="product-card__price">${product.price.toFixed(2)} €</p>
                <button class="btn btn--primary btn--full add-to-cart-btn" data-id="${product.id}">
                    AÑADIR
                </button>
            </div>
        </div>
    `;

    if (featuredGrid) featuredGrid.innerHTML = products.slice(0, 4).map(renderCard).join('');
    
    if (catalogGrid) {
        const renderCatalog = (filter = 'all') => {
            const filtered = filter === 'all' ? products : products.filter(p => p.section === filter || p.category === filter);
            catalogGrid.innerHTML = filtered.length ? filtered.map(renderCard).join('') : '<p>NO HAY STOCK.</p>';
        };
        renderCatalog();
        document.getElementById('category-filter')?.addEventListener('change', (e) => renderCatalog(e.target.value));
    }

    // --- 6. EVENTOS GLOBALES ---
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const id = parseInt(e.target.dataset.id);
            addToCart(id);
            animateFlyToCart(e.target);
        }
        if (e.target.classList.contains('cart-item-remove')) {
            removeFromCart(parseInt(e.target.dataset.id));
        }
    });

    document.querySelectorAll('.cart-toggle').forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); toggleCart(true); }));
    document.querySelector('.close-cart')?.addEventListener('click', () => toggleCart(false));
    cartOverlay?.addEventListener('click', () => toggleCart(false));

    updateCartUI();
});
