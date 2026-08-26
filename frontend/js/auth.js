document.addEventListener('DOMContentLoaded', () => {
    actualizarBarraUsuario();
});

function actualizarBarraUsuario() {
    const usuarioSesion = JSON.parse(localStorage.getItem('usuario_nma'));
    const userNameEl = document.getElementById('userName');
    const authBtnEl = document.getElementById('authBtn');
    const authTextEl = document.getElementById('authText');

    if (!authBtnEl) return;

    if (usuarioSesion) {
        if (userNameEl) userNameEl.textContent = `Hola, ${usuarioSesion.nombre}`;
        if (authTextEl) authTextEl.textContent = 'Cerrar Sesión';
        
        authBtnEl.onclick = cerrarSesion;
    } else {
        if (userNameEl) userNameEl.textContent = '';
        if (authTextEl) authTextEl.textContent = 'Iniciar Sesión';
        
        authBtnEl.onclick = () => window.location.href = 'login.html';
    }
}

function cerrarSesion() {
    localStorage.removeItem('usuario_nma');
    alert('Has cerrado sesión correctamente.');
    window.location.reload();
}