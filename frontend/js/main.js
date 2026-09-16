const API_URL = 'http://localhost:5000/api/productos';
const API_VENTAS = 'http://localhost:5000/api/ventas';
const API_SOLICITUDES = 'http://localhost:5000/api/solicitudes';

let prendas = [];
let currentFotosModal = [];
let currentFotoIndex = 0;
let prendaSeleccionadaModal = null;
let carrito = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarProductosCliente();
    setupSolicitudModalEvents();
    setupQuickViewEvents();
    setupCarritoEvents();
});

// ==========================================
// Cargar Productos en Catálogo Cliente
// ==========================================
async function cargarProductosCliente() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener productos');
        prendas = await res.json();
        renderProductos(prendas);
    } catch (err) {
        console.error('❌ Error al cargar productos:', err.message);
        grid.innerHTML = '<p class="error-msg">No se pudieron cargar las prendas del catálogo.</p>';
    }
}

function renderProductos(lista) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (!lista || lista.length === 0) {
        grid.innerHTML = '<p>No hay prendas disponibles en este momento.</p>';
        return;
    }

    grid.innerHTML = lista.map(p => {
        const id = p.id_prenda || p.id;
        const nombre = p.nombre_prenda || p.nombre;
        
        let imagen = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80';
        if (p.fotos && Array.isArray(p.fotos) && p.fotos.length > 0) {
            imagen = p.fotos[0];
        } else if (p.imagen_url || p.imagen) {
            imagen = p.imagen_url || p.imagen;
        }

        const precio = Number(p.precio || p.precio_estimado || 0).toLocaleString('es-CO');

        const usuarioSesion = JSON.parse(localStorage.getItem('usuario_nma'));
        const esDuenioOAdmin = usuarioSesion && (usuarioSesion.id === p.usuario_id || usuarioSesion.rol === 'admin');

        return `
            <div class="product-card" onclick="abrirVistaRapida(${id})">
                <div class="product-image-container">
                    <img src="${escapeHTML(imagen)}" alt="${escapeHTML(nombre)}" class="product-img">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${escapeHTML(nombre)}</h3>
                    <p class="product-meta">Talla: ${escapeHTML(p.talla || 'Única')} | Marca: ${escapeHTML(p.marca || 'N/A')}</p>
                    <p class="product-price">$${precio} COP</p>
                    
                    <button class="add-cart-btn" onclick="agregarAlCarrito(event, ${id})">
                        <i class="fa-solid fa-cart-shopping"></i> Reservar
                    </button>

                    ${esDuenioOAdmin ? `
                        <button style="margin-top: 8px; width: 100%; padding: 8px; background: #e0e0e0; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; color: #333;" 
                                onclick="abrirEditarPrendaPropia(event, ${id})">
                            ✏️ Editar Prenda
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// Lógica de Carrito / Reserva
// ==========================================
function setupCarritoEvents() {
    const cartBtn = document.querySelector('.cart-btn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartOverlay = document.getElementById('cartOverlay');

    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            if (cartOverlay) cartOverlay.classList.add('active');
        });
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            if (cartOverlay) cartOverlay.classList.remove('active');
        });
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) cartOverlay.classList.remove('active');
        });
    }
}

function agregarAlCarrito(e, id) {
    if (e) e.stopPropagation();

    const prenda = prendas.find(p => (p.id_prenda || p.id) === id);
    if (!prenda) return;

    const yaExiste = carrito.some(item => (item.id_prenda || item.id) === id);
    if (yaExiste) {
        alert('Esta prenda ya está agregada a tu carrito de reservas.');
        return;
    }

    carrito.push(prenda);
    actualizarCarritoUI();

    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) cartOverlay.classList.add('active');
}

