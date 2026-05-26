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
    let permisosGlobal = [];

    // Cargar Permisos (GET)
    async function cargarPermisos() {
        try {
            const res = await fetch('http://127.0.0.1:8080/api/permisos', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                permisosGlobal = await res.json();
            }
        } catch (error) { console.error("Error al cargar permisos", error); }
    }

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
            renderCheckboxes(r.permisos || []);
        } else {
            document.getElementById('rolId').value = '';
            document.getElementById('rolNombre').value = 'ROLE_';
            renderCheckboxes([]);
        }
        
        modal.style.display = 'flex';
    }

    function renderCheckboxes(permisosAsignados) {
        const container = document.getElementById('permisosCheckboxes');
        container.innerHTML = '';
        const asignadosIds = permisosAsignados.map(p => p.id);
        
        permisosGlobal.forEach(p => {
            const isChecked = asignadosIds.includes(p.id) ? 'checked' : '';
            const div = document.createElement('div');
            div.className = 'checkbox-item';
            div.innerHTML = `
                <input type="checkbox" id="permiso_${p.id}" value="${p.id}" ${isChecked}>
                <label for="permiso_${p.id}">${p.nombre}</label>
            `;
            container.appendChild(div);
        });
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

        // Recolectar permisos seleccionados
        const checkboxes = document.querySelectorAll('#permisosCheckboxes input[type="checkbox"]:checked');
        const permisosSeleccionados = Array.from(checkboxes).map(cb => {
            return { id: parseInt(cb.value) };
        });

        const payload = { 
            nombre: nombre,
            permisos: permisosSeleccionados
        };
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

    cargarPermisos().then(() => cargarRoles());
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
            if (confirm("¿Deseas cerrar sesión?")) {
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