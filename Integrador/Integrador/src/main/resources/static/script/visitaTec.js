let calendario = null;

document.addEventListener("DOMContentLoaded", () => {

    inicializarCalendario();
    cargarVisitas();

});

function inicializarCalendario() {

    const calendarEl = document.getElementById("calendarioVisitas");

    calendario = new FullCalendar.Calendar(calendarEl, {

        locale: "es",

        initialView: "dayGridMonth",

        height: "auto",

        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek"
        },

        events: [],

     eventClick: function(info) {

    const fecha = info.event.startStr.substring(0, 10);

    abrirModalDia(fecha);

}

    });

    calendario.render();

}

function cargarVisitas() {

    fetch("/api/visitas")
        .then(res => res.json())
        .then(data => {

            if (!Array.isArray(data)) return;

            const pendientesContainer = document.getElementById("visitasPendientes");

            pendientesContainer.innerHTML = "";

            calendario.removeAllEvents();

            data.forEach(v => {

                const estado = (v.estado || "").trim().toUpperCase();

                if (estado === "FINALIZADA")
                    return;

                // PENDIENTES 

                if (estado === "PENDIENTE") {

                    const card = `
                    <div class="col-12 col-md-6 col-lg-4">

                        <div class="glass-card shadow p-3">

                            <h5>
                                <i class="fa-solid fa-user" style="color:#1e88e5;"></i>
                                <span style="color:#1e88e5;font-weight:600;">
                                    ${v.usuario}
                                </span>
                            </h5>

                            <p style="color:#f9a825;font-weight:500;">
                                <i class="fa-solid fa-phone"></i>
                                ${v.usuarioTelefono}
                            </p>

                            <p style="color:#43a047;font-weight:500;">
                                <i class="fa-solid fa-calendar-days"></i>
                                ${v.fechaSolicitud}
                            </p>

                            <p>
                                <i class="fa-solid fa-flag"></i>
                                Estado:
                                <span style="color:#fdd835;font-weight:700;">
                                    ${v.estado}
                                </span>
                            </p>

                            <button class="btn-programar"
                            onclick="abrirModal(${v.id}, '${v.usuarioTelefono}', '${v.usuario}')">

                                <i class="fa-solid fa-calendar-plus"></i>

                                PROGRAMAR VISITA

                            </button>


                            <button class="btn btn-danger w-100 mt-2"
    onclick="eliminarVisita(${v.id})">

    <i class="fa-solid fa-trash"></i>
    ELIMINAR SOLICITUD

</button>

                        </div>

                    </div>
                    `;

                    pendientesContainer.innerHTML += card;

                }

                // CALENDARIO

                if (estado === "PROGRAMADA" || estado === "REPROGRAMADA") {
console.log("VISITA COMPLETA:", v);
            calendario.addEvent({

    id: v.id,

    title: v.usuario,

    start: v.fechaProgramada,

    allDay: true,

    backgroundColor: estado === "REPROGRAMADA"
        ? "#ff5722"
        : "#ff9800",

    borderColor: estado === "REPROGRAMADA"
        ? "#000000"
        : "#ff9800",

    textColor: "#fff",

    extendedProps: {

        id: v.id,
        usuario: v.usuario,
        telefono: v.usuarioTelefono,
        estado: v.estado,

        fechaSolicitud: v.fechaSolicitud,
        fechaProgramada: v.fechaProgramada,

        especialista: v.especialista ?? "No asignado",
        direccion: v.direccion ?? "No registrada",

        motivo: v.motivo ?? "Sin motivo"

        
    }
    

});

                }

            });

        });

}

