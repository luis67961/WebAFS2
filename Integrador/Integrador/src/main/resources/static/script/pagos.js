//GERENRALES
function ocultarTodasLasVistas() {

    const vistas = [
        "vistaCobro",
        "vistaPago",
        "vistaEgreso",
        "contenedorReporteMovimientos"
    ];

    vistas.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });
}





function mostrarCobro() {
    ocultarTodasLasVistas();
    document.getElementById("vistaCobro").style.display = "block";
}


function mostrarPago() {
    ocultarTodasLasVistas();
    document.getElementById("vistaPago").style.display = "block";
}

function mostrarEgreso() {
    ocultarTodasLasVistas();
    document.getElementById("vistaEgreso").style.display = "block";
}



function toggleReporteMovimientos() {

    const container = document.getElementById("contenedorReporteMovimientos");

    if (!container) return;

    const isHidden = container.style.display === "none" || container.style.display === "";

    if (isHidden) {

        ocultarTodasLasVistas(); 

        container.style.display = "block";

        loadReporteMovimientos();

        window.scrollTo({
            top: container.offsetTop,
            behavior: "smooth"
        });

    } else {
        container.style.display = "none";
    }
}

//MOSTRA POR DEFECTO

document.addEventListener("DOMContentLoaded", () => {
    toggleReporteMovimientos();
});





function limpiarCobro() {
    document.getElementById("cobroReferencia").value = "";
    document.getElementById("cobroMonto").value = "";
    document.getElementById("cobroFecha").value = "";
    document.getElementById("cobroDescripcion").value = "";
    document.getElementById("cobroFile").value = "";
}


function formatearFecha(fechaISO) {

    if (!fechaISO) return "-";

    const fecha = new Date(fechaISO);

    return fecha.toLocaleString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}





//************************** TODO SOBRE CABROS******************************** //


function guardarCobro() {

    const destino = document.getElementById("cobroOrigen").value.trim();
    const referencia = document.getElementById("cobroReferencia").value.trim();
    const monto = document.getElementById("cobroMonto").value;
    const metodo = document.getElementById("cobroMetodo").value.trim();
    const fecha = document.getElementById("cobroFecha").value;
    const estado = document.getElementById("cobroEstado").value.trim();
    const descripcion = document.getElementById("cobroDescripcion").value.trim();

    if (!destino) return alert("Seleccione origen del cobro");
    if (!referencia) return alert("Ingrese referencia");
    if (!monto || Number(monto) <= 0) return alert("Monto inválido");
    if (!metodo) return alert("Seleccione método");
    if (!fecha) return alert("Seleccione fecha");
    if (!estado) return alert("Seleccione estado");

    const formData = new FormData();

    formData.append("tipo", "COBRO");
    formData.append("destino", destino);
    formData.append("referencia", referencia);
    formData.append("monto", monto);
    formData.append("metodo", metodo);
    formData.append("fecha", fecha);
    formData.append("estado", estado);
    formData.append("descripcion", descripcion);

    const fileInput = document.getElementById("cobroFile");
    if (fileInput.files.length > 0) {
        formData.append("file", fileInput.files[0]);
    }

    let url = "http://localhost:8080/api/movimientos/upload";
    let method = "POST";

    if (window.cobroEditId) {
        url = `http://localhost:8080/api/movimientos/upload/${window.cobroEditId}`;
        method = "PUT";
    }

    fetch(url, {
        method: method,
        body: formData
    })
    .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    })
    .then(() => {

        window.cobroEditId = null;

        cargarCobros();

        bootstrap.Modal.getInstance(
            document.getElementById("modalCobro")
        ).hide();

        limpiarCobro();
    })
    .catch(err => {
        console.error(err);
        alert("Error al guardar cobro");
    });
}


function editarCobro(id) {

    fetch(`http://localhost:8080/api/movimientos/${id}`)
        .then(res => res.json())
        .then(c => {

            window.cobroEditId = c.id;

            const modal = new bootstrap.Modal(
                document.getElementById("modalCobro")
            );
            modal.show();

            document.getElementById("cobroOrigen").value = c.destino ?? "";
            document.getElementById("cobroReferencia").value = c.referencia ?? "";
            document.getElementById("cobroMonto").value = c.monto ?? "";
            document.getElementById("cobroMetodo").value = c.metodo ?? "";
            document.getElementById("cobroEstado").value = c.estado ?? "";
            document.getElementById("cobroDescripcion").value = c.descripcion ?? "";

            document.getElementById("cobroFecha").value =
                c.fecha ? c.fecha.split("T")[0] : "";
        });
}

