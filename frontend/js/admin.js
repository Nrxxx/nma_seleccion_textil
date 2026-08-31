const API_URL = 'http://localhost:5000/api/productos';
const API_VENTAS = 'http://localhost:5000/api/ventas';
let prendas = [];

document.addEventListener('DOMContentLoaded', () => {
    validarPermisosAdmin();
    cargarSolicitudesPendientes();
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
// SOLICITUDES DE PUBLICACIÓN (INTERMEDIARIO)
// ==========================================

async function cargarSolicitudesPendientes() {
    const tbody = document.getElementById('tablaSolicitudesBody');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_URL}/pendientes`);
        if (!res.ok) throw new Error('Error al obtener solicitudes');

        const pendientes = await res.json();

        if (!pendientes || pendientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">No hay solicitudes de publicación pendientes.</td></tr>';
            return;
        }

        tbody.innerHTML = pendientes.map(p => {
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
                        <button onclick="procesarSolicitud(${id}, 'disponible')" class="btn-admin-action btn-approve" title="Aprobar y Publicar">
                            <i class="fa-solid fa-check"></i> Aprobar
                        </button>
                        <button onclick="procesarSolicitud(${id}, 'rechazado')" class="btn-admin-action btn-cancel" title="Rechazar">
                            <i class="fa-solid fa-xmark"></i> Rechazar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('❌ Error al cargar solicitudes:', err.message);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #c53030;">Error al cargar las solicitudes.</td></tr>';
    }
}

async function procesarSolicitud(idPrenda, nuevoEstado) {
    const accionText = nuevoEstado === 'disponible' ? 'aprobar y publicar' : 'rechazar';
    if (!confirm(`¿Estás seguro de que deseas ${accionText} esta prenda?`)) return;

    try {
        const res = await fetch(`${API_URL}/${idPrenda}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (!res.ok) throw new Error('Error al cambiar el estado');

        alert(`La prenda ha sido ${nuevoEstado === 'disponible' ? 'aprobada' : 'rechazada'}.`);
        cargarSolicitudesPendientes();
        cargarPrendasAdmin();
    } catch (err) {
        console.error('❌ Error:', err.message);
        alert('No se pudo procesar la solicitud.');
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
        cargarPrendasAdmin();
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
    const modal = document.getElementById('adminModalOverlay');
    const form = document.getElementById('prendaForm');

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            document.getElementById('prendaId').value = '';
            document.getElementById('modalTitle').innerHTML = '<i class="fa-solid fa-shirt"></i> Nueva Prenda';
            form.reset();
            modal.classList.add('active');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }

    if (form) {
        form.addEventListener('submit', guardarPrenda);
    }
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
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Error al guardar');

        document.getElementById('adminModalOverlay').classList.remove('active');
        cargarPrendasAdmin();
    } catch (err) {
        console.error('❌ Error al guardar:', err.message);
        alert('No se pudo guardar la prenda.');
    }
}

function prepararEdicion(id) {
    const prenda = prendas.find(p => (p.id_prenda || p.id) === id);
    if (!prenda) return;

    document.getElementById('prendaId').value = id;
    document.getElementById('nombrePrenda').value = prenda.nombre_prenda || prenda.nombre || '';
    document.getElementById('marcaPrenda').value = prenda.marca || '';
    document.getElementById('tallaPrenda').value = prenda.talla || '';
    document.getElementById('precioPrenda').value = prenda.precio || '';
    document.getElementById('imagenPrenda').value = prenda.imagen_url || prenda.imagen || '';

    document.getElementById('modalTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Editar Prenda';
    document.getElementById('adminModalOverlay').classList.add('active');
}

async function eliminarPrenda(id) {
    if (!confirm('¿Estás seguro de eliminar esta prenda del inventario?')) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar');
        cargarPrendasAdmin();
    } catch (err) {
        console.error('❌ Error al eliminar:', err.message);
        alert('No se pudo eliminar la prenda.');
    }
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}