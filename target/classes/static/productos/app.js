document.addEventListener('DOMContentLoaded', () => {
    const usuarioString = localStorage.getItem('usuario');
    if (!usuarioString) {
        window.location.href = '/login.html';
        return;
    }

    const tablaBody = document.getElementById('tablaProductosBody');
    const modal = document.getElementById('productoModal');
    const btnNuevoProducto = document.getElementById('btnNuevoProducto');
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    const form = document.getElementById('productoForm');

    let productosGlobal = [];

    async function cargarProductos() {
        try {
            const res = await fetch('http://localhost:8080/api/productos');
            productosGlobal = await res.json();
            renderTabla(productosGlobal);
        } catch (error) {
            console.error("Error", error);
            tablaBody.innerHTML = '<tr><td colspan="4">Error de conexión con el servidor</td></tr>';
        }
    }

    function renderTabla(productos) {
        tablaBody.innerHTML = '';
        productos.forEach(p => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td><span class="status">${p.categoria}</span></td>
                <td><strong>${p.nombre}</strong></td>
                <td>S/ ${p.precioBase.toFixed(2)}</td>
                <td>
                    <button class="action-btn btn-editar" data-id="${p.id}"><i class='bx bx-edit-alt'></i></button>
                    <button class="action-btn btn-eliminar" data-id="${p.id}"><i class='bx bx-trash'></i></button>
                </td>
            `;
            tablaBody.appendChild(tr);
        });

        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                abrirModal(id);
            });
        });
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                eliminarProducto(id);
            });
        });
    }

    function abrirModal(id = null) {
        document.getElementById('modalTitle').innerText = id ? 'Editar Producto' : 'Nuevo Producto';
        
        if (id) {
            const p = productosGlobal.find(x => x.id === id);
            document.getElementById('productoId').value = p.id;
            document.getElementById('productoCategoria').value = p.categoria;
            document.getElementById('productoNombre').value = p.nombre;
            document.getElementById('productoPrecio').value = p.precioBase;
        } else {
            document.getElementById('productoId').value = '';
            document.getElementById('productoCategoria').value = 'SALCHIPAPAS';
            document.getElementById('productoNombre').value = '';
            document.getElementById('productoPrecio').value = '0.00';
        }
        
        modal.style.display = 'flex';
    }

    function cerrarModal() {
        modal.style.display = 'none';
        form.reset();
    }

    async function eliminarProducto(id) {
        if (!confirm('¿Seguro de eliminar este producto del menú?')) return;
        try {
            const res = await fetch(`http://localhost:8080/api/productos/${id}`, { method: 'DELETE' });
            if (res.ok) {
                cargarProductos();
            } else {
                alert('No se pudo eliminar.');
            }
        } catch(e) { console.error(e); }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('productoId').value;
        const payload = {
            categoria: document.getElementById('productoCategoria').value,
            nombre: document.getElementById('productoNombre').value,
            precioBase: parseFloat(document.getElementById('productoPrecio').value)
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `http://localhost:8080/api/productos/${id}` : 'http://localhost:8080/api/productos';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                cerrarModal();
                cargarProductos();
            } else {
                const text = await res.text();
                alert('Error: ' + text);
            }
        } catch (error) {
            alert("Error de conexión");
        }
    });

    btnNuevoProducto.addEventListener('click', () => abrirModal());
    btnCerrarModal.addEventListener('click', cerrarModal);

    cargarProductos();
});