function cargarCobros() {

    fetch("http://localhost:8080/api/movimientos?tipo=COBRO")
        .then(res => res.json())
        .then(data => {

            const tbody = document.getElementById("tbodyCobros");
            tbody.innerHTML = "";

            data.forEach(c => {

                const fila = document.createElement("tr");

                // CLICK EN TODA LA FILA
                fila.style.cursor = "pointer";
                fila.onclick = () => verDetalleCobro(c.id);

                fila.innerHTML = `
                    <td>${formatearFecha(c.fecha)}</td>
                    <td>${c.destino ?? '-'}</td>
                    <td>${c.referencia ?? '-'}</td>
                    <td>S/ ${Number(c.monto || 0).toFixed(2)}</td>
                    <td>${c.metodo ?? '-'}</td>
                    <td>
                        <span class="badge bg-warning text-dark">
                            ${c.estado ?? '-'}
                        </span>
                    </td>

                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-primary"
                            onclick="event.stopPropagation(); editarCobro(${c.id})">
                            Editar
                        </button>

                        <button class="btn btn-sm btn-outline-danger"
                            onclick="event.stopPropagation(); eliminarCobro(${c.id})">
                            Eliminar
                        </button>
                    </td>
                `;

                tbody.appendChild(fila);
            });
        });
}

//eliminar cobro

function eliminarCobro(id) {

    if (!confirm("¿Eliminar este cobro?")) return;

    fetch(`http://localhost:8080/api/movimientos/${id}`, {
        method: "DELETE"
    })
    .then(() => {
        cargarCobros();
    });
}


//ver detalle cobros
function verDetalleCobro(id) {

    fetch(`http://localhost:8080/api/movimientos/${id}`)
        .then(res => res.json())
        .then(c => {

            const contenido = `
                <div class="container-fluid">

                    <!-- HEADER VERDE RESUMEN -->
                    <div class="p-3 mb-3 rounded-4 shadow-sm text-white d-flex justify-content-between align-items-center"
                         style="background: linear-gradient(135deg, #22c55e, #16a34a);">

                        <div>
                            <h5 class="mb-0">Cobro #${c.id}</h5>
                            <small>${c.tipo ?? "-"}</small>
                        </div>

                        <div class="text-end">
                            <div class="fw-bold fs-5">
                                + S/ ${Number(c.monto || 0).toFixed(2)}
                            </div>
                            <span class="badge bg-light text-dark">
                                ${c.metodo ?? "-"}
                            </span>
                        </div>

                    </div>

                    <!-- CONTENIDO -->
                    <div class="row g-3">

                        <!-- ORIGEN -->
                        <div class="col-md-4">
                            <div class="p-3 bg-light rounded-4 border">
                                <small class="text-muted">Origen</small>
                                <div class="fw-semibold">${c.destino ?? "-"}</div>
                            </div>
                        </div>

                        <!-- REFERENCIA -->
                        <div class="col-md-4">
                            <div class="p-3 bg-light rounded-4 border">
                                <small class="text-muted">Referencia</small>
                                <div class="fw-semibold">${c.referencia ?? "-"}</div>
                            </div>
                        </div>

                        <!-- ESTADO -->
                        <div class="col-md-4">
                            <div class="p-3 bg-light rounded-4 border text-center">
                                <small class="text-muted d-block">Estado</small>
                                <span class="badge bg-warning text-dark fs-6 px-3 py-2">
                                    ${c.estado ?? "-"}
                                </span>
                            </div>
                        </div>

                        <!-- FECHAS -->
                        <div class="col-md-6">
                            <div class="p-3 bg-white rounded-4 shadow-sm border-start border-4 border-success">
                                <small class="text-muted">Fecha</small>
                                <div>${formatearFecha(c.fecha)}</div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="p-3 bg-white rounded-4 shadow-sm border-start border-4 border-secondary">
                                <small class="text-muted">Última actualización</small>
                                <div>${formatearFecha(c.fechaActualizacion)}</div>
                            </div>
                        </div>

                        <!-- REGISTRO -->
                        <div class="col-md-6">
                            <div class="p-3 bg-white rounded-4 shadow-sm text-center border border-success">
                                <small class="text-muted d-block">Registrado</small>
                                <div>${formatearFecha(c.fechaCreacion)}</div>
                            </div>
                        </div>

                        <!-- MONTO DESTACADO -->
                        <div class="col-md-6">
                            <div class="p-3 bg-white rounded-4 shadow-sm text-center border border-success">
                                <small class="text-muted d-block">Monto recibido</small>
                                <div class="fw-bold text-success fs-4">
                                    + S/ ${Number(c.monto || 0).toFixed(2)}
                                </div>
                            </div>
                        </div>

                        <!-- DESCRIPCIÓN -->
                        <div class="col-12">
                            <div class="p-3 bg-white rounded-4 shadow-sm text-center border border-success">
                                <h6 class="text-success mb-2">Descripción</h6>
                                <p class="mb-0">${c.descripcion ?? "Sin descripción"}</p>
                            </div>
                        </div>

                        <!-- EVIDENCIA -->
                        <div class="col-12">
                            <div class="p-3 bg-white rounded-4 shadow-sm border text-center border border-success">

                                <h6 class="text-success mb-3">Evidencia</h6>

                                ${
                                    c.evidenciaUrl
                                    ? `<img src="${
                                        c.evidenciaUrl.startsWith("http")
                                        ? c.evidenciaUrl
                                        : "http://localhost:8080/uploads/" + c.evidenciaUrl
                                    }"
                                    class="img-fluid rounded-4 shadow"
                                    style="max-height:320px; object-fit:contain;">`
                                    : `<span class="text-muted">Sin evidencia adjunta</span>`
                                }

                            </div>
                        </div>

                    </div>
                </div>
            `;

            document.getElementById("detalleCobroContent").innerHTML = contenido;

            new bootstrap.Modal(
                document.getElementById("modalDetalleCobro")
            ).show();
        })
        .catch(err => {
            console.error("Error al cargar detalle:", err);
        });
}








































