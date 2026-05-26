document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar sesión y extraer token
    const usuarioString = localStorage.getItem('usuario');
    const jwtToken = localStorage.getItem('jwtToken');

    if (!usuarioString || !jwtToken) {
        window.location.href = '/login-oauth.html'; // Ajusta esto a login-oauth.html si es necesario
        return;
    }

    const tablaBody = document.getElementById('tablaMesasBody');
    const modal = document.getElementById('mesaModal');
    const btnNuevaMesa = document.getElementById('btnNuevaMesa');
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    const form = document.getElementById('mesaForm');

    let mesasGlobal = [];

    // Función auxiliar para agregar JWT a los headers
    function getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        };
    }

    // Manejar expiración de sesión
    function handleUnauthorized() {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('usuario');
        window.location.href = '/login-oauth.html';
    }

    async function cargarMesas() {
        try {
            // CORREGIDO: 128.0.0.1 -> 127.0.0.1 y se añadieron los headers
            const res = await fetch('http://127.0.0.1:8080/api/mesas', {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (res.status === 401) {
                handleUnauthorized();
                return;
            }

            mesasGlobal = await res.json();
            renderTabla(mesasGlobal);
        } catch (error) {
            console.error("Error", error);
            tablaBody.innerHTML = '<tr><td colspan="4">Error de conexión con el servidor</td></tr>';
        }
    }

    function renderTabla(mesas) {
        tablaBody.innerHTML = '';
        mesas.forEach(m => {
            const tr = document.createElement('tr');
            
            let estadoClase = 'status';
            if (m.estado === 'DISPONIBLE') estadoClase += ' active'; // verde
            else if (m.estado === 'OCUPADA') estadoClase += ' pending'; // amarillo
            else estadoClase += ''; // gris o default
            
            tr.innerHTML = `
                <td><strong>Mesa ${m.numero}</strong></td>
                <td>${m.capacidad}</td>
                <td><span class="${estadoClase}">${m.estado}</span></td>
                <td>
                    <button class="action-btn btn-editar" data-id="${m.id}"><i class='bx bx-edit-alt'></i></button>
                    <button class="action-btn btn-eliminar" data-id="${m.id}"><i class='bx bx-trash'></i></button>
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
                eliminarMesa(id);
            });
        });
    }

    function abrirModal(id = null) {
        document.getElementById('modalTitle').innerText = id ? 'Editar Mesa' : 'Nueva Mesa';
        
        if (id) {
            const m = mesasGlobal.find(x => x.id === id);
            document.getElementById('mesaId').value = m.id;
            document.getElementById('mesaNumero').value = m.numero;
            document.getElementById('mesaCapacidad').value = m.capacidad;
            document.getElementById('mesaEstado').value = m.estado;
        } else {
            document.getElementById('mesaId').value = '';
            document.getElementById('mesaNumero').value = '';
            document.getElementById('mesaCapacidad').value = '4';
            document.getElementById('mesaEstado').value = 'DISPONIBLE';
        }
        
        modal.style.display = 'flex';
    }

    function cerrarModal() {
        modal.style.display = 'none';
        form.reset();
    }

    async function eliminarMesa(id) {
        if (!confirm('¿Seguro de eliminar esta mesa?')) return;
        try {
            const res = await fetch(`http://127.0.0.1:8080/api/mesas/${id}`, { 
                method: 'DELETE',
                headers: getAuthHeaders() // <-- Se añadieron los headers
            });

            if (res.status === 401) {
                handleUnauthorized();
                return;
            }

            if (res.ok) {
                cargarMesas();
            } else {
                alert('No se pudo eliminar.');
            }
        } catch(e) { console.error(e); }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('mesaId').value;
        const payload = {
            numero: document.getElementById('mesaNumero').value,
            capacidad: parseInt(document.getElementById('mesaCapacidad').value),
            estado: document.getElementById('mesaEstado').value
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `http://127.0.0.1:8080/api/mesas/${id}` : 'http://127.0.0.1:8080/api/mesas';

        try {
            const res = await fetch(url, {
                method: method,
                headers: getAuthHeaders(), // <-- Se añadieron los headers
                body: JSON.stringify(payload)
            });

            if (res.status === 401) {
                handleUnauthorized();
                return;
            }

            if (res.ok) {
                cerrarModal();
                cargarMesas();
            } else {
                const text = await res.text();
                alert('Error: ' + text);
            }
        } catch (error) {
            alert("Error de conexión");
        }
    });

    btnNuevaMesa.addEventListener('click', () => abrirModal());
    btnCerrarModal.addEventListener('click', cerrarModal);

    cargarMesas();
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