//aparecer modal con infromacion de reprogramadows
function abrirModalDia(fecha) {

    const eventos = calendario.getEvents().filter(e => {
        return e.startStr.substring(0, 10) === fecha;
    });

    const contenedor = document.getElementById("contenidoVisitasDia");

    contenedor.innerHTML = "";

    if (eventos.length === 0) {
        contenedor.innerHTML = `
            <div class="alert alert-info text-center">
                No hay visitas para este día
            </div>
        `;
    }

    eventos.forEach(e => {

        const v = e.extendedProps;
contenedor.innerHTML += `

<div class="card shadow-sm mb-3 border-8 bg-dark border-warning">

    <!-- HEADER -->
    <div class="card-header bg-warning border-bottom">

        <h5 class="mb-0 text-dark fw-bold d-flex align-items-center gap-2">

            <i class="bi bi-person-circle text-primary fs-5"></i>

            ${v.usuario}

        </h5>

    </div>

    <!-- BODY -->
    <div class="card-body bg-dark text-white">

        <div class="row">

            <!-- IZQUIERDA -->
            <div class="col-md-6">

                <p class="mb-2">
                    <i class="bi bi-hash text-secondary"></i>
                    <strong>ID:</strong> ${v.id}
                </p>

                <p class="mb-2">
                    <i class="bi bi-telephone text-success"></i>
                    <strong>Teléfono:</strong> ${v.telefono}
                </p>

                <p class="mb-2">
                    <i class="bi bi-person-badge text-primary"></i>
                    <strong>Especialista:</strong> ${v.especialista ?? "No asignado"}
                </p>

                <p class="mb-2">
                    <i class="bi bi-flag text-warning"></i>
                    <strong>Estado:</strong> ${v.estado}
                </p>

                <p class="mb-2">
                    <i class="bi bi-chat-left-text text-info"></i>
                    <strong>Motivo:</strong> ${v.motivo ?? "Sin motivo"}
                </p>

            </div>

            <!-- DERECHA -->
            <div class="col-md-6">

                <p class="mb-2">
                    <i class="bi bi-calendar-event text-success"></i>
                    <strong>Solicitud:</strong>
                    ${v.fechaSolicitud ?? "No registrada"}
                </p>

                <p class="mb-2">
                    <i class="bi bi-calendar-check text-warning"></i>
                    <strong>Programada:</strong>
                    ${v.fechaProgramada ?? "No asignada"}
                </p>

                <p class="mb-2">
                    <i class="bi bi-geo-alt text-danger"></i>
                    <strong>Dirección:</strong>
                    ${v.direccion ?? "No registrada"}
                </p>

            </div>

        </div>

        <hr class="my-3">

        <!-- BOTÓN -->
        <div class="text-end">

            <button class="btn btn-danger btn-sm"
                onclick="finalizarVisita(${v.id})">

                <i class="bi bi-check-circle"></i>
                Finalizar visita

            </button>

        </div>

    </div>

</div>

`;
    });

    const modal = new bootstrap.Modal(
        document.getElementById("modalVisitasDia")
    );

    modal.show();

}

//abrir nmodal de visitya tecnica
function abrirModal(id, telefono, usuario) {

    document.getElementById("visitaId").value = id;
    document.getElementById("nombreUsuario").value = usuario;
    document.getElementById("telefonoUsuario").value = telefono;

    const modal = new bootstrap.Modal(
        document.getElementById("visitaModal")
    );

    modal.show();
}


//alertas
function mostrarAlerta(mensaje, tipo = "success") {

    const colores = {
        success: "alert-success",
        error: "alert-danger",
        warning: "alert-warning",
        info: "alert-info"
    };

    const alertDiv = document.createElement("div");

    alertDiv.className = `alert ${colores[tipo]} alert-dismissible fade show shadow`;
    alertDiv.role = "alert";

    alertDiv.innerHTML = `
        <strong>${mensaje}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.getElementById("alertContainer").appendChild(alertDiv);

    // auto cerrar en 3 segundos
    setTimeout(() => {
        alertDiv.classList.remove("show");
        alertDiv.classList.add("hide");
        alertDiv.remove();
    }, 3000);
}


//enviat pedticion bakend

function guardarVisita() {

    const id = document.getElementById("visitaId").value;

    const fecha = document.getElementById("fechaVisita").value;
    const especialista = document.getElementById("especialista").value.trim();
    const motivo = document.getElementById("motivo").value.trim();
    const direccion = document.getElementById("direccion").value.trim();

    if (!id) {
        mostrarAlerta("Visita no identificada", "error");
        return;
    }

    if (!fecha) {
        mostrarAlerta("Debes seleccionar una fecha", "warning");
        return;
    }

    const fechaSeleccionada = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) {
        mostrarAlerta("No puedes programar fechas pasadas", "error");
        return;
    }

    if (!especialista || especialista.length < 3) {
        mostrarAlerta("Especialista inválido", "warning");
        return;
    }

    if (!motivo || motivo.length < 3) {
        mostrarAlerta("Debes ingresar un motivo", "warning");
        return;
    }

    if (!direccion || direccion.length < 3) {
        mostrarAlerta("Debes ingresar una dirección", "warning");
        return;
    }

    const btn = document.querySelector("#visitaModal .btn-success");
    btn.disabled = true;
    btn.innerText = "Guardando...";

    fetch(`/api/visitas/${id}/programar`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fecha,
            especialista,
            motivo,
            direccion
        })
    })
    .then(async res => {

        btn.disabled = false;
        btn.innerText = "Guardar";

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error);
        }

        return res.json();
    })
    .then(data => {

        mostrarAlerta("Visita programada correctamente", "success");

        bootstrap.Modal.getInstance(
            document.getElementById("visitaModal")
        ).hide();

        cargarVisitas();
    })
    .catch(err => {
        mostrarAlerta("Error: " + err.message, "error");
    });
}


//CONTACTAR POR WHATSSAP
function abrirWhatsApp() {
    const telefono = document.getElementById("telefonoUsuario").value;

    if (!telefono) {
        alert("No hay número de teléfono");
        return;
    }

    const numero = telefono.replace(/\D/g, "");

    const mensaje = encodeURIComponent(
"Hola 👋 😊, Somos de Animal Feed Solutions y queremos coordinar tu visita técnica. ¿Podrías indicarnos una fecha en la que estés disponible para agendarla?"
    );

    const url = `https://wa.me/${numero}?text=${mensaje}`;

    window.open(url, "_blank");
}
//FINALIZAR VIISTA