/**********************TODO SOBRE PAGOS**************************** */



// GUARDAR / ACTUALIZAR PAGO


function guardarPago() {

    const destino = document.getElementById("pagoDestino").value.trim();
    const proveedor = document.getElementById("pagoProveedor").value.trim();
    const concepto = document.getElementById("pagoConcepto").value.trim();
    const monto = document.getElementById("pagoMonto").value;
    const metodo = document.getElementById("pagoMetodo").value.trim();
    const fecha = document.getElementById("pagoFecha").value;
    const estado = document.getElementById("pagoEstado").value.trim();
    const descripcion = document.getElementById("pagoDescripcion").value.trim();

    if (!destino) return alert("Seleccione destino");
    if (!proveedor) return alert("Ingrese proveedor");
    if (!concepto) return alert("Ingrese concepto");
    if (!monto || Number(monto) <= 0) return alert("Monto inválido");
    if (!metodo) return alert("Seleccione método");
    if (!fecha) return alert("Seleccione fecha");
    if (!estado) return alert("Seleccione estado");

    const formData = new FormData();

    formData.append("tipo", "PAGO");
    formData.append("destino", destino);
    formData.append("referencia", proveedor);
    formData.append("concepto", concepto);
    formData.append("monto", monto);
    formData.append("metodo", metodo);
    formData.append("fecha", fecha);
    formData.append("estado", estado);
    formData.append("descripcion", descripcion);

    const file = document.getElementById("pagoFile");
    if (file.files.length > 0) {
        formData.append("file", file.files[0]);
    }

    let url = "http://localhost:8080/api/movimientos/upload";
    let method = "POST";

    if (window.pagoEditId) {
        url = `http://localhost:8080/api/movimientos/upload/${window.pagoEditId}`;
        method = "PUT";
    }

    fetch(url, { method, body: formData })
        .then(async res => {
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        })
        .then(() => {
            window.pagoEditId = null;
            cargarPagos();

            bootstrap.Modal.getInstance(
                document.getElementById("modalPago")
            ).hide();

            limpiarPago();
        })
        .catch(err => {
            console.error(err);
            alert("Error al guardar pago");
        });
}


// EDITAR


