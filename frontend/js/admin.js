const API_URL = 'http://localhost:5000/api/productos';
let prendas = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarPrendasAdmin();
    setupModalEvents();
});

async function cargarPrendasAdmin() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener datos');
        prendas = await res.json();
        renderTabla(prendas);
    } catch (err) {
        console.error('❌ Error:', err.message);
        document.getElementById('adminTableBody').innerHTML = `
            <tr><td colspan="6" style="text-align: center; color: #c53030;">Error al conectar con el servidor.</td></tr>
        `;
    }
}

function renderTabla(lista) {
    const tbody = document.getElementById('adminTableBody');
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

    openBtn.addEventListener('click', () => abrirModalCrear());
    closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });

    form.addEventListener('submit', guardarPrenda);
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