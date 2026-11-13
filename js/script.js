const usuariosBase = [
    { email: "admin@taller.com", password: "1234", rol: "Administrador", nombre: "Carlos Admin", telefono: "0999999999", vehiculo: null },
    { email: "cliente1@taller.com", password: "1234", rol: "Cliente", nombre: "María Pérez", telefono: "0988888888", vehiculo: { placa: "PAA-123", marca: "Chevrolet", modelo: "Aveo / Sail", anio: 2020 } },
    { email: "cliente2@taller.com", password: "1234", rol: "Cliente", nombre: "Juan Gómez", telefono: "0977777777", vehiculo: null }
];

let usuarios = JSON.parse(localStorage.getItem("usuarios")) || usuariosBase;
if (!localStorage.getItem("usuarios")) {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];
let usuarioActual = JSON.parse(localStorage.getItem("usuarioActual")) || null;

document.addEventListener("DOMContentLoaded", () => {
    verificarEstadoSesion();
    const inputFecha = document.getElementById("fechaCita");
    if (inputFecha) {
        const hoy = new Date().toISOString().split('T')[0];
        inputFecha.min = hoy;
    }
});

function formatearPlaca(input) {
    let valor = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (valor.length > 3) {
        valor = valor.slice(0, 3) + '-' + valor.slice(3, 7);
    }
    input.value = valor;
}

function mostrarSeccion(id) {
    ['inicio', 'servicios', 'acerca', 'login', 'cliente', 'admin'].forEach(sec => {
        const el = document.getElementById(`seccion-${sec}`);
        if (el) el.classList.add('d-none');
    });
    
    const destino = document.getElementById(`seccion-${id}`);
    if (destino) destino.classList.remove('d-none');
    
    if (id === 'login') {
        alternarAuth('login');
    }

    if (id === 'cliente') {
        configurarFormularioSolicitud();
    }
}

function configurarFormularioSolicitud() {
    const containerAdmin = document.getElementById("adminSelectClienteContainer");
    const selectCliente = document.getElementById("adminSelectCliente");
    const titulo = document.getElementById("tituloPortal");
    const contenedorMis = document.getElementById("contenedorMisSolicitudes");

    if (usuarioActual && usuarioActual.rol === "Administrador") {
        containerAdmin.classList.remove("d-none");
        selectCliente.innerHTML = "";
        const soloClientes = usuarios.filter(u => u.rol === "Cliente");
        soloClientes.forEach(c => {
            selectCliente.innerHTML += `<option value="${c.email}">${c.nombre} (${c.email})</option>`;
        });
        titulo.innerText = "Panel de Registro de Turnos (Administrador)";
        contenedorMis.classList.add("d-none");
        cargarVehiculoClienteSeleccionado();
    } else {
        containerAdmin.classList.add("d-none");
        titulo.innerText = "Portal de Solicitud de Mantenimiento";
        contenedorMis.classList.remove("d-none");
        if (usuarioActual) {
            cargarTablaCliente();
            autocompletarVehiculo(usuarioActual);
        }
    }
}

// Autocompletar vehículo del usuario si ya lo tiene registrado previamente
function autocompletarVehiculo(cliente) {
    if (cliente && cliente.vehiculo) {
        document.getElementById("vehiculoPlaca").value = cliente.vehiculo.placa || "";
        document.getElementById("vehiculoMarca").value = cliente.vehiculo.marca || "";
        document.getElementById("vehiculoModelo").value = cliente.vehiculo.modelo || "";
        document.getElementById("vehiculoAnio").value = cliente.vehiculo.anio || "";
    }
}

// Cuando el admin cambia de cliente en el selector superior
function cargarVehiculoClienteSeleccionado() {
    const emailSeleccionado = document.getElementById("adminSelectCliente").value;
    const cliEncontrado = usuarios.find(u => u.email === emailSeleccionado);
    if (cliEncontrado) {
        autocompletarVehiculo(cliEncontrado);
    }
}

function alternarAuth(vista) {
    const bloqueLogin = document.getElementById("bloqueLogin");
    const bloqueRegistro = document.getElementById("bloqueRegistro");
    if (vista === 'registro') {
        bloqueLogin.classList.add("d-none");
        bloqueRegistro.classList.remove("d-none");
    } else {
        bloqueRegistro.classList.add("d-none");
        bloqueLogin.classList.remove("d-none");
    }
}