function editarPago(id) {

    fetch(`http://localhost:8080/api/movimientos/${id}`)
        .then(res => res.json())
        .then(p => {

            window.pagoEditId = p.id;

            new bootstrap.Modal(
                document.getElementById("modalPago")
            ).show();

            document.getElementById("pagoDestino").value = p.destino ?? "";
            document.getElementById("pagoProveedor").value = p.referencia ?? "";
            document.getElementById("pagoConcepto").value = p.categoria ?? "";
            document.getElementById("pagoMonto").value = p.monto ?? "";
          document.getElementById("pagoConcepto").value = p.concepto ?? "";

            document.getElementById("pagoMetodo").value = p.metodo ?? "";
            document.getElementById("pagoEstado").value = p.estado ?? "";
            document.getElementById("pagoReferencia").value = p.codigo ?? "";
            document.getElementById("pagoDescripcion").value = p.descripcion ?? "";

            document.getElementById("pagoFecha").value =
                p.fecha ? p.fecha.split("T")[0] : "";

        });

}



// LISTAR PAGOS

function cargarPagos() {

    fetch("http://localhost:8080/api/movimientos?tipo=PAGO")
        .then(res => res.json())
        .then(data => {

            const tbody = document.querySelector("#vistaPago tbody");
            tbody.innerHTML = "";

            data.forEach(p => {

                tbody.innerHTML += `
                    <tr style="cursor:pointer" onclick="verDetallePago(${p.id})">

                        <td>${formatearFecha(p.fecha)}</td>
                        <td>${p.destino ?? "-"}</td>
                        <td>${p.referencia ?? "-"}</td>
                        <td>${p.concepto ?? "-"}</td>

                        <td>${p.metodo ?? "-"}</td>

                        <td>S/ ${Number(p.monto || 0).toFixed(2)}</td>

                        <td>
                            <span class="badge bg-success">
                                ${p.estado ?? "-"}
                            </span>
                        </td>

                        <td class="text-center">

                            <button class="btn btn-sm btn-outline-primary"
                                onclick="event.stopPropagation(); editarPago(${p.id})">
                                Editar
                            </button>

                            <button class="btn btn-sm btn-outline-danger"
                                onclick="event.stopPropagation(); eliminarPago(${p.id})">
                                Eliminar
                            </button>

                        </td>

                    </tr>
                `;
            });
        })
        .catch(err => console.error("Error cargando pagos:", err));
}

// ELIMINAR

function eliminarPago(id) {

    if (!confirm("¿Eliminar este pago?")) return;

    fetch(`http://localhost:8080/api/movimientos/${id}`, {
        method: "DELETE"
    })
        .then(() => cargarPagos());

}