function confirmarFinalizar() {

    const id = document.getElementById("visitaFinalizarId").value;

    fetch(`/api/visitas/${id}/finalizar`, {
        method: "PUT"
    })
    .then(async res => {

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error);
        }

        return res.text();
    })
    .then(msg => {

        mostrarAlerta("Visita finalizada correctamente", "success");

        // cerrar modal
        bootstrap.Modal.getInstance(
            document.getElementById("confirmFinalizarModal")
        ).hide();

        cargarVisitas();

    })
    .catch(err => {

        mostrarAlerta("Error: " + err.message, "error");

    });
}

//CARGAR HISTORIAL DEL BACKEND Y MNOSTRAR EN EL FRONMTED


function cargarHistorial() {

    fetch("/api/visitas")
        .then(res => res.json())
        .then(data => {

            const tbody = document.getElementById("tablaHistorial");
            tbody.innerHTML = "";

            data.forEach(v => {

                const estado = (v.estado || "").trim().toUpperCase();

                // solo mostrar FINALIZADAS
                if (estado !== "FINALIZADA") return;

                const fila = `
                    <tr>
                        <td>${v.id}</td>
                        <td>${v.usuario}</td>
                        <td>${v.usuarioTelefono}</td>
                        <td>${v.especialista ?? '-'}</td>
                        <td>${v.fechaProgramada ?? '-'}</td>
                        <td>
                            <span class="badge bg-secondary">
                                ${v.estado}
                            </span>
                        </td>
                    </tr>
                `;

                tbody.innerHTML += fila;
            });
        });
}



//BUSCADOR TRAE RESPUESTA DEL BACKEND Y LO MOSTRARA EN EL FRONTED


const input = document.querySelector(".search-bar input");
const container = document.getElementById("searchResults");

input.addEventListener("input", function () {

    const q = this.value.trim();

    if (q === "") {
        container.classList.add("hidden");
        container.innerHTML = "";
        return;
    }

    fetch(`/api/visitas/buscar?q=${encodeURIComponent(q)}`)
        .then(res => res.json())
        .then(data => {

            container.innerHTML = "";

            if (data.length === 0) {
                container.innerHTML = `
                    <div class="alert alert-warning">
                        No se encontraron visitas.
                    </div>
                `;
                container.classList.remove("hidden");
                return;
            }

            data.forEach(v => {

                container.innerHTML += `
<div class="card shadow-lg mb-3 bg-dark text-light border-secondary">
                        <div class="card-header bg-primary text-white">
                            <h5 class="mb-0">${v.usuario}</h5>
                        </div>

                        <div class="card-body">

                            <div class="row">

                                <div class="col-md-6">
                                    <p><strong>ID:</strong> ${v.id ?? "-"}</p>
                                    <p><strong>Usuario:</strong> ${v.usuario ?? "-"}</p>
                                    <p><strong>Teléfono:</strong> ${v.usuarioTelefono ?? "-"}</p>
                                    <p><strong>Estado:</strong> ${v.estado ?? "-"}</p>
                                    <p><strong>Especialista:</strong> ${v.especialista ?? "No asignado"}</p>
                                </div>

                                <div class="col-md-6">
                                    <p><strong>Motivo:</strong> ${v.motivo ?? "Sin motivo"}</p>
                                    <p><strong>Dirección:</strong> ${v.direccion ?? "No registrada"}</p>
                                    <p><strong> El usuario solicitó la visita técnica en la fecha:</strong> ${v.fechaSolicitud ?? "-"}</p>
                                    <p><strong>Fecha Programada en la que se realizaró la visita:</strong> ${v.fechaProgramada ?? "-"}</p>
                                
                                </div>

                            </div>

                        </div>
                    </div>
                `;
            });

            container.classList.remove("hidden");
        })
        .catch(error => {
            console.error(error);

            container.innerHTML = `
                <div class="alert alert-danger">
                    Error al buscar visitas.
                </div>
            `;

            container.classList.remove("hidden");
        });
});