function verificarEstadoSesion() {
    const navLogin = document.getElementById("navLogin");
    const navDashboard = document.getElementById("navDashboard");
    const navLogout = document.getElementById("navLogout");
    const navSolicitar = document.getElementById("navSolicitar");
    
    const menuInicio = document.getElementById("menuInicio");
    const menuServicios = document.getElementById("menuServicios");
    const menuAcerca = document.getElementById("menuAcerca");

    if (usuarioActual) {
        navLogin.classList.add("d-none");
        navDashboard.classList.remove("d-none");
        navLogout.classList.remove("d-none");
        navSolicitar.classList.remove("d-none");

        if (usuarioActual.rol === "Administrador") {
            if (menuInicio) menuInicio.classList.add("d-none");
            if (menuServicios) menuServicios.classList.add("d-none");
            if (menuAcerca) menuAcerca.classList.add("d-none");

            navDashboard.innerText = "Panel Admin";
            mostrarSeccion("admin");
            cargarTablaAdmin();
        } else {
            if (menuInicio) menuInicio.classList.remove("d-none");
            if (menuServicios) menuServicios.classList.remove("d-none");
            if (menuAcerca) menuAcerca.classList.remove("d-none");

            navDashboard.innerText = "Mi Panel";
            mostrarSeccion("cliente");
            document.getElementById("saludoCliente").innerText = `Perfil de Cliente: ${usuarioActual.nombre} | Tel: ${usuarioActual.telefono || 'N/A'} (${usuarioActual.email})`;
            cargarTablaCliente();
            autocompletarVehiculo(usuarioActual);
        }
    } else {
        if (menuInicio) menuInicio.classList.remove("d-none");
        if (menuServicios) menuServicios.classList.remove("d-none");
        if (menuAcerca) menuAcerca.classList.remove("d-none");

        navLogin.classList.remove("d-none");
        navDashboard.classList.add("d-none");
        navLogout.classList.add("d-none");
        navSolicitar.classList.add("d-none");
        mostrarSeccion("inicio");
    }
}

function verificarAccesoSolicitud() {
    if (!usuarioActual) {
        Swal.fire({
            icon: 'info',
            title: 'Inicia sesión',
            text: 'Debes iniciar sesión para solicitar un mantenimiento.'
        });
        mostrarSeccion('login');
    } else {
        mostrarSeccion('cliente');
    }
}

function irAlDashboard() {
    if (!usuarioActual) return;
    if (usuarioActual.rol === "Administrador") {
        mostrarSeccion("admin");
        cargarTablaAdmin();
    } else {
        mostrarSeccion("cliente");
        cargarTablaCliente();
    }
}

function registrarUsuario(event) {
    event.preventDefault();
    const nombre = document.getElementById("regNombre").value.trim();
    const telefono = document.getElementById("regTelefono").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value.trim();

    if (!/^\d{10}$/.test(telefono)) {
        Swal.fire('Teléfono inválido', 'Ingresa un número de teléfono válido de 10 dígitos.', 'warning');
        return;
    }

    const existe = usuarios.find(u => u.email === email);
    if (existe) {
        Swal.fire('Correo en uso', 'Este correo electrónico ya está registrado.', 'error');
        return;
    }

    const nuevoUsuario = { email, password, rol: "Cliente", nombre, telefono, vehiculo: null };
    usuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    Swal.fire('¡Cuenta creada!', 'Ahora puedes iniciar sesión.', 'success');
    document.getElementById("formRegistro").reset();
    alternarAuth('login');
}

function iniciarSesion(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value.trim();

    const encontrado = usuarios.find(u => u.email === email && u.password === password);

    if (encontrado) {
        usuarioActual = encontrado;
        localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual));
        
        Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            text: `Acceso concedido como ${encontrado.rol}`,
            timer: 1500,
            showConfirmButton: false
        });

        document.getElementById("formLogin").reset();
        verificarEstadoSesion();
    } else {
        Swal.fire('Acceso Denegado', 'Credenciales incorrectas.', 'error');
    }
}

function cerrarSesion() {
    usuarioActual = null;
    localStorage.removeItem("usuarioActual");
    verificarEstadoSesion();
    Swal.fire({ icon: 'info', title: 'Sesión cerrada', timer: 1000, showConfirmButton: false });
}

