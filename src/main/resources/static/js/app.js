document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar sesión con JWT token
    const jwtToken = localStorage.getItem('jwtToken');
    const usuarioString = localStorage.getItem('usuario');

    if (!jwtToken || !usuarioString) {
        window.location.href = 'login-oauth.html';
        return;
    }

    const usuarioLogueado = JSON.parse(usuarioString);
    console.log("Sesión iniciada como:", usuarioLogueado.username);

    // Función auxiliar para agregar JWT a los headers
    function getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        };
    }

    // Dropdown Profile logic
    const btnProfileDropdown = document.getElementById('btnProfileDropdown');
    const profileDropdown = document.getElementById('profileDropdown');
    const headerUsername = document.getElementById('headerUsername');
    
    if (headerUsername && usuarioLogueado) {
        headerUsername.textContent = usuarioLogueado.nombreCompleto || usuarioLogueado.username;
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
                try {
                    await fetch('http://127.0.0.1:8080/api/auth/logout', {
                        method: 'POST',
                        headers: getAuthHeaders()
                    });
                } catch(e) { console.error("Error al cerrar sesión", e); }
                
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('usuario');
                window.location.href = '/login-oauth.html';
            }
        });
    }

    // --- LÓGICA DE USUARIOS (CRUD) ---
    const tablaBody = document.getElementById('tablaUsuariosBody');
    const modal = document.getElementById('usuarioModal');
    const btnNuevoUsuario = document.getElementById('btnNuevoUsuario');
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    const form = document.getElementById('usuarioForm');
    const selectRol = document.getElementById('userRol');

    let usuariosGlobal = [];

    // Cargar Roles para el select
    async function cargarRoles() {
        try {
            const res = await fetch('http://127.0.0.1:8080/api/roles', {
                headers: getAuthHeaders()
            });

            if (res.status === 401) {
                handleUnauthorized();
                return;
            }

            const roles = await res.json();
            selectRol.innerHTML = '';
            roles.forEach(rol => {
                const option = document.createElement('option');
                option.value = rol.id;
                option.textContent = rol.nombre;
                selectRol.appendChild(option);
            });
        } catch (error) {
            console.error("Error cargando roles", error);
        }
    }

    // Obtener y renderizar usuarios
    async function cargarUsuarios() {
        try {
            // CORREGIDO: Faltaba el '1' en la IP
            const res = await fetch('http://127.0.0.1:8080/api/usuarios', {
                headers: getAuthHeaders()
            });

            if (res.status === 401) {
                handleUnauthorized();
                return;
            }

            usuariosGlobal = await res.json();
            renderTabla(usuariosGlobal);
        } catch (error) {
            console.error("Error cargando usuarios", error);
            tablaBody.innerHTML = '<tr><td colspan="5">Error de conexión con el servidor</td></tr>';
        }
    }

    function renderTabla(usuarios) {
        tablaBody.innerHTML = '';
        usuarios.forEach(u => {
            const tr = document.createElement('tr');

            const estadoClase = u.activo ? 'status active' : 'status pending';
            const estadoTexto = u.activo ? 'Activo' : 'Inactivo';

            tr.innerHTML = `
                <td>${u.nombreCompleto}</td>
                <td>@${u.username}</td>
                <td>${u.rol.nombre}</td>
                <td><span class="${estadoClase}">${estadoTexto}</span></td>
                <td>
                    <button class="action-btn btn-editar" data-id="${u.id}"><i class='bx bx-edit-alt'></i></button>
                    <button class="action-btn btn-eliminar" data-id="${u.id}"><i class='bx bx-trash'></i></button>
                </td>
            `;
            tablaBody.appendChild(tr);
        });

        // Eventos a botones dinámicos
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                abrirModal(id);
            });
        });

        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                eliminarUsuario(id);
            });
        });
    }

    function abrirModal(id = null) {
        document.getElementById('modalTitle').innerText = id ? 'Editar Usuario' : 'Nuevo Usuario';

        if (id) {
            const u = usuariosGlobal.find(x => x.id === id);
            document.getElementById('userId').value = u.id;
            document.getElementById('userNombre').value = u.nombreCompleto;
            document.getElementById('userUsername').value = u.username;
            document.getElementById('userUsername').disabled = true; // No permitir cambiar username editando
            document.getElementById('userPassword').value = '';
            document.getElementById('userRol').value = u.rol.id;
            document.getElementById('userEstado').value = u.activo.toString();
        } else {
            document.getElementById('userId').value = '';
            document.getElementById('userNombre').value = '';
            document.getElementById('userUsername').value = '';
            document.getElementById('userUsername').disabled = false;
            document.getElementById('userPassword').value = '';
            document.getElementById('userEstado').value = 'true';
        }

        modal.style.display = 'flex';
    }

    function cerrarModal() {
        modal.style.display = 'none';
        form.reset();
    }

    // Eliminar Usuario
    async function eliminarUsuario(id) {
        if (!confirm('¿Estás seguro de eliminar este usuario permanentemente?')) return;
        try {
            const res = await fetch(`http://127.0.0.1:8080/api/usuarios/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (res.status === 401) {
                handleUnauthorized();
                return;
            }

            if (res.ok) {
                cargarUsuarios();
            } else {
                alert('No se pudo eliminar');
            }
        } catch(e) {
            console.error(e);
        }
    }

    // Guardar (Crear o Editar)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('userId').value;
        const nombre = document.getElementById('userNombre').value;
        const username = document.getElementById('userUsername').value;
        const password = document.getElementById('userPassword').value;
        const rolId = document.getElementById('userRol').value;
        const activo = document.getElementById('userEstado').value === 'true';

        const payload = {
            nombreCompleto: nombre,
            username: username,
            password: password,
            activo: activo,
            rol: { id: parseInt(rolId) }
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `http://127.0.0.1:8080/api/usuarios/${id}` : 'http://127.0.0.1:8080/api/usuarios';

        try {
            const res = await fetch(url, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (res.status === 401) {
                handleUnauthorized();
                return;
            }

            if (res.ok) {
                cerrarModal();
                cargarUsuarios();
            } else {
                const text = await res.text();
                alert('Error al guardar: ' + text);
            }
        } catch (error) {
            console.error("Error", error);
            alert("Error de conexión al servidor");
        }
    });

    // Manejar errores de autenticación
    function handleUnauthorized() {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('usuario');
        window.location.href = 'login-oauth.html';
    }

    btnNuevoUsuario.addEventListener('click', () => abrirModal());
    btnCerrarModal.addEventListener('click', cerrarModal);

    // Inicializar
    cargarRoles();
    cargarUsuarios();
});