// DETALLE
function verDetallePago(id) {

    fetch(`http://localhost:8080/api/movimientos/${id}`)
        .then(res => res.json())
        .then(p => {

            const badgeEstado =
                p.estado === "Pendiente"
                    ? "warning text-dark"
                    : p.estado === "Completado"
                    ? "success"
                    : "secondary";

            const contenido = `
                <div class="container-fluid">

                    <!-- HEADER RESUMEN -->
                    <div class="p-3 mb-3 rounded-4 shadow-sm bg-primary text-white d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-0">Pago #${p.id}</h5>
                            <small>${p.tipo ?? "-"}</small>
                        </div>

                        <div class="text-end">
                            <div class="fw-bold fs-5">
                                S/ ${Number(p.monto || 0).toFixed(2)}
                            </div>
                            <span class="badge bg-light text-dark">
                                ${p.metodo ?? "-"}
                            </span>
                        </div>
                    </div>

                    <!-- INFO PRINCIPAL -->
                    <div class="row g-3">

                        <div class="col-md-4">
                            <div class="p-3 bg-light rounded-4 border">
                                <small class="text-muted">Destino</small>
                                <div class="fw-semibold">${p.destino ?? "-"}</div>
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="p-3 bg-light rounded-4 border">
                                <small class="text-muted">Proveedor</small>
                                <div class="fw-semibold">${p.referencia ?? "-"}</div>
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="p-3 bg-light rounded-4 border">
                                <small class="text-muted">Concepto</small>
                                <div class="fw-semibold">${p.concepto ?? "-"}</div>
                            </div>
                        </div>

                        <!-- FECHAS -->
                        <div class="col-md-6">
                            <div class="p-3 bg-white rounded-4 shadow-sm border-start border-4 border-info">
                                <small class="text-muted">Fecha</small>
                                <div>${formatearFecha(p.fecha)}</div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="p-3 bg-white rounded-4 shadow-sm border-start border-4 border-secondary">
                                <small class="text-muted">Última actualización</small>
                                <div>${formatearFecha(p.fechaActualizacion)}</div>
                            </div>
                        </div>

                        <!-- ESTADO -->
                        <div class="col-md-6">
                            <div class="p-3 bg-white rounded-4 shadow-sm text-center border border-info">
                                <small class="text-muted d-block">Estado</small>
                                <span class="badge bg-${badgeEstado} fs-6 px-3 py-2">
                                    ${p.estado ?? "-"}
                                </span>
                            </div>
                        </div>

                        <!-- REGISTRO -->
                        <div class="col-md-6">
                            <div class="p-3 bg-white rounded-4 shadow-sm text-center border border-info">
                                <small class="text-muted d-block">Registrado</small>
                                <div>${formatearFecha(p.fechaCreacion)}</div>
                            </div>
                        </div>

                        <!-- DESCRIPCIÓN -->
                        <div class="col-12">
                            <div class="p-3 bg-white rounded-4 shadow-sm border border-info">
                                <h6 class="text-primary mb-2">Descripción</h6>
                                <p class="mb-0">${p.descripcion ?? "Sin descripción"}</p>
                            </div>
                        </div>

                        <!-- EVIDENCIA -->
                        <div class="col-12">
                            <div class="p-3 bg-white rounded-4 shadow-sm border text-center border border-info">

                                <h6 class="text-primary mb-3">Evidencia</h6>

                                ${
                                    p.evidenciaUrl
                                    ? `<img src="http://localhost:8080/uploads/${p.evidenciaUrl}"
                                        class="img-fluid rounded-4 shadow"
                                        style="max-height:320px; object-fit:contain;">`
                                    : `<span class="text-muted">Sin evidencia adjunta</span>`
                                }

                            </div>
                        </div>

                    </div>
                </div>
            `;

            document.getElementById("detallePagoContent").innerHTML = contenido;

            new bootstrap.Modal(
                document.getElementById("modalDetallePago")
            ).show();
        })
        .catch(err => {
            console.error("Error al cargar detalle:", err);
        });
}
// ===============================
// LIMPIAR FORMULARIO
// ===============================

function limpiarPago() {

    document.getElementById("pagoDestino").value = "";
    document.getElementById("pagoProveedor").value = "";
    document.getElementById("pagoConcepto").value = "";
    document.getElementById("pagoMonto").value = "";
    document.getElementById("pagoMetodo").value = "";
    document.getElementById("pagoFecha").value = "";
    document.getElementById("pagoEstado").value = "";
    document.getElementById("pagoReferencia").value = "";
    document.getElementById("pagoDescripcion").value = "";
    document.getElementById("pagoFile").value = "";

    window.pagoEditId = null;

}



/**********************TODO SOBRE EGRESDOS**************************** */





// GUARDAR / ACTUALIZAR EGRESO


function guardarEgreso() {

    const tipo = document.getElementById("egresoTipo").value.trim();
    const destino = document.getElementById("egresoDestino").value.trim();
    const concepto = document.getElementById("egresoConcepto").value.trim();
    const monto = document.getElementById("egresoMonto").value;
    const metodo = document.getElementById("egresoMetodo").value.trim();
    const fecha = document.getElementById("egresoFecha").value;
    const estado = document.getElementById("egresoEstado").value.trim();
    const referencia = document.getElementById("egresoReferencia").value.trim();
    const descripcion = document.getElementById("egresoDescripcion").value.trim();

    if (!tipo) return alert("Seleccione tipo");
    if (!destino) return alert("Ingrese beneficiario");
    if (!concepto) return alert("Ingrese concepto");
    if (!monto || Number(monto) <= 0) return alert("Monto inválido");
    if (!metodo) return alert("Seleccione método");
    if (!fecha) return alert("Seleccione fecha");
    if (!estado) return alert("Seleccione estado");

    const formData = new FormData();

    formData.append("tipo", "EGRESO");
    formData.append("destino", destino);
    formData.append("concepto", concepto);
    formData.append("monto", monto);
    formData.append("metodo", metodo);
    formData.append("fecha", fecha);
    formData.append("estado", estado);
    formData.append("referencia", referencia);
    formData.append("descripcion", descripcion);

    const file = document.getElementById("egresoFile");
    if (file && file.files.length > 0) {
        formData.append("file", file.files[0]);
    }

    let url = "http://localhost:8080/api/movimientos/upload";
    let method = "POST";

    if (window.egresoEditId) {
        url = `http://localhost:8080/api/movimientos/upload/${window.egresoEditId}`;
        method = "PUT";
    }

    fetch(url, { method, body: formData })
        .then(res => {
            if (!res.ok) throw new Error("Error al guardar egreso");
            return res.json();
        })
        .then(() => {

            window.egresoEditId = null;

            cargarEgresos();

            bootstrap.Modal.getInstance(
                document.getElementById("modalEgreso")
            ).hide();

            limpiarEgreso();
        })
        .catch(err => {
            console.error(err);
            alert("Error al guardar egreso");
        });
}



