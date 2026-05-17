document.addEventListener('DOMContentLoaded', () => {
    const usuarioString = localStorage.getItem('usuario');
    if (!usuarioString) {
        window.location.href = '/login.html';
        return;
    }

    const tablaBody = document.getElementById('tablaInventarioBody');
    const modal = document.getElementById('inventarioModal');
    const btnNuevoItem = document.getElementById('btnNuevoItem');
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    const form = document.getElementById('inventarioForm');

    let inventarioGlobal = [];

    async function cargarInventario() {
        try {
            const res = await fetch('http://localhost:8080/api/inventario');
            inventarioGlobal = await res.json();
            renderTabla(inventarioGlobal);
        } catch (error) {
            console.error("Error", error);
            tablaBody.innerHTML = '<tr><td colspan="5">Error de conexión con el servidor</td></tr>';
        }
    }

    function renderTabla(inventario) {
        tablaBody.innerHTML = '';
        inventario.forEach(item => {
            const tr = document.createElement('tr');
            
            // Estilo visual de advertencia si queda poco stock (ej < 5)
            const estiloAlerta = item.cantidadDisponible < 5 ? 'color: red; font-weight: bold;' : '';

            tr.innerHTML = `
                <td>${item.id}</td>
                <td><strong>${item.ingrediente}</strong></td>
                <td style="${estiloAlerta}">${item.cantidadDisponible}</td>
                <td>${item.unidadMedida}</td>
                <td>
                    <button class="action-btn btn-editar" data-id="${item.id}"><i class='bx bx-edit-alt'></i></button>
                    <button class="action-btn btn-eliminar" data-id="${item.id}"><i class='bx bx-trash'></i></button>
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
                eliminarItem(id);
            });
        });
    }

    function abrirModal(id = null) {
        document.getElementById('modalTitle').innerText = id ? 'Editar Ingrediente' : 'Nuevo Ingrediente';
        
        if (id) {
            const item = inventarioGlobal.find(x => x.id === id);
            document.getElementById('itemId').value = item.id;
            document.getElementById('itemNombre').value = item.ingrediente;
            document.getElementById('itemCantidad').value = item.cantidadDisponible;
            document.getElementById('itemUnidad').value = item.unidadMedida;
        } else {
            document.getElementById('itemId').value = '';
            document.getElementById('itemNombre').value = '';
            document.getElementById('itemCantidad').value = '0';
            document.getElementById('itemUnidad').value = 'KG';
        }
        
        modal.style.display = 'flex';
    }

    function cerrarModal() {
        modal.style.display = 'none';
        form.reset();
    }

    async function eliminarItem(id) {
        if (!confirm('¿Seguro de eliminar este ingrediente del inventario?')) return;
        try {
            const res = await fetch(`http://localhost:8080/api/inventario/${id}`, { method: 'DELETE' });
            if (res.ok) {
                cargarInventario();
            } else {
                alert('No se pudo eliminar.');
            }
        } catch(e) { console.error(e); }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('itemId').value;
        const ingrediente = document.getElementById('itemNombre').value;
        const cantidad = parseFloat(document.getElementById('itemCantidad').value);
        const unidad = document.getElementById('itemUnidad').value;

        const payload = { ingrediente, cantidadDisponible: cantidad, unidadMedida: unidad };
        const method = id ? 'PUT' : 'POST';
        const url = id ? `http://localhost:8080/api/inventario/${id}` : 'http://localhost:8080/api/inventario';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                cerrarModal();
                cargarInventario();
            } else {
                const text = await res.text();
                alert('Error: ' + text);
            }
        } catch (error) {
            alert("Error de conexión");
        }
    });

    btnNuevoItem.addEventListener('click', () => abrirModal());
    btnCerrarModal.addEventListener('click', cerrarModal);

    cargarInventario();
});
