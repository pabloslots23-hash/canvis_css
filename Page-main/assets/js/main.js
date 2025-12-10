// STR4WRLD / VOURNE ENGINE v2.0
// Logic: Catalog, Cart, Animations & Persistence

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CONFIGURACIÓN Y DATOS (Simulando Base de Datos) ---
    const products = [
        { id: 1, name: "PARKA TÉCNICA V1", price: 129.00, image: "assets/images/products/parka-tecnica.jpg", category: "jackets", section: "men" },
        { id: 2, name: "JERSEY OVERSIZE DISTRESSED", price: 59.90, image: "assets/images/products/jersey-oversize.jpg", category: "sweaters", section: "women" },
        { id: 3, name: "JEANS FLARE BLACK", price: 59.99, image: "assets/images/products/jeans-flare.jpg", category: "pants", section: "men" },
        { id: 4, name: "CHAQUETA MIXTA HYBRID", price: 89.00, image: "assets/images/products/chaqueta-mixta.jpg", category: "jackets", section: "women" },
        { id: 5, name: "HOODIE NO-RULES", price: 79.00, image: "assets/images/products/sudadera-capucha.jpg", category: "sweaters", section: "men" },
        { id: 6, name: "VESTIDO MIDI NIGHT", price: 65.00, image: "assets/images/products/vestido-midi.jpg", category: "dresses", section: "women" }
    ];

    // Estado del Carrito
    let cart = JSON.parse(localStorage.getItem('vourne_cart')) || [];

    // Elementos del DOM
    const catalogGrid = document.getElementById('catalogGrid');
    const featuredGrid = document.getElementById('featuredGrid');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalEl = document.querySelector('.cart-subtotal');
    const cartCountEl = document.querySelectorAll('.cart-count'); // Selecciona todos los contadores
    const cartToggleBtns = document.querySelectorAll('.cart-toggle');
    const closeCartBtn = document.querySelector('.close-cart');

    // --- 2. FUNCIONES DEL CARRITO ---

    // Guardar y Actualizar UI
    function updateCartUI() {
        localStorage.setItem('vourne_cart', JSON.stringify(cart));
        
        // Calcular totales
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

        // Actualizar contadores (Header)
        cartCountEl.forEach(el => el.innerText = totalQty);

        // Renderizar Items en el Sidebar
        if (cartItemsContainer) {
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<div class="empty-msg">TU CARRITO ESTÁ VACÍO.<br>EXPLORA EL CATÁLOGO.</div>';
                if (cartTotalEl) cartTotalEl.innerText = '0.00 €';
            } else {
                cartItemsContainer.innerHTML = cart.map(item => `
                    <div class="cart-item animate-fade-in">
                        <div class="cart-item-img">
                            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80/111/555'">
                        </div>
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <div class="cart-qty-row">
                                <span>${item.qty} x ${item.price.toFixed(2)} €</span>
                            </div>
                            <button class="cart-item-remove" data-id="${item.id}">ELIMINAR</button>
                        </div>
                    </div>
                `).join('');
                
                if (cartTotalEl) cartTotalEl.innerText = totalPrice.toFixed(2) + ' €';
            }
        }
    }

    // Abrir/Cerrar Sidebar
    function toggleCart(show) {
        if (show) {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('active');
        } else {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('active');
        }
    }

    // Añadir al Carrito (Lógica)
    function addToCart(id) {
        const product = products.find(p => p.id === id);
        if (!product) return;

        const existing = cart.find(item => item.id === id);
        if (existing) {
            existing.qty++;
        } else {
            cart.push({ ...product, qty: 1 });
        }
        updateCartUI();
    }

    // Eliminar del Carrito
    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
    }

    // --- 3. ANIMACIÓN DE VUELO (EFECTO WOW) ---
    function animateFlyToCart(btn) {
        // 1. Clonar la imagen del producto
        const card = btn.closest('.product-card');
        const img = card.querySelector('img');
        const cartIcon = document.querySelector('.nav__right .cart-toggle'); // Destino

        if (!img || !cartIcon) return;

        const flyImg = img.cloneNode();
        flyImg.classList.add('flying-img');

        // 2. Posición inicial
        const startRect = img.getBoundingClientRect();
        flyImg.style.left = startRect.left + 'px';
        flyImg.style.top = startRect.top + 'px';
        flyImg.style.width = startRect.width + 'px';
        flyImg.style.height = startRect.height + 'px';

        document.body.appendChild(flyImg);

        // 3. Posición final (Carrito)
        const endRect = cartIcon.getBoundingClientRect();
        
        // Forzar reflow para que la animación funcione
        void flyImg.offsetWidth;

        // 4. Animar
        flyImg.style.left = (endRect.left + 10) + 'px';
        flyImg.style.top = (endRect.top + 10) + 'px';
        flyImg.style.width = '30px';
        flyImg.style.height = '30px';
        flyImg.style.opacity = '0.5';

        // 5. Limpiar al terminar
        setTimeout(() => {
            flyImg.remove();
            // Efecto de "rebote" en el icono del carrito
            cartIcon.classList.add('bump');
            setTimeout(() => cartIcon.classList.remove('bump'), 300);
            
            // Abrir el carrito automáticamente tras la animación
            toggleCart(true);
        }, 800); // Coincide con la duración de CSS transition
    }

    // --- 4. RENDERIZADO DE PRODUCTOS ---
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

    // Cargar en Home (Featured)
    if (featuredGrid) {
        featuredGrid.innerHTML = products.slice(0, 4).map(renderCard).join('');
    }

    // Cargar en Catálogo (All)
    if (catalogGrid) {
        const renderCatalog = (filter = 'all') => {
            catalogGrid.innerHTML = '';
            const filtered = filter === 'all' ? products : products.filter(p => p.section === filter || p.category === filter);
            catalogGrid.innerHTML = filtered.length ? filtered.map(renderCard).join('') : '<p>NO HAY STOCK.</p>';
        };
        renderCatalog();
        
        // Filtros
        document.getElementById('category-filter')?.addEventListener('change', (e) => renderCatalog(e.target.value));
    }

    // --- 5. EVENT LISTENERS GLOBALES ---
    
    // Delegación de eventos para botones "Añadir" (funciona con elementos dinámicos)
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const btn = e.target;
            const id = parseInt(btn.dataset.id);
            
            // 1. Logic
            addToCart(id);
            // 2. Animation
            animateFlyToCart(btn);
        }
        
        if (e.target.classList.contains('cart-item-remove')) {
            removeFromCart(parseInt(e.target.dataset.id));
        }
    });

    // Toggle Cart Events
    cartToggleBtns.forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); toggleCart(true); }));
    closeCartBtn?.addEventListener('click', () => toggleCart(false));
    cartOverlay?.addEventListener('click', () => toggleCart(false));

    // Init
    updateCartUI();
});
