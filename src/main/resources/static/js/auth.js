document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const btnLogin = document.querySelector('.btn-login');
            btnLogin.innerHTML = 'Cargando...';
            btnLogin.disabled = true;

            try {
                // LLAMADA AL BACKEND REAL
                const response = await fetch('http://127.0.0.1:8080/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                if (response.ok) {
                    const usuario = await response.json();
                    
                    // Guardamos la sesión real en el navegador
                    localStorage.setItem('usuario', JSON.stringify({
                        id: usuario.id,
                        username: usuario.username,
                        nombreCompleto: usuario.nombreCompleto,
                        rol: usuario.rol.nombre
                    }));
                    
                    window.location.href = 'index.html';
                } else {
                    const errorMsg = await response.text();
                    alert('Error: ' + errorMsg);
                }
            } catch (error) {
                console.error('Error de conexión:', error);
                alert('No se pudo conectar con el servidor Java. ¿Está encendido?');
            } finally {
                btnLogin.innerHTML = 'Entrar <i class="bx bx-right-arrow-alt"></i>';
                btnLogin.disabled = false;
            }
        });
    }
});
