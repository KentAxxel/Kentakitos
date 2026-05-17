document.addEventListener('DOMContentLoaded', () => {
    const usuarioString = localStorage.getItem('usuario');
    if (!usuarioString) {
        window.location.href = '/login.html';
        return;
    }

    async function cargarReportes() {
        try {
            const res = await fetch('http://localhost:8080/api/reportes/dashboard');
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
