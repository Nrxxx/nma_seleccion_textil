const API_URL = 'http://localhost:5000/api/productos';
const API_VENTAS = 'http://localhost:5000/api/ventas';
let prendas = [];

document.addEventListener('DOMContentLoaded', () => {
    validarPermisosAdmin();
    cargarPrendasAdmin();
    cargarReservasAdmin();
    setupModalEvents();
});

// Proteger el acceso al panel
function validarPermisosAdmin() {
    const usuarioSesion = JSON.parse(localStorage.getItem('usuario_nma'));

    if (!usuarioSesion || usuarioSesion.rol !== 'admin') {
        alert('Acceso restringido. Inicia sesión como administrador.');
        window.location.href = 'login.html';
    }
}

// ==========================================
// GESTIÓN DE RESERVAS Y ABONOS PENDIENTES
// ==========================================

async function cargarReservasAdmin() {
    const tbodyReservas = document.getElementById('tablaReservasBody');
    if (!tbodyReservas) return;

    try {
        const res = await fetch(API_VENTAS);
        if (!res.ok) throw new Error('Error al obtener reservas');
        
        const ventas = await res.json();
        
        // Filtrar solo las ventas que están pendientes de abono
        const pendientes = ventas.filter(v => v.estado_pago === 'pendiente_abono');

        if (!pendientes || pendientes.length === 0) {
            tbodyReservas.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">No hay abonos pendientes por revisar.</td></tr>';
            return;
        }

        const formatearCOP = (val) => new Intl.NumberFormat('es-CO', { 
            style: 'currency', 
            currency: 'COP', 
            maximumFractionDigits: 0 
        }).format(val);

        tbodyReservas.innerHTML = pendientes.map(v => {
            const idVenta = v.id_venta || v.id;
            const total = formatearCOP(v.total || 0);
            const abono = formatearCOP(v.monto_abonado || 0);
            const expiracion = v.fecha_expiracion ? new Date(v.fecha_expiracion).toLocaleString('es-CO') : '24 horas';

            return `
                <tr>
                    <td><strong>#${idVenta}</strong></td>
                    <td>${total}</td>
                    <td>${abono}</td>
                    <td><span class="badge-status badge-pendiente">${escapeHTML(v.estado_pago)}</span></td>
                    <td>${expiracion}</td>
                    <td>
                        <button onclick="aprobarAbono(${idVenta})" class="btn-admin-action btn-approve" title="Confirmar Abono Nequi">
                            <i class="fa-solid fa-check"></i> Aprobar
                        </button>
                        <button onclick="cancelarReserva(${idVenta})" class="btn-admin-action btn-cancel" title="Cancelar y Liberar Prenda">
                            <i class="fa-solid fa-xmark"></i> Liberar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('❌ Error al cargar reservas:', err.message);
        tbodyReservas.innerHTML = `
            <tr><td colspan="6" style="text-align: center; color: #c53030;">Error al conectar con el servidor de ventas.</td></tr>
        `;
    }
}

async function aprobarAbono(idVenta) {
    if (!confirm(`¿Confirmas que recibiste la transferencia en Nequi para la reserva #${idVenta}?`)) return;

    try {
        const response = await fetch(`${API_VENTAS}/${idVenta}/aprobar`, { 
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Error al aprobar el abono');

        alert('¡Abono verificado y reserva confirmada!');
        cargarReservasAdmin();
    } catch (err) {
        console.error('❌ Error:', err.message);
        alert('No se pudo aprobar la reserva.');
    }
}

async function cancelarReserva(idVenta) {
    if (!confirm(`¿Deseas cancelar la reserva #${idVenta} y poner la prenda nuevamente disponible en el catálogo?`)) return;

    try {
        const response = await fetch(`${API_VENTAS}/${idVenta}/cancelar`, { 
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Error al cancelar la reserva');

        alert('Reserva cancelada y prenda liberada.');
        cargarReservasAdmin();
        cargarPrendasAdmin(); // Recargar inventario para actualizar estados si aplica
    } catch (err) {
        console.error('❌ Error:', err.message);
        alert('No se pudo cancelar la reserva.');
    }
}

// ==========================================
// GESTIÓN DE INVENTARIO
// ==========================================

async function cargarPrendasAdmin() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener datos');
        prendas = await res.json();
        renderTabla(prendas);
    } catch (err) {
        console.error('❌ Error:', err.message);
        const tbody = document.getElementById('adminTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr><td colspan="6" style="text-align: center; color: #c53030;">Error al conectar con el servidor.</td></tr>
            `;
        }
    }
}

function renderTabla(lista) {
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;

    if (!lista || lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay prendas en inventario.</td></tr>';
        return;
    }

    tbody.innerHTML = lista.map(p => {
        const id = p.id_prenda || p.id;
        const nombre = p.nombre_prenda || p.nombre;
        const imagen = p.imagen_url || p.imagen || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80';
        const precio = Number(p.precio || 0).toLocaleString('es-CO');

        return `
            <tr>
                <td><img src="${escapeHTML(imagen)}" class="img-thumb" alt="prenda"></td>
                <td><strong>${escapeHTML(nombre)}</strong></td>
                <td>${escapeHTML(p.talla || 'Única')}</td>
                <td>${escapeHTML(p.marca || 'N/A')}</td>
                <td>$${precio} COP</td>
                <td>
                    <button class="btn-action btn-edit" onclick="prepararEdicion(${id})" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn-action btn-delete" onclick="eliminarPrenda(${id})" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function setupModalEvents() {
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const overlay = document.getElementById('adminModalOverlay');
    const form = document.getElementById('prendaForm');

    if (openBtn) openBtn.addEventListener('click', () => abrirModalCrear());
    if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
    
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    }

    if (form) form.addEventListener('submit', guardarPrenda);
}

function abrirModalCrear() {
    document.getElementById('modalTitle').innerHTML = '<i class="fa-solid fa-shirt"></i> Nueva Prenda';
    document.getElementById('prendaForm').reset();
    document.getElementById('prendaId').value = '';
    document.getElementById('adminModalOverlay').classList.add('active');
}

function prepararEdicion(id) {
    const prenda = prendas.find(p => (p.id_prenda || p.id) === id);
    if (!prenda) return;

    document.getElementById('modalTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Editar Prenda';
    document.getElementById('prendaId').value = id;
    document.getElementById('nombrePrenda').value = prenda.nombre_prenda || prenda.nombre || '';
    document.getElementById('marcaPrenda').value = prenda.marca || '';
    document.getElementById('tallaPrenda').value = prenda.talla || '';
    document.getElementById('precioPrenda').value = prenda.precio || '';
    document.getElementById('imagenPrenda').value = prenda.imagen_url || prenda.imagen || '';

    document.getElementById('adminModalOverlay').classList.add('active');
}

async function guardarPrenda(e) {
    e.preventDefault();
    const id = document.getElementById('prendaId').value;
    
    const payload = {
        nombre_prenda: document.getElementById('nombrePrenda').value,
        marca: document.getElementById('marcaPrenda').value,
        talla: document.getElementById('tallaPrenda').value,
        precio: Number(document.getElementById('precioPrenda').value),
        imagen_url: document.getElementById('imagenPrenda').value
    };

    const url = id ? `${API_URL}/${id}` : API_URL;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Error guardando los datos');

        alert(id ? '¡Prenda actualizada correctamente!' : '¡Prenda publicada con éxito!');
        document.getElementById('adminModalOverlay').classList.remove('active');
        cargarPrendasAdmin();
    } catch (err) {
        console.error('❌ Error:', err.message);
        alert('No se pudo procesar la solicitud.');
    }
}

async function eliminarPrenda(id) {
    if (!confirm('¿Seguro que deseas eliminar esta prenda del inventario?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('No se pudo eliminar');

        alert('Prenda eliminada.');
        cargarPrendasAdmin();
    } catch (err) {
        console.error('❌ Error:', err.message);
        alert('Error al eliminar la prenda.');
    }
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}