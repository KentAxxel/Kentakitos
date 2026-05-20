document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión
    const token = localStorage.getItem('jwtToken');
    const usuarioString = localStorage.getItem('usuario');
    if (!usuarioString || !token) {
        window.location.href = '/login-oauth.html';
        return;
    }

    const tablaBody = document.getElementById('tablaPermisosBody');
    const modal = document.getElementById('permisoModal');
    const btnNuevoPermiso = document.getElementById('btnNuevoPermiso');
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    const form = document.getElementById('permisoForm');

    let permisosGlobal = [];

    function getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    // Manejar expiración de sesión
    function handleUnauthorized() {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('permiso');
        window.location.href = '/login-oauth.html';
    }

    // Cargar Permisos
    async function cargarPermisos() {
        try {
            const res = await fetch('http://127.0.0.1:8080/api/permisos', {
                headers: getAuthHeaders()
            });
            permisosGlobal = await res.json();
            renderTabla(permisosGlobal);
        } catch (error) {
            console.error("Error", error);
            tablaBody.innerHTML = '<tr><td colspan="3">Error de conexión con el servidor</td></tr>';
        }
    }

    function renderTabla(permisos) {
        tablaBody.innerHTML = '';
        permisos.forEach(p => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${p.id}</td>
                <td><strong>${p.nombre}</strong></td>
                <td>
                    <button class="action-btn btn-editar" data-id="${p.id}"><i class='bx bx-edit-alt'></i></button>
                    <button class="action-btn btn-eliminar" data-id="${p.id}"><i class='bx bx-trash'></i></button>
                </td>
            `;
            tablaBody.appendChild(tr);
        });

        // Asignar eventos
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                abrirModal(id);
            });
        });
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                eliminarPermiso(id);
            });
        });
    }

    function abrirModal(id = null) {
        document.getElementById('modalTitle').innerText = id ? 'Editar Permiso' : 'Nuevo Permiso';
        
        if (id) {
            const p = permisosGlobal.find(x => x.id === id);
            document.getElementById('permisoId').value = p.id;
            document.getElementById('permisoNombre').value = p.nombre;
        } else {
            document.getElementById('permisoId').value = '';
            document.getElementById('permisoNombre').value = '';
        }
        
        modal.style.display = 'flex';
    }

    function cerrarModal() {
        modal.style.display = 'none';
        form.reset();
    }

    async function eliminarPermiso(id) {
        if (!confirm('¿Seguro de eliminar este Permiso? (Fallará si un Rol ya lo tiene asignado)')) return;
        try {
            const res = await fetch(`http://127.0.0.1:8080/api/permisos/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                cargarPermisos();
            } else {
                const text = await res.text();
                alert('No se pudo eliminar el permiso. \n' + text);
            }
        } catch(e) { console.error(e); }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('permisoId').value;
        const nombre = document.getElementById('permisoNombre').value.toUpperCase().trim();

        const payload = { nombre: nombre };
        const method = id ? 'PUT' : 'POST';
        const url = id ? `http://127.0.0.1:8080/api/permisos/${id}` : 'http://127.0.0.1:8080/api/permisos';

        try {
            const res = await fetch(url, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                cerrarModal();
                cargarPermisos();
            } else {
                const text = await res.text();
                alert('Error: ' + text);
            }
        } catch (error) {
            alert("Error de conexión");
        }
    });

    btnNuevoPermiso.addEventListener('click', () => abrirModal());
    btnCerrarModal.addEventListener('click', cerrarModal);

    cargarPermisos();
});