function registrarSolicitud(event) {
    event.preventDefault();

    let clienteEmailTarget = usuarioActual.email;
    let clienteNombreTarget = usuarioActual.nombre;
    let clienteObj = usuarioActual;

    if (usuarioActual.rol === "Administrador") {
        const emailSeleccionado = document.getElementById("adminSelectCliente").value;
        const cliEncontrado = usuarios.find(u => u.email === emailSeleccionado);
        if (cliEncontrado) {
            clienteEmailTarget = cliEncontrado.email;
            clienteNombreTarget = cliEncontrado.nombre;
            clienteObj = cliEncontrado;
        }
    }

    const placa = document.getElementById("vehiculoPlaca").value.trim().toUpperCase();
    const marca = document.getElementById("vehiculoMarca").value;
    const modelo = document.getElementById("vehiculoModelo").value;
    const anio = parseInt(document.getElementById("vehiculoAnio").value);
    const km = parseInt(document.getElementById("vehiculoKm").value);
    const servicio = document.getElementById("tipoServicio").value;
    const fecha = document.getElementById("fechaCita").value;
    const hora = document.getElementById("horaCita").value;
    
    const transmision = document.querySelector('input[name="transmision"]:checked').value;
    
    let extras = [];
    if (document.getElementById("checkLavado").checked) extras.push("Lavado general");
    if (document.getElementById("checkAlineacion").checked) extras.push("Alineación y balanceo");

    const observaciones = document.getElementById("observaciones").value.trim();

    const regexPlaca = /^[A-Z]{3}-\d{3,4}$/;
    if (!regexPlaca.test(placa)) {
        Swal.fire('Error de validación', 'La placa debe tener formato válido ecuatoriano (Ej: PAA-123).', 'warning');
        return;
    }

    const hoyStr = new Date().toISOString().split('T')[0];
    if (fecha < hoyStr) {
        Swal.fire('Error de validación', 'No puedes seleccionar una fecha anterior al día de hoy.', 'warning');
        return;
    }

    // Guardar o actualizar el vehículo en el perfil del cliente para futuras solicitudes
    clienteObj.vehiculo = { placa, marca, modelo, anio };
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    if (usuarioActual.email === clienteObj.email) {
        usuarioActual = clienteObj;
        localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual));
    }

    const nuevaSolicitud = {
        id: Date.now(),
        clienteEmail: clienteEmailTarget,
        clienteNombre: clienteNombreTarget,
        placa,
        vehiculo: `${marca} ${modelo} (${anio}) - Transmisión: ${transmision}`,
        servicio: `${servicio} ${extras.length > 0 ? '(' + extras.join(', ') + ')' : ''}`,
        fecha,
        hora,
        observaciones,
        estado: "Pendiente"
    };

    solicitudes.push(nuevaSolicitud);
    localStorage.setItem("solicitudes", JSON.stringify(solicitudes));

    Swal.fire('¡Éxito!', 'Solicitud registrada correctamente.', 'success');
    document.getElementById("formSolicitud").reset();
    document.getElementById("fechaCita").min = new Date().toISOString().split('T')[0];

    if (usuarioActual.rol === "Administrador") {
        mostrarSeccion("admin");
        cargarTablaAdmin();
    } else {
        cargarTablaCliente();
        autocompletarVehiculo(usuarioActual);
    }
}

