document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar sesión y obtener el token
    const usuarioString = localStorage.getItem('usuario');
    const token = localStorage.getItem('jwtToken'); // <-- Extraemos el token
    
    // Si no hay usuario o no hay token, lo mandamos al login
    if (!usuarioString || !token) {
        window.location.href = '/login-oauth.html';
        return;
    }

    const tablaBody = document.getElementById('tablaRolesBody');
    const modal = document.getElementById('rolModal');
    const btnNuevoRol = document.getElementById('btnNuevoRol');
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    const form = document.getElementById('rolForm');

    let rolesGlobal = [];

    // Cargar Roles (GET)
    async function cargarRoles() {
        try {
            const res = await fetch('http://127.0.0.1:8080/api/roles', {
                method: 'GET',
                headers: {
                    // <-- ENVIAMOS EL TOKEN AQUÍ
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            if (!res.ok) throw new Error('No autorizado o error del servidor');
            
            rolesGlobal = await res.json();
            renderTabla(rolesGlobal);
        } catch (error) {
            console.error("Error", error);
            tablaBody.innerHTML = '<tr><td colspan="4">Error al cargar datos o sesión expirada</td></tr>';
        }
    }

    function renderTabla(roles) {
        tablaBody.innerHTML = '';
        roles.forEach(r => {
            const tr = document.createElement('tr');
            
            // Extraer nombres de permisos
            const permisosNombres = r.permisos && r.permisos.length > 0 
                ? r.permisos.map(p => p.nombre).join(', ') 
                : 'Ninguno';

            tr.innerHTML = `
                <td>${r.id}</td>
                <td><strong>${r.nombre}</strong></td>
                <td><small style="color: gray;">${permisosNombres}</small></td>
                <td>
                    <button class="action-btn btn-editar" data-id="${r.id}"><i class='bx bx-edit-alt'></i></button>
                    <button class="action-btn btn-eliminar" data-id="${r.id}"><i class='bx bx-trash'></i></button>
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
                eliminarRol(id);
            });
        });
    }

    function abrirModal(id = null) {
        document.getElementById('modalTitle').innerText = id ? 'Editar Rol' : 'Nuevo Rol';
        
        if (id) {
            const r = rolesGlobal.find(x => x.id === id);
            document.getElementById('rolId').value = r.id;
            document.getElementById('rolNombre').value = r.nombre;
        } else {
            document.getElementById('rolId').value = '';
            document.getElementById('rolNombre').value = 'ROLE_';
        }
        
        modal.style.display = 'flex';
    }

    function cerrarModal() {
        modal.style.display = 'none';
        form.reset();
    }

    // Eliminar Rol (DELETE)
    async function eliminarRol(id) {
        if (!confirm('¿Seguro de eliminar este Rol? (Asegúrate de que ningún usuario lo esté usando)')) return;
        try {
            const res = await fetch(`http://127.0.0.1:8080/api/roles/${id}`, { 
                method: 'DELETE',
                headers: {
                    // <-- ENVIAMOS EL TOKEN AQUÍ
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            if (res.ok) {
                cargarRoles();
            } else {
                alert('No se pudo eliminar el rol. Verifica permisos o dependencias.');
            }
        } catch(e) { console.error(e); }
    }

    // Crear / Editar Rol (POST / PUT)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('rolId').value;
        const nombre = document.getElementById('rolNombre').value;

        const payload = { nombre: nombre };
        const method = id ? 'PUT' : 'POST';
        const url = id ? `http://127.0.0.1:8080/api/roles/${id}` : 'http://127.0.0.1:8080/api/roles';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    // <-- ENVIAMOS EL TOKEN AQUÍ
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                cerrarModal();
                cargarRoles();
            } else {
                const text = await res.text();
                alert('Error: ' + text);
            }
        } catch (error) {
            alert("Error de conexión");
        }
    });

    btnNuevoRol.addEventListener('click', () => abrirModal());
    btnCerrarModal.addEventListener('click', cerrarModal);

    cargarRoles();
});