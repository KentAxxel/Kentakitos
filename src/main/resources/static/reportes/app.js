document.addEventListener('DOMContentLoaded', () => {
    const usuarioString = localStorage.getItem('usuario');
    const token = localStorage.getItem('jwtToken');
    if (!usuarioString || !token) {
        window.location.href = '/login-oauth.html';
        return;
    }

    async function cargarReportes() {
        try {
            const res = await fetch('http://127.0.0.1:8080/api/reportes/dashboard', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            
            document.getElementById('repUsuarios').innerText = data.totalUsuarios;
            document.getElementById('repMesas').innerText = data.totalMesas;
            document.getElementById('repProductos').innerText = data.totalProductos;
            document.getElementById('repIngredientes').innerText = data.totalIngredientes;
            
        } catch (error) {
            console.error("Error al cargar reportes", error);
        }
    }

    cargarReportes();
});

document.addEventListener('DOMContentLoaded', () => {
    // Dropdown Profile logic
    const btnProfileDropdown = document.getElementById('btnProfileDropdown');
    const profileDropdown = document.getElementById('profileDropdown');
    const headerUsername = document.getElementById('headerUsername');
    
    const usStr = localStorage.getItem('usuario');
    if (usStr && headerUsername) {
        try {
            const us = JSON.parse(usStr);
            headerUsername.textContent = us.nombreCompleto || us.username;
        } catch(e) {}
    }

    if (btnProfileDropdown && profileDropdown) {
        btnProfileDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
        document.addEventListener('click', () => {
            profileDropdown.classList.remove('show');
        });
    }

    const btnLogoutAction = document.getElementById('btnLogoutAction');
    if (btnLogoutAction) {
        btnLogoutAction.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm("Â¿Deseas cerrar sesiÃ³n?")) {
                const tk = localStorage.getItem('jwtToken');
                if (tk) {
                    try {
                        await fetch('http://127.0.0.1:8080/api/auth/logout', {
                            method: 'POST',
                            headers: { 'Authorization': 'Bearer ' + tk }
                        });
                    } catch(e) {}
                }
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('usuario');
                window.location.href = '/login-oauth.html';
            }
        });
    }
});