function actualizarCarritoUI() {
    const cartCount = document.getElementById('cartCount');
    const cartBody = document.getElementById('cartBody');
    const cartTotal = document.getElementById('cartTotal');

    if (cartCount) cartCount.textContent = carrito.length;

    if (!cartBody) return;

    if (carrito.length === 0) {
        cartBody.innerHTML = '<p class="empty-cart-msg">Aún no has agregado prendas al carrito.</p>';
        if (cartTotal) cartTotal.textContent = '$0 COP';
        return;
    }

    let total = 0;
    cartBody.innerHTML = carrito.map((p, index) => {
        const id = p.id_prenda || p.id;
        const nombre = p.nombre_prenda || p.nombre;
        const precioNum = Number(p.precio || p.precio_estimado || 0);
        total += precioNum;

        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${escapeHTML(nombre)}</h4>
                    <p>Talla: ${escapeHTML(p.talla || 'Única')} | $${precioNum.toLocaleString('es-CO')} COP</p>
                </div>
                <button class="remove-item-btn" onclick="quitarDelCarrito(${index})">&times;</button>
            </div>
        `;
    }).join('');

    if (cartTotal) cartTotal.textContent = `$${total.toLocaleString('es-CO')} COP`;
}

function quitarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarritoUI();
}

// ==========================================
// Modal Vista Rápida & Carrusel
// ==========================================
function setupQuickViewEvents() {
    const closeBtn = document.getElementById('closeQuickViewBtn');
    const modal = document.getElementById('quickViewModal');
    const prevBtn = document.getElementById('prevPhotoBtn');
    const nextBtn = document.getElementById('nextPhotoBtn');
    const addCartBtnModal = document.getElementById('quickViewAddCartBtn');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (modal) modal.classList.remove('active');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentFotosModal.length === 0) return;
            currentFotoIndex = (currentFotoIndex - 1 + currentFotosModal.length) % currentFotosModal.length;
            actualizarImagenModal();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentFotosModal.length === 0) return;
            currentFotoIndex = (currentFotoIndex + 1) % currentFotosModal.length;
            actualizarImagenModal();
        });
    }

    if (addCartBtnModal) {
        addCartBtnModal.addEventListener('click', () => {
            if (prendaSeleccionadaModal) {
                const id = prendaSeleccionadaModal.id_prenda || prendaSeleccionadaModal.id;
                agregarAlCarrito(null, id);
                if (modal) modal.classList.remove('active');
            }
        });
    }
}

function abrirVistaRapida(id) {
    const prenda = prendas.find(p => (p.id_prenda || p.id) === id);
    if (!prenda) return;

    prendaSeleccionadaModal = prenda;

    if (prenda.fotos && Array.isArray(prenda.fotos) && prenda.fotos.length > 0) {
        currentFotosModal = prenda.fotos;
    } else if (prenda.imagen_url || prenda.imagen) {
        currentFotosModal = [prenda.imagen_url || prenda.imagen];
    } else {
        currentFotosModal = ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80'];
    }

    currentFotoIndex = 0;
    actualizarImagenModal();

    const titleEl = document.getElementById('quickViewTitle');
    const tallaEl = document.getElementById('quickViewTalla');
    const marcaEl = document.getElementById('quickViewMarca');
    const precioEl = document.getElementById('quickViewPrecio');
    const modal = document.getElementById('quickViewModal');

    if (titleEl) titleEl.textContent = prenda.nombre_prenda || prenda.nombre || '';
    if (tallaEl) tallaEl.textContent = prenda.talla || 'Única';
    if (marcaEl) marcaEl.textContent = prenda.marca || 'N/A';
    
    const precio = Number(prenda.precio || prenda.precio_estimado || 0).toLocaleString('es-CO');
    if (precioEl) precioEl.textContent = `$${precio} COP`;

    if (modal) modal.classList.add('active');
}

function actualizarImagenModal() {
    const imgEl = document.getElementById('quickViewImg');
    const counterEl = document.getElementById('quickViewCounter');

    if (imgEl && currentFotosModal.length > 0) {
        imgEl.src = currentFotosModal[currentFotoIndex];
    }
    if (counterEl) {
        counterEl.textContent = `${currentFotoIndex + 1} / ${currentFotosModal.length}`;
    }
}

// ==========================================
// Configuración Modal Vender / Subir Prenda
// ==========================================
function setupSolicitudModalEvents() {
    const openBtn = document.getElementById('openVenderModalBtn');
    const closeBtn = document.getElementById('closeSolicitudModalBtn');
    const overlay = document.getElementById('solicitudModalOverlay');
    const form = document.getElementById('solicitudForm');

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            const usuarioSesion = JSON.parse(localStorage.getItem('usuario_nma'));
            if (!usuarioSesion) {
                alert('Debes iniciar sesión para vender o publicar una prenda.');
                window.location.href = 'login.html';
                return;
            }
            overlay.classList.add('active');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
    }

    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    }

    if (form) {
        form.addEventListener('submit', enviarSolicitudPrenda);
    }
}

async function enviarSolicitudPrenda(e) {
    e.preventDefault();

    const usuarioSesion = JSON.parse(localStorage.getItem('usuario_nma'));
    const photoInputs = document.querySelectorAll('.solicitudFotoInput');
    
    const formData = new FormData();
    formData.append('nombre_prenda', document.getElementById('solicitudNombre').value);
    formData.append('talla', document.getElementById('solicitudTalla').value);
    formData.append('marca', document.getElementById('solicitudMarca').value);
    formData.append('precio_estimado', document.getElementById('solicitudPrecio').value);
    formData.append('descripcion', document.getElementById('solicitudDescripcion').value);
    
    if (usuarioSesion && usuarioSesion.id) {
        formData.append('usuario_id', usuarioSesion.id);
    }

    let fotosCount = 0;
    photoInputs.forEach(input => {
        if (input.files && input.files[0]) {
            formData.append('fotos', input.files[0]);
            fotosCount++;
        }
    });

    if (fotosCount === 0) {
        alert('Por favor adjunta al menos la Foto 1 principal.');
        return;
    }

    try {
        const res = await fetch(API_SOLICITUDES, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) throw new Error('Error al registrar la solicitud');

        alert('¡Solicitud enviada exitosamente! Tu prenda pasará por revisión antes de publicarse.');
        document.getElementById('solicitudForm').reset();
        document.getElementById('solicitudModalOverlay').classList.remove('active');
    } catch (err) {
        console.error('❌ Error al enviar la prenda:', err.message);
        alert('Ocurrió un error al intentar enviar la solicitud.');
    }
}

// ==========================================
// EDICIÓN DE PRENDAS POR EL DUEÑO O ADMIN
// ==========================================
function abrirEditarPrendaPropia(event, id) {
    event.stopPropagation();

    const prenda = prendas.find(p => (p.id_prenda || p.id) === id);
    if (!prenda) return;
    
    document.getElementById('editPropiaId').value = id;
    document.getElementById('editPropiaNombre').value = prenda.nombre_prenda || prenda.nombre || '';
    document.getElementById('editPropiaTalla').value = prenda.talla || '';
    document.getElementById('editPropiaMarca').value = prenda.marca || '';
    document.getElementById('editPropiaPrecio').value = prenda.precio || prenda.precio_estimado || '';
    
    document.getElementById('modalEditarPropiaOverlay').classList.add('active');
}

const formEditarPropia = document.getElementById('formEditarPropia');
if (formEditarPropia) {
    formEditarPropia.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editPropiaId').value;
        const formData = new FormData();
        
        formData.append('nombre_prenda', document.getElementById('editPropiaNombre').value);
        formData.append('talla', document.getElementById('editPropiaTalla').value);
        formData.append('marca', document.getElementById('editPropiaMarca').value);
        formData.append('precio', document.getElementById('editPropiaPrecio').value);
        
        const photoInputs = document.querySelectorAll('.editPropiaFotoInput');
        photoInputs.forEach(input => {
            if (input.files && input.files[0]) {
                formData.append('fotos', input.files[0]);
            }
        });
        
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                body: formData
            });
            
            if (!res.ok) throw new Error('Error al actualizar');
            
            alert('¡Prenda actualizada correctamente!');
            document.getElementById('modalEditarPropiaOverlay').classList.remove('active');
            document.getElementById('formEditarPropia').reset();
            cargarProductosCliente();
        } catch (err) {
            console.error(err);
            alert('Ocurrió un error al actualizar la prenda.');
        }
    });
}

function escapeHTML(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}