// LISTAR EGRESOS 

function cargarEgresos() {

    fetch("http://localhost:8080/api/movimientos?tipo=EGRESO")
        .then(res => res.json())
        .then(data => {

            const tbody = document.getElementById("tbodyEgresos");
            tbody.innerHTML = "";

            data.forEach(e => {

                tbody.innerHTML += `
                    <tr>

                        <td>${formatearFecha(e.fecha)}</td>
                        <td>${e.concepto ?? "-"}</td>
                        <td>${e.destino ?? "-"}</td>
                        <td>${e.referencia ?? "-"}</td>
                        <td>${e.metodo ?? "-"}</td>

                        <td>S/ ${Number(e.monto || 0).toFixed(2)}</td>

                        <td>
                            <span class="badge bg-warning text-dark">
                                ${e.estado ?? "-"}
                            </span>
                        </td>

                        <td class="text-center">

                            <button class="btn btn-sm btn-outline-primary"
                                onclick="editarEgreso(${e.id})">
                                Editar
                            </button>

                            <button class="btn btn-sm btn-outline-danger"
                                onclick="eliminarEgreso(${e.id})">
                                Eliminar
                            </button>

                            <button class="btn btn-sm btn-outline-secondary"
                                onclick="verDetalleEgreso(${e.id})">
                                Ver
                            </button>

                        </td>

                    </tr>
                `;
            });
        })
        .catch(err => console.error("Error cargando egresos:", err));
}



// EDITAR EGRESO

function editarEgreso(id) {

    fetch(`http://localhost:8080/api/movimientos/${id}`)
        .then(res => res.json())
        .then(e => {

            window.egresoEditId = e.id;

            new bootstrap.Modal(
                document.getElementById("modalEgreso")
            ).show();

            document.getElementById("egresoDestino").value = e.destino ?? "";
            document.getElementById("egresoConcepto").value = e.concepto ?? "";
            document.getElementById("egresoMonto").value = e.monto ?? "";
            document.getElementById("egresoMetodo").value = e.metodo ?? "";
            document.getElementById("egresoFecha").value = e.fecha ? e.fecha.split("T")[0] : "";
            document.getElementById("egresoEstado").value = e.estado ?? "";
            document.getElementById("egresoReferencia").value = e.referencia ?? "";
            document.getElementById("egresoDescripcion").value = e.descripcion ?? "";
        });
}



// ELIMINAR EGRESO

function eliminarEgreso(id) {

    if (!confirm("¿Eliminar este egreso?")) return;

    fetch(`http://localhost:8080/api/movimientos/${id}`, {
        method: "DELETE"
    })
        .then(() => cargarEgresos());
}



// DETALLE EGRESO 

