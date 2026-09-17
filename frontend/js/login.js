const API_USUARIOS = 'http://localhost:5000/api/usuarios';

function mostrarTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');

    if (tab === 'login') {
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
        tabLogin.style.borderBottom = '3px solid #000';
        tabLogin.style.color = '#000';
        tabRegister.style.borderBottom = 'none';
        tabRegister.style.color = '#888';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'flex';
        tabRegister.style.borderBottom = '3px solid #2e7d32';
        tabRegister.style.color = '#2e7d32';
        tabLogin.style.borderBottom = 'none';
        tabLogin.style.color = '#888';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // 1. Manejo del Formulario de Iniciar Sesión
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            try {
                const response = await fetch(`${API_USUARIOS}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error al iniciar sesión');
                }

                // Guardar la sesión localmente
                localStorage.setItem('usuario_nma', JSON.stringify(data.usuario));

                alert(`¡Bienvenido, ${data.usuario.nombre}!`);

                // Redireccionar según el rol
                if (data.usuario.rol === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }

            } catch (error) {
                console.error('Error de autenticación:', error.message);
                alert(error.message);
            }
        });
    }

    // 2. Manejo del Formulario de Registro
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nombre = document.getElementById('regNombre').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value.trim();

            try {
                const response = await fetch(`${API_USUARIOS}/registro`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error al registrarse');
                }

                alert('¡Cuenta creada exitosamente!');

                // Iniciar sesión automáticamente con la cuenta creada
                localStorage.setItem('usuario_nma', JSON.stringify(data.usuario));

                // Redireccionar al catálogo
                window.location.href = 'index.html';

            } catch (error) {
                console.error('Error de registro:', error.message);
                alert(error.message);
            }
        });
    }
});