document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            try {
                const response = await fetch('http://localhost:5000/api/usuarios/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error al iniciar sesión');
                }

                // Guardar la sesión del usuario localmente
                localStorage.setItem('usuario_nma', JSON.stringify(data.usuario));

                alert(`¡Bienvenido, ${data.usuario.nombre}!`);

                // Redireccionar según el rol
                if (data.usuario.rol === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }

            } catch (error) {
                console.error('❌ Error de autenticación:', error.message);
                alert(error.message);
            }
        });
    }
});