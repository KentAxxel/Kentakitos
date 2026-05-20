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