function cargarTablaCliente() {
    const tbody = document.getElementById("tablaMisSolicitudes");
    tbody.innerHTML = "";

    const misSolicitudes = solicitudes.filter(s => s.clienteEmail === usuarioActual.email);

    if (misSolicitudes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No tienes solicitudes registradas.</td></tr>`;
        return;
    }

    misSolicitudes.forEach(s => {
        tbody.innerHTML += `
            <tr>
                <td>${s.id.toString().slice(-4)}</td>
                <td>${s.placa}</td>
                <td>${s.vehiculo}</td>
                <td>${s.servicio}</td>
                <td>${s.fecha} (${s.hora})</td>
                <td><span class="badge bg-secondary">${s.estado}</span></td>
            </tr>
        `;
    });
}

function cargarTablaAdmin() {
    const tbody = document.getElementById("tablaAdminSolicitudes");
    tbody.innerHTML = "";

    if (solicitudes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No hay solicitudes en el sistema.</td></tr>`;
        return;
    }

    solicitudes.forEach(s => {
        tbody.innerHTML += `
            <tr>
                <td>${s.id.toString().slice(-4)}</td>
                <td>${s.clienteNombre} <br><small class="text-muted">${s.clienteEmail}</small></td>
                <td>${s.placa}</td>
                <td>
                    <strong>${s.servicio}</strong><br>
                    📅 ${s.fecha} - ⏰ ${s.hora}
                </td>
                <td>
                    <select class="form-select form-select-sm" onchange="cambiarEstado(${s.id}, this.value)">
                        <option value="Pendiente" ${s.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="En revisión" ${s.estado === 'En revisión' ? 'selected' : ''}>En revisión</option>
                        <option value="En proceso" ${s.estado === 'En proceso' ? 'selected' : ''}>En proceso</option>
                        <option value="Finalizado" ${s.estado === 'Finalizado' ? 'selected' : ''}>Finalizado</option>
                        <option value="Cancelado" ${s.estado === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-warning btn-sm mb-1" onclick="editarSolicitud(${s.id})">Editar</button>
                    <button class="btn btn-danger btn-sm mb-1" onclick="eliminarSolicitud(${s.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function cambiarEstado(id, nuevoEstado) {
    if (usuarioActual.rol !== "Administrador") return;
    const index = solicitudes.findIndex(s => s.id === id);
    if (index !== -1) {
        solicitudes[index].estado = nuevoEstado;
        localStorage.setItem("solicitudes", JSON.stringify(solicitudes));
        Swal.fire({
            icon: 'success',
            title: 'Estado actualizado',
            toast: true,
            position: 'top-end',
            timer: 1500,
            showConfirmButton: false
        });
    }
}

function editarSolicitud(id) {
    const s = solicitudes.find(item => item.id === id);
    if (!s) return;

    Swal.fire({
        title: 'Editar Turno / Solicitud',
        html: `
            <div class="text-start">
                <label class="form-label fw-bold">Cliente asignado:</label>
                <input type="text" class="form-control mb-2 bg-light text-muted" value="${s.clienteNombre} (${s.clienteEmail})" disabled>
                <label class="form-label">Placa:</label>
                <input type="text" id="swalPlaca" class="form-control mb-2 text-uppercase" maxlength="8" oninput="formatearPlaca(this)" value="${s.placa}">
                <label class="form-label">Fecha de Cita:</label>
                <input type="date" id="swalFecha" class="form-control mb-2" value="${s.fecha}">
                <label class="form-label">Hora de Atención:</label>
                <select id="swalHora" class="form-control mb-2">
                    <option value="08:00 AM" ${s.hora === '08:00 AM' ? 'selected' : ''}>08:00 AM</option>
                    <option value="09:00 AM" ${s.hora === '09:00 AM' ? 'selected' : ''}>09:00 AM</option>
                    <option value="10:00 AM" ${s.hora === '10:00 AM' ? 'selected' : ''}>10:00 AM</option>
                    <option value="11:00 AM" ${s.hora === '11:00 AM' ? 'selected' : ''}>11:00 AM</option>
                    <option value="02:00 PM" ${s.hora === '02:00 PM' ? 'selected' : ''}>02:00 PM</option>
                    <option data-v="${s.id}" value="03:00 PM" ${s.hora === '03:00 PM' ? 'selected' : ''}>03:00 PM</option>
                    <option value="04:00 PM" ${s.hora === '04:00 PM' ? 'selected' : ''}>04:00 PM</option>
                </select>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Guardar Cambios',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return {
                placa: document.getElementById('swalPlaca').value.trim().toUpperCase(),
                fecha: document.getElementById('swalFecha').value,
                hora: document.getElementById('swalHora').value
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const datos = result.value;
            const regexPlaca = /^[A-Z]{3}-\d{3,4}$/;
            if (!regexPlaca.test(datos.placa)) {
                Swal.fire('Error', 'Formato de placa inválido (Ej: PAA-123)', 'error');
                return;
            }

            s.placa = datos.placa;
            s.fecha = datos.fecha;
            s.hora = datos.hora;

            localStorage.setItem("solicitudes", JSON.stringify(solicitudes));
            cargarTablaAdmin();
            Swal.fire('¡Actualizado!', 'El turno ha sido modificado exitosamente.', 'success');
        }
    });
}

function eliminarSolicitud(id) {
    if (usuarioActual.rol !== "Administrador") return;

    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡Esta acción eliminará la solicitud de forma permanente!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            solicitudes = solicitudes.filter(item => item.id !== id);
            localStorage.setItem("solicitudes", JSON.stringify(solicitudes));
            cargarTablaAdmin();
            Swal.fire('¡Eliminado!', 'La solicitud ha sido eliminada.', 'success');
        }
    });
}
