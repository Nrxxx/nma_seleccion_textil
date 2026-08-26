document.addEventListener('DOMContentLoaded', () => {
    fetchPrendas();
    setupSearchFilter();
    setupCartModal();
    setupCategoryFilters();
});

let prendasGlobales = [];
let carrito = [];
let categoriaActiva = 'todas';

async function fetchPrendas() {
    try {
        const response = await fetch('http://localhost:5000/api/productos');
        if (!response.ok) throw new Error('No se pudo conectar con el servidor backend');
        
        const prendas = await response.json();
        
        console.log('✅ Datos cargados desde el servidor:');
        console.table(prendas);

        prendasGlobales = prendas;
        aplicarFiltrosCombinados();
    } catch (error) {
        console.error('❌ Error al obtener las prendas:', error.message);
        
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #d9534f;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 10px;"></i>
                    <p><strong>Error de conexión con el servidor.</strong></p>
                    <p style="font-size: 0.9rem; color: #666;">Asegúrate de que tu backend esté encendido y conectado a Supabase.</p>
                </div>
            `;
        }
    }
}

function setupCategoryFilters() {
    const chips = document.querySelectorAll('.chip');
    
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            
            categoriaActiva = chip.getAttribute('data-category');
            aplicarFiltrosCombinados();
        });
    });
}

function setupSearchFilter() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        aplicarFiltrosCombinados();
    });
}

function aplicarFiltrosCombinados() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const prendasFiltradas = prendasGlobales.filter(prenda => {
        const nombre = (prenda.nombre_prenda || prenda.nombre || '').toLowerCase();
        const marca = (prenda.marca || '').toLowerCase();
        const talla = (prenda.talla || '').toLowerCase();

        const coincideBusqueda = nombre.includes(query) || marca.includes(query) || talla.includes(query);
        const coincideCategoria = (categoriaActiva === 'todas') || nombre.includes(categoriaActiva);

        return coincideBusqueda && coincideCategoria;
    });

    renderProducts(prendasFiltradas);
}

function setupCartModal() {
    const cartBtn = document.querySelector('.cart-btn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartOverlay = document.getElementById('cartOverlay');

    if (cartBtn && cartOverlay && closeCartBtn) {
        cartBtn.addEventListener('click', () => cartOverlay.classList.add('active'));
        closeCartBtn.addEventListener('click', () => cartOverlay.classList.remove('active'));
        
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) cartOverlay.classList.remove('active');
        });
    }
}

function renderProducts(prendas) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    if (!prendas || prendas.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                <i class="fa-solid fa-filter-circle-xmark" style="font-size: 2.5rem; margin-bottom: 10px; color: #999;"></i>
                <p><strong>No hay prendas disponibles para este filtro.</strong></p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = prendas.map(prenda => {
        const nombre = prenda.nombre_prenda || prenda.nombre || 'Prenda sin nombre';
        const talla = prenda.talla || 'Única';
        const marca = prenda.marca || 'N/A';
        const precio = prenda.precio ? Number(prenda.precio).toLocaleString('es-CO') : '0';
        const id = prenda.id_prenda || prenda.id;
        
        const imagenUrl = prenda.imagen_url || prenda.imagen || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80';

        return `
            <article class="product-card">
                <div class="product-image-container">
                    <img src="${escapeHTML(imagenUrl)}" alt="${escapeHTML(nombre)}" class="product-img" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80';">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${escapeHTML(nombre)}</h3>
                    <p class="product-meta">
                        Talla: ${escapeHTML(talla)} | Marca: ${escapeHTML(marca)}
                    </p>
                    <div class="product-price">$${precio} COP</div>
                    <button class="add-cart-btn" onclick="addToCart(${id})">
                        Reservar Prenda
                    </button>
                </div>
            </article>
        `;
    }).join('');
}

function addToCart(id) {
    const prendaEncontrada = prendasGlobales.find(p => (p.id_prenda || p.id) === id);
    if (!prendaEncontrada) return;

    const yaExiste = carrito.some(item => (item.id_prenda || item.id) === id);
    if (yaExiste) {
        alert('Esta prenda es única y ya la tienes agregada en tu carrito.');
        return;
    }

    carrito.push(prendaEncontrada);
    updateCartUI();
    document.getElementById('cartOverlay').classList.add('active');
}

function removeFromCart(id) {
    carrito = carrito.filter(item => (item.id_prenda || item.id) !== id);
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartBody = document.getElementById('cartBody');
    const cartTotal = document.getElementById('cartTotal');

    if (!cartCount || !cartBody || !cartTotal) return;

    cartCount.textContent = carrito.length;

    if (carrito.length === 0) {
        cartBody.innerHTML = '<p class="empty-cart-msg">Aún no has agregado prendas al carrito.</p>';
        cartTotal.textContent = '$0 COP';
        return;
    }

    let total = 0;
    cartBody.innerHTML = carrito.map(item => {
        const nombre = item.nombre_prenda || item.nombre;
        const precio = Number(item.precio || 0);
        const id = item.id_prenda || item.id;
        total += precio;

        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${escapeHTML(nombre)}</h4>
                    <p>Talla: ${escapeHTML(item.talla)} | $${precio.toLocaleString('es-CO')} COP</p>
                </div>
                <button class="remove-item-btn" onclick="removeFromCart(${id})" title="Eliminar">&times;</button>
            </div>
        `;
    }).join('');

    cartTotal.textContent = `$${total.toLocaleString('es-CO')} COP`;
}

async function confirmarReserva() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío.');
        return;
    }

    // Obtener sesión guardada si el usuario está logueado
    const usuarioSesion = JSON.parse(localStorage.getItem('usuario_nma')) || null;

    const totalReserva = carrito.reduce((sum, item) => sum + Number(item.precio || 0), 0);

    const detallesVenta = carrito.map(item => ({
        id_prenda: item.id_prenda || item.id,
        nombre_prenda: item.nombre_prenda || item.nombre,
        precio: item.precio,
        talla: item.talla,
        marca: item.marca
    }));

    const payload = {
        usuario_id: usuarioSesion ? usuarioSesion.id : null,
        total: totalReserva,
        detalles: detallesVenta
    };

    try {
        const response = await fetch('http://localhost:5000/api/ventas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('No se pudo procesar la reserva en el servidor');

        alert('¡Reserva realizada con éxito! Nos pondremos en contacto para coordinar la entrega.');

        carrito = [];
        updateCartUI();
        document.getElementById('cartOverlay').classList.remove('active');
        fetchPrendas();
    } catch (error) {
        console.error('❌ Error en reserva:', error.message);
        alert('Ocurrió un error al guardar tu reserva.');
    }
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}