function verDetalleEgreso(id) {

    fetch(`http://localhost:8080/api/movimientos/${id}`)
        .then(res => res.json())
        .then(e => {

            const contenido = `
                <div class="row g-3">

                    <div class="col-md-6">
                        <div class="p-2 bg-warning-subtle rounded">
                            <strong>Tipo:</strong> ${e.tipo ?? "-"}
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="p-2 bg-warning-subtle rounded">
                            <strong>Beneficiario:</strong> ${e.destino ?? "-"}
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="p-2 bg-warning-subtle rounded">
                            <strong>Concepto:</strong> ${e.concepto ?? "-"}
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="p-2 bg-warning-subtle rounded">
                            <strong>Referencia:</strong> ${e.referencia ?? "-"}
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="p-2 bg-warning-subtle rounded">
                            <strong>Fecha:</strong> ${formatearFecha(e.fecha)}
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="p-2 bg-warning-subtle rounded">
                            <strong>Método:</strong> ${e.metodo ?? "-"}
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="p-2 bg-warning-subtle rounded">
                            <strong>Estado:</strong> ${e.estado ?? "-"}
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="p-2 bg-warning-subtle rounded">
                            <strong>Monto:</strong>
                            <span class="fw-bold text-danger">
                                S/ ${Number(e.monto || 0).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div class="col-12">
                        <div class="p-3 bg-white border rounded">
                            <strong>Descripción:</strong>
                            <p class="mb-0">${e.descripcion ?? "Sin descripción"}</p>
                        </div>
                    </div>

                    <div class="col-12 text-center">
                        <div class="p-3 border rounded bg-light">

                            <strong class="d-block mb-2">Evidencia</strong>

                            ${
                                e.evidenciaUrl
                                ? `<img src="http://localhost:8080/uploads/${e.evidenciaUrl}"
                                    class="img-fluid rounded shadow"
                                    style="max-height:300px;">`
                                : `<span class="text-muted">Sin evidencia</span>`
                            }

                        </div>
                    </div>

                </div>
            `;

            document.getElementById("detalleEgresoContent").innerHTML = contenido;

            new bootstrap.Modal(
                document.getElementById("modalDetalleEgreso")
            ).show();
        });
}


// LIMPIAR FORM
function limpiarEgreso() {

    document.getElementById("egresoDestino").value = "";
    document.getElementById("egresoConcepto").value = "";
    document.getElementById("egresoMonto").value = "";
    document.getElementById("egresoMetodo").value = "";
    document.getElementById("egresoFecha").value = "";
    document.getElementById("egresoEstado").value = "";
    document.getElementById("egresoReferencia").value = "";
    document.getElementById("egresoDescripcion").value = "";

    window.egresoEditId = null;
}


// INIT
document.addEventListener("DOMContentLoaded", () => {
    cargarEgresos();
});



/*****************************       REPORTES*********************** **/











// CARGAR REPORTE MOVIMIENTOS

