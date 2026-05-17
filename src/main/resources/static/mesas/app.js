document.addEventListener('DOMContentLoaded', () => {
    const usuarioString = localStorage.getItem('usuario');
    if (!usuarioString) {
        window.location.href = '/login.html';
        return;
    }

    const tablaBody = document.getElementById('tablaMesasBody');
    const modal = document.getElementById('mesaModal');
    const btnNuevaMesa = document.getElementById('btnNuevaMesa');
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    const form = document.getElementById('mesaForm');

    let mesasGlobal = [];

    async function cargarMesas() {
        try {
            const res = await fetch('http://localhost:8080/api/mesas');
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
            const res = await fetch(`http://localhost:8080/api/mesas/${id}`, { method: 'DELETE' });
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
        const url = id ? `http://localhost:8080/api/mesas/${id}` : 'http://localhost:8080/api/mesas';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

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