//CRERA VISITA TECNICA NUEVA MANUALMENTE
function crearVisita() {

    const usuario = document.getElementById("nuevoUsuario").value.trim();
    const telefono = document.getElementById("nuevoTelefono").value.trim();

    // VALIDACION USUARIO
    if (!usuario) {
        mostrarAlerta("El usuario es obligatorio", "warning");
        document.getElementById("nuevoUsuario").focus();
        return;
    }

    if (usuario.length < 3) {
        mostrarAlerta("El usuario debe tener al menos 3 caracteres", "warning");
        return;
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(usuario)) {
        mostrarAlerta("El usuario solo debe contener letras", "error");
        return;
    }

    // VALIDACIÓN TELEFONO
    if (!telefono) {
        mostrarAlerta("El teléfono es obligatorio", "warning");
        document.getElementById("nuevoTelefono").focus();
        return;
    }

    if (!/^9\d{8}$/.test(telefono)) {
        mostrarAlerta("El teléfono debe tener 9 dígitos y empezar con 9", "error");
        return;
    }

    // BLOQUEAR BOTON
    const btn = document.querySelector("#modalNuevaVisita .btn-success");
    btn.disabled = true;
    btn.innerText = "Creando...";

    // PETICION
    fetch("/api/visitas", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            usuario: usuario,
            usuarioTelefono: telefono
        })
    })
    .then(async res => {

        btn.disabled = false;
        btn.innerText = "Crear visita";

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error);
        }

        return res.text();
    })
    .then(msg => {

        mostrarAlerta("Visita creada correctamente", "success");

        // cerrar modal
        bootstrap.Modal.getInstance(
            document.getElementById("modalNuevaVisita")
        ).hide();

        // limpiar campos
        document.getElementById("nuevoUsuario").value = "";
        document.getElementById("nuevoTelefono").value = "";

        // recargar
        cargarVisitas();
    })
    .catch(err => {

        mostrarAlerta("Error: " + err.message, "error");
    });
}




//alerta
function finalizarVisita(id) {

    document.getElementById("visitaFinalizarId").value = id;

    const modal = new bootstrap.Modal(
        document.getElementById("confirmFinalizarModal")
    );

    modal.show();
}





//eliminar
function confirmarEliminar() {

    const id = document.getElementById("visitaEliminarId").value;

    fetch(`/api/visitas/${id}`, {
        method: "DELETE"
    })
    .then(async res => {

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error);
        }

        return res.text();
    })
    .then(msg => {

        mostrarAlerta("Solicitud eliminada correctamente", "success");

        bootstrap.Modal.getInstance(
            document.getElementById("confirmDeleteModal")
        ).hide();

        cargarVisitas();

    })
    .catch(err => {

        mostrarAlerta("Error: " + err.message, "error");

    });
}






window.eliminarVisita = function (id) {

    document.getElementById("visitaEliminarId").value = id;

    const modal = new bootstrap.Modal(
        document.getElementById("confirmDeleteModal")
    );

    modal.show();
};









function mostrarVista(vista) {

    document.querySelectorAll(".seccion-visitas, .historial-container")
        .forEach(el => el.style.display = "none");

    document.querySelectorAll(".btn-vista")
        .forEach(btn => btn.classList.remove("active"));

    const btnActivo = Array.from(document.querySelectorAll(".btn-vista"))
        .find(btn => btn.onclick.toString().includes(vista));

    if (btnActivo) {
        btnActivo.classList.add("active");
    }

    if (vista === "pendientes") {
        document.querySelector(".pendientes").style.display = "block";
    }

    if (vista === "calendario") {
        document.querySelector("#calendarioVisitas").parentElement.style.display = "block";
    }

    if (vista === "historial") {
        document.querySelector(".historial-container").style.display = "block";
        cargarHistorial();
    }
}
document.addEventListener("DOMContentLoaded", () => {
    mostrarVista("calendario");
});