document.addEventListener("DOMContentLoaded", async () => {

    try {
        const res = await fetch("/api/clientes");
        const clientes = await res.json();

        const tbody = document.getElementById("tabla-clientes");
        tbody.innerHTML = "";

        clientes.forEach(c => {

            const inicial = c.nombreCompleto?.charAt(0) ?? "?";

            tbody.innerHTML += `
<tr onclick="verCompras(${c.id}, '${c.nivel}', '${c.telefono}', '${c.nombreCompleto}')">
                    <!-- CLIENTE -->
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <span class="avatar-sm rounded-circle bg-primary text-white d-flex align-items-center justify-content-center">
                                ${inicial}
                            </span>

                            <div>
                                <div class="fw-bold fs-6">${c.nombreCompleto}</div>
                                <small class="text-bold fs-6">DNI: ${c.dni}</small>
                            </div>
                        </div>
                    </td>

                    <!-- NIVEL -->
                    <td class="fs-6 text-warning">
                        ${c.nivel ?? ""} <br>
                        <small class="fs-12 text-white">
                            Total de compras: ${c.totalCompras ?? 0}
                        </small>
                    </td>

                    <!-- ULTIMA COMPRA -->
                    <td class="text-primary fs-5">
                        ${c.ultimaCompra ?? "-"}
                    </td>

                    <!-- TOTAL GASTADO -->
                    <td class="${c.totalGastado > 0 ? 'text-danger fs-6' : 'text-success'}">
                        S/ ${c.totalGastado ?? 0}
                    </td>

                </tr>
            `;
        });

    } catch (e) {
        console.error("Error cargando clientes:", e);
    }
});


// =========================
// MODAL: VER COMPRAS
// =========================
async function verCompras(clienteId, nivel, telefono, nombre) {

    try {
        const res = await fetch(`/api/pedidos/cliente/${clienteId}/entregados`);
        const pedidos = await res.json();

        let contenido = "";
        let total = 0;

        pedidos.forEach(p => {

            total += p.total;

            contenido += `
                <tr>
                    <td>${p.id}</td>
                            <td>${p.dni ?? "-"}</td>

                    <td>${p.fechaPedido ?? "-"}</td>
                    <td>${p.estado ?? "-"}</td>
                    <td class="text fs-6">S/ ${p.total ?? 0}</td>
                </tr>
            `;
        });

        document.getElementById("tabla-modal-compras").innerHTML = contenido;
        document.getElementById("modal-total").innerText = "S/ " + total;

        // =========================
        // BOTÓN WHATSAPP DESCUENTO
        // =========================
        const btn = document.getElementById("btnDescuentoWhatsApp");

if (nivel?.toLowerCase().trim().includes("frecuente")){
            const mensaje = encodeURIComponent(
`Hola 👋 ${nombre}

🎉 ¡Felicidades por ser cliente frecuente!

Te damos un DESCUENTO ESPECIAL en tu próximo pedido 🛒

💰 Total acumulado en todas tus compras: S/ ${total}

Responde este mensaje para más información

📦 Gracias por confiar en nosotros 💙`
            );

            btn.href = `https://wa.me/51${telefono}?text=${mensaje}`;
            btn.classList.remove("d-none");

        } else {
            btn.classList.add("d-none");
        }

        const modal = new bootstrap.Modal(document.getElementById("modalCompras"));
        modal.show();

    } catch (error) {
        console.error("Error cargando compras:", error);
    }
}









// MENSAJES EN HTML
function mostrarMensaje(texto) {
    const box = document.getElementById("filtroMensaje");
    box.innerText = texto;
    box.classList.remove("d-none");
}

function ocultarMensaje() {
    const box = document.getElementById("filtroMensaje");
    box.classList.add("d-none");
}

// CARGAR CLIENTES 
async function cargarClientes() {

    try {
        const res = await fetch("/api/clientes");
        const clientes = await res.json();

        const tbody = document.getElementById("tabla-clientes");
        tbody.innerHTML = "";

        clientes.forEach(c => {

            const inicial = c.nombreCompleto?.charAt(0) ?? "?";

            tbody.innerHTML += `
                <tr onclick="verCompras(${c.id}, '${c.nivel}', '${c.telefono ?? ""}', '${c.nombreCompleto}')">

                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <span class="avatar-sm rounded-circle bg-primary text-white d-flex align-items-center justify-content-center">
                                ${inicial}
                            </span>

                            <div>
                                <div class="fw-bold fs-6">${c.nombreCompleto}</div>
                                <small>DNI: ${c.dni}</small>
                            </div>
                        </div>
                    </td>

                    <td>${c.nivel}</td>
                    <td>${c.ultimaCompra ?? "-"}</td>
                    <td>S/ ${c.totalGastado ?? 0}</td>

                </tr>
            `;
        });

    } catch (e) {
        console.error("Error cargando clientes:", e);
    }
}

// APLICAR FILTROS (FECHAS)
async function aplicarFiltros() {

    const desde = document.getElementById("filtroDesde").value;
    const hasta = document.getElementById("filtroHasta").value;

    if (!desde || !hasta) {
        mostrarMensaje(" Debes seleccionar ambas fechas (Desde y Hasta).");
        return;
    }

    ocultarMensaje();

    try {
        const res = await fetch(`/api/clientes/buscar?desde=${desde}&hasta=${hasta}`);
        const clientes = await res.json();

        const tbody = document.getElementById("tabla-clientes");
        tbody.innerHTML = "";

        if (!Array.isArray(clientes) || clientes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-warning">
                        No se encontraron clientes en este rango de fechas
                    </td>
                </tr>
            `;
            return;
        }

        clientes.forEach(c => {

            const inicial = c.nombreCompleto?.charAt(0) ?? "?";

            tbody.innerHTML += `
                <tr onclick="verCompras(${c.id}, '${c.nivel}', '${c.telefono ?? ""}', '${c.nombreCompleto}')">

                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <span class="avatar-sm rounded-circle bg-primary text-white d-flex align-items-center justify-content-center">
                                ${inicial}
                            </span>

                            <div>
                                <div class="fw-bold fs-6">${c.nombreCompleto}</div>
                                <small>DNI: ${c.dni}</small>
                            </div>
                        </div>
                    </td>

                    <td>${c.nivel}</td>
                    <td>${c.ultimaCompra ?? "-"}</td>
                    <td>S/ ${c.totalGastado ?? 0}</td>

                </tr>
            `;
        });

    } catch (error) {
        mostrarMensaje("Error al aplicar filtros");
        console.error(error);
    }
}

// QUITAR FILTROS
function quitarFiltros() {

    document.getElementById("filtroDesde").value = "";
    document.getElementById("filtroHasta").value = "";

    ocultarMensaje();

    cargarClientes(); 
}

// INICIAL
document.addEventListener("DOMContentLoaded", cargarClientes);