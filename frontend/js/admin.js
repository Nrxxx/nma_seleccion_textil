const API_URL = 'http://localhost:5000/api/productos';
const API_VENTAS = 'http://localhost:5000/api/ventas';
const API_SOLICITUDES = 'http://localhost:5000/api/solicitudes';
let prendas = [];

document.addEventListener('DOMContentLoaded', () => {
    validarPermisosAdmin();
    cargarPrendasAdmin();
    cargarReservasAdmin();
    cargarSolicitudesAdmin();
    setupModalEvents();
});

function validarPermisosAdmin() {
    const usuarioSesion = JSON.parse(localStorage.getItem('usuario_nma'));
    if (!usuarioSesion || usuarioSesion.rol !== 'admin') {
        alert('Acceso restringido. Inicia sesión como administrador.');
        window.location.href = 'login.html';
    }
}

// MODERACIÓN DE PRENDAS SUBIDAS POR USUARIOS

async function cargarSolicitudesAdmin() {
    const tbody = document.getElementById('tablaSolicitudesBody');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_SOLICITUDES}/pendientes`);
        if (!res.ok) throw new Error('Error al cargar solicitudes');

        const solicitudes = await res.json();

        if (!solicitudes || solicitudes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">No hay prendas de usuarios pendientes por moderar.</td></tr>';
            return;
        }

        tbody.innerHTML = solicitudes.map(s => {
            const foto = Array.isArray(s.fotos) ? s.fotos[0] : s.fotos;
            const precio = Number(s.precio_estimado || 0).toLocaleString('es-CO');

            return `
                <tr>
                    <td><img src="${escapeHTML(foto)}" class="img-thumb" alt="solicitud"></td>
                    <td><strong>${escapeHTML(s.nombre_prenda)}</strong></td>
                    <td>${escapeHTML(s.talla)} | ${escapeHTML(s.marca)}</td>
                    <td>$${precio} COP</td>
                    <td>${escapeHTML(s.descripcion || 'Sin descripción')}</td>
                    <td>
                        <button onclick="aprobarSolicitud(${s.id})" class="btn-admin-action btn-approve" title="Aprobar y Publicar">
                            <i class="fa-solid fa-check"></i> Aprobar
                        </button>
                        <button onclick="rechazarSolicitud(${s.id})" class="btn-admin-action btn-cancel" title="Rechazar">
                            <i class="fa-solid fa-xmark"></i> Rechazar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('Error al cargar solicitudes:', err.message);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #c53030;">Error al conectar con el servidor de solicitudes.</td></tr>';
    }
}

async function aprobarSolicitud(id) {
    if (!confirm('¿Deseas aprobar esta prenda e integrarla al catálogo principal?')) return;

    try {
        const res = await fetch(`${API_SOLICITUDES}/${id}/aprobar`, { method: 'PATCH' });
        if (!res.ok) throw new Error('Error al aprobar solicitud');

        alert('¡Prenda aprobada y publicada exitosamente!');
        cargarSolicitudesAdmin();
        cargarPrendasAdmin();
    } catch (err) {
        alert('Error al aprobar la solicitud.');
    }
}

async function rechazarSolicitud(id) {
    if (!confirm('¿Deseas rechazar esta propuesta de prenda?')) return;

    try {
        const res = await fetch(`${API_SOLICITUDES}/${id}/rechazar`, { method: 'PATCH' });
        if (!res.ok) throw new Error('Error al rechazar solicitud');

        alert('Solicitud rechazada.');
        cargarSolicitudesAdmin();
    } catch (err) {
        alert('Error al rechazar la solicitud.');
    }
}

// GESTIÓN DE RESERVAS Y ABONOS PENDIENTES

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
        console.error('Error al cargar reservas:', err.message);
        tbodyReservas.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #c53030;">Error al conectar con el servidor de ventas.</td></tr>';
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
        alert('No se pudo cancelar la reserva.');
    }
}

// GESTIÓN DE INVENTARIO

async function cargarPrendasAdmin() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener datos');
        prendas = await res.json();
        renderTabla(prendas);
    } catch (err) {
        console.error('Error:', err.message);
        const tbody = document.getElementById('adminTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #c53030;">Error al conectar con el servidor.</td></tr>';
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
        
        // Soporte robusto para extraer la primera imagen del array de fotos
        let imagen = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80';
        if (Array.isArray(p.fotos) && p.fotos.length > 0) {
            imagen = p.fotos[0];
        } else if (p.imagen_url) {
            imagen = p.imagen_url;
        } else if (p.imagen) {
            imagen = p.imagen;
        }

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

    let primeraFoto = '';
    if (Array.isArray(prenda.fotos) && prenda.fotos.length > 0) {
        primeraFoto = prenda.fotos[0];
    } else {
        primeraFoto = prenda.imagen_url || prenda.imagen || '';
    }

    document.getElementById('modalTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Editar Prenda';
    document.getElementById('prendaId').value = id;
    document.getElementById('nombrePrenda').value = prenda.nombre_prenda || prenda.nombre || '';
    document.getElementById('marcaPrenda').value = prenda.marca || '';
    document.getElementById('tallaPrenda').value = prenda.talla || '';
    document.getElementById('precioPrenda').value = prenda.precio || '';
    document.getElementById('imagenPrenda').value = primeraFoto;

    document.getElementById('adminModalOverlay').classList.add('active');
}

async function guardarPrenda(e) {
    e.preventDefault();
    const id = document.getElementById('prendaId').value;
    const imgVal = document.getElementById('imagenPrenda').value;
    
    const payload = {
        nombre_prenda: document.getElementById('nombrePrenda').value,
        marca: document.getElementById('marcaPrenda').value,
        talla: document.getElementById('tallaPrenda').value,
        precio: Number(document.getElementById('precioPrenda').value),
        fotos: imgVal ? [imgVal] : []
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