function loadReporteMovimientos() {

    const container = document.getElementById("dynamic-report-content");
    if (!container) return;

    container.innerHTML = `
<div id="reporteMovimientos">

    <!-- ================= KPIs ================= -->
    <div class="row g-3 mb-4">

        <div class="col-md-3">
            <div class="card border-success shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-arrow-down-circle fs-2 text-success"></i>
                    <h6>Total Ingresos</h6>
                    <h3 id="kpiIngresos">0</h3>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card border-danger shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-arrow-up-circle fs-2 text-danger"></i>
                    <h6>Total Egresos</h6>
                    <h3 id="kpiEgresos">0</h3>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card border-primary shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-wallet2 fs-2 text-primary"></i>
                    <h6>Balance</h6>
                    <h3 id="kpiBalance">0</h3>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card border-warning shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-list-ol fs-2 text-warning"></i>
                    <h6>Total Movimientos</h6>
                    <h3 id="kpiCantidad">0</h3>
                </div>
            </div>
        </div>

    </div>

    <!-- ================= CHART + TOP ================= -->
    <div class="row g-3 mb-4">

        <div class="col-md-6">
            <div class="card shadow-sm">
                <div class="card-header">📊 Flujo diario</div>
                <div class="card-body">
                    <canvas id="graficoFlujo"></canvas>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="card shadow-sm">
                <div class="card-header">🏆 Top destinos</div>
                <div class="card-body" id="topDestinos"></div>
            </div>
        </div>

    </div>

    <!-- ================= ESTADOS ================= -->
      <div class="col-md-6">

    <div class="card shadow-sm mb-4">
        <div class="card-header">📌 Estados de movimientos</div>
        <div class="card-body" id="porEstado"></div>
    </div>
</div>
</div>
`;

    fetch("/api/reportes/movimientos/resumen-general")
        .then(res => res.json())
        .then(data => {

            if (!data) return;

            setText("kpiIngresos", `S/ ${data.totalIngresos?.toFixed(2) ?? 0}`);
            setText("kpiEgresos", `S/ ${data.totalEgresos?.toFixed(2) ?? 0}`);
            setText("kpiBalance", `S/ ${data.balance?.toFixed(2) ?? 0}`);
            setText("kpiCantidad", data.cantidadMovimientos ?? 0);
        });

    // ================= TOP DESTINOS =================
    fetch("/api/reportes/movimientos/top-destinos")
        .then(res => res.json())
        .then(data => {

            const container = document.getElementById("topDestinos");

            if (!data || Object.keys(data).length === 0) {
                container.innerHTML = "<div class='text-muted'>Sin datos</div>";
                return;
            }

            container.innerHTML = Object.entries(data)
                .map(([k, v]) => `
                    <div class="d-flex justify-content-between border-bottom py-1">
                        <span>${k}</span>
                        <strong class="text-success">S/ ${v.toFixed(2)}</strong>
                    </div>
                `).join("");
        });

    // ================= ESTADOS =================
    fetch("/api/reportes/movimientos/por-estado")
        .then(res => res.json())
        .then(data => {

            const container = document.getElementById("porEstado");

            if (!data) return;

            container.innerHTML = Object.entries(data)
                .map(([estado, total]) => `
                    <div class="d-flex justify-content-between">
                        <span>${estado}</span>
                        <span class="badge bg-secondary">${total}</span>
                    </div>
                `).join("");
        });

    // ================= FLUJO DIARIO =================
    fetch("/api/reportes/movimientos/flujo-diario")
        .then(res => res.json())
        .then(data => renderFlujo(data));









        
    // ================= FLUJO NETO =================
    fetch("/api/reportes/movimientos/flujo-neto")
        .then(res => res.json())
        .then(data => {
            setText("kpiFlujoNeto", `S/ ${data.toFixed(2)}`);
        });

    // ================= PROMEDIO =================
    fetch("/api/reportes/movimientos/promedio-movimiento")
        .then(res => res.json())
        .then(data => {
            setText("kpiPromedio", `S/ ${data.toFixed(2)}`);
        });

    // ================= DISTRIBUCIÓN =================
    fetch("/api/reportes/movimientos/distribucion-tipos")
        .then(res => res.json())
        .then(data => {

            setText("kpiCobroPct", `${data.COBRO || 0}%`);
        });

    // ================= PENDIENTES =================
    fetch("/api/reportes/movimientos/pendientes")
        .then(res => res.json())
        .then(data => {

            setText("kpiPendientes", data.length);

            const cont = document.getElementById("listaPendientes");

            cont.innerHTML = data.length
                ? data.map(m => `
                    <div class="border-bottom py-1">
                        <b>${m.tipo}</b> - ${m.destino} <br>
                        <small class="text-muted">S/ ${m.monto}</small>
                    </div>
                `).join("")
                : "<div class='text-success'>Sin pendientes</div>";
        });

    // ================= TOP EGRESOS =================
    fetch("/api/reportes/movimientos/top-egresos")
        .then(res => res.json())
        .then(data => {

            const cont = document.getElementById("topEgresos");

            cont.innerHTML = data.length
                ? data.map(m => `
                    <div class="d-flex justify-content-between border-bottom py-1">
                        <span>${m.destino}</span>
                        <strong class="text-danger">S/ ${m.monto}</strong>
                    </div>
                `).join("")
                : "<div class='text-muted'>Sin datos</div>";
        });

    // ================= POR MES =================
    fetch("/api/reportes/movimientos/por-mes")
        .then(res => res.json())
        .then(data => renderMeses(data));







}



// GRAFICO FLUJO
function renderFlujo(data) {

    if (!data) return;

    const labels = Object.keys(data);
    const ingresos = labels.map(f => data[f].ingresos || 0);
    const egresos = labels.map(f => data[f].egresos || 0);

    if (window.chartFlujo) window.chartFlujo.destroy();

    window.chartFlujo = new Chart(
        document.getElementById("graficoFlujo"),
        {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Ingresos",
                        data: ingresos
                    },
                    {
                        label: "Egresos",
                        data: egresos
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "top"
                    }
                },
                scales: {
                    x: {
                        stacked: false
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        }
    );
}


// ===============================
// HELPERS
// ===============================
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}















// ===============================
// CARGAR DASHBOARD AVANZADO
// ===============================
function loadReporteFinancieroAvanzado() {

   

}



//por mes
function renderMeses(data) {

    const labels = Object.keys(data);
    const valores = Object.values(data).map(v => v);

    if (window.chartMeses) window.chartMeses.destroy();

    window.chartMeses = new Chart(
        document.getElementById("graficoMeses"),
        {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Movimientos S/",
                    data: valores
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        }
    );
}


function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}



















//cargar datos
document.addEventListener("DOMContentLoaded", () => {
     cargarPagos();
     cargarCobros();

});

