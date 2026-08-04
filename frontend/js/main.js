document.addEventListener('DOMContentLoaded', () => {
    fetchPrendas();
    setupSearchFilter();
    setupCartModal();
    setupCategoryFilters();
});

let prendasGlobales = [];
let carrito = [];
let categoriaActiva = 'todas';

const prendasDePrueba = [
    { 
        id_prenda: 1, 
        nombre_prenda: 'Chaqueta Denim Vintage', 
        talla: 'M', 
        marca: 'Levi\'s', 
        precio: 85000, 
        imagen_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80' 
    },
    { 
        id_prenda: 2, 
        nombre_prenda: 'Buzo Oversize Algodón', 
        talla: 'L', 
        marca: 'Nike', 
        precio: 65000, 
        imagen_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80' 
    },
    { 
        id_prenda: 3, 
        nombre_prenda: 'Camisa Caqui Eco', 
        talla: 'S', 
        marca: 'Zara', 
        precio: 45000, 
        imagen_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80' 
    },
    { 
        id_prenda: 4, 
        nombre_prenda: 'Pantalón Cargo Retro', 
        talla: '30', 
        marca: 'Pull&Bear', 
        precio: 70000, 
        imagen_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&q=80' 
    },
    { 
        id_prenda: 5, 
        nombre_prenda: 'Chaqueta Rompevientos Ultra', 
        talla: 'XL', 
        marca: 'Adidas', 
        precio: 95000, 
        imagen_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=500&q=80' 
    },
    { 
        id_prenda: 6, 
        nombre_prenda: 'Jeans Tiro Alto Classic', 
        talla: '28', 
        marca: 'American Eagle', 
        precio: 60000, 
        imagen_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80' 
    }
];

async function fetchPrendas() {
    try {
        const response = await fetch('http://localhost:3000/api/prendas');
        if (!response.ok) throw new Error('Backend no disponible');
        const prendas = await response.json();
        prendasGlobales = prendas;
        aplicarFiltrosCombinados();
    } catch (error) {
        console.log('Modo diseño activo: Cargando datos de prueba.');
        prendasGlobales = prendasDePrueba;
        aplicarFiltrosCombinados();
    }
}

// Configuración de los botones de categoría
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

// Escuchar cambios en la barra de búsqueda
function setupSearchFilter() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        aplicarFiltrosCombinados();
    });
}

// Función centralizada para filtrar por CORTES Y BÚSQUEDA al mismo tiempo
function aplicarFiltrosCombinados() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const prendasFiltradas = prendasGlobales.filter(prenda => {
        const nombre = (prenda.nombre_prenda || prenda.nombre || '').toLowerCase();
        const marca = (prenda.marca || '').toLowerCase();
        const talla = (prenda.talla || '').toLowerCase();

        // 1. Validar Filtro por Búsqueda de Texto
        const coincideBusqueda = nombre.includes(query) || marca.includes(query) || talla.includes(query);

        // 2. Validar Filtro por Categoria (Chip)
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
        
        // Asignar imagen desde DB/Mock o imagen genérica
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

function confirmarReserva() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío.');
        return;
    }
    alert(`¡Reserva confirmada por ${carrito.length} prenda(s)!`);
    carrito = [];
    updateCartUI();
    document.getElementById('cartOverlay').classList.remove('active');
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}