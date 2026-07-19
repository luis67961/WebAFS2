
//  REPORTES 
const reports = [
    { id: "ventas", title: "Reporte de Ventas", icon: "bi-cash-stack", color: "ventas" },
    { id: "pedidos", title: "Reporte de Pedidos", icon: "bi-box-seam", color: "pedidos" },
    { id: "rentabilidad", title: "Rentabilidad", icon: "bi-graph-up-arrow", color: "rentabilidad" },
    { id: "clientes", title: "Clientes", icon: "bi-people-fill", color: "clientes" },
    //{ id: "deudas", title: "Deudas", icon: "bi-exclamation-triangle-fill", color: "deudas" },
    { id: "visitas", title: "Visitas Técnicas", icon: "bi-geo-alt-fill", color: "visitas" },
    { id: "Insumos", title: "Precios de Insumos", icon: "bi-tag-fill", color: "precios" },
    //{ id: "productos", title: "Productos Más Vendidos", icon: "bi-boxes", color: "productos" },
   // { id: "mayoristas", title: "Mayoristas / Minoristas", icon: "bi-building", color: "mayoristas" },
    //{ id: "pagos", title: "Pagos Contraentrega", icon: "bi-credit-card", color: "pagos" },
    //{ id: "consolidado", title: "Consolidado del Negocio", icon: "bi-bar-chart-line-fill", color: "consolidado" }
];

// CARGAR TARJETAS 
function loadReportCards() {
    const container = document.getElementById('report-cards');
    container.innerHTML = '';

    reports.forEach(report => {
        const cardHTML = `
            <div class="report-card" onclick="selectReport('${report.id}')">
                <div class="icon-circle ${report.color}">
                    <i class="bi ${report.icon}"></i>
                </div>
                <h6>${report.title}</h6>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

//  SELECCIONAR REPORTE 
function selectReport(reportId) {
    switch(reportId) {
        case "ventas":      loadVentasReport(); break;
        case "pedidos":     loadPedidosReport(); break;
        case "rentabilidad": loadReporteRentabilidad(); break;
        case "clientes":    loadReporteClientes(); break;
        //case "deudas":      loadDeudasReport(); break;
        case "visitas":     loadVisitasReport(); break;
        case "Insumos":     loadReporteProductos(); break;
       // case "productos":   loadProductosReport(); break;
       // case "mayoristas":  loadMayoristasReport(); break;
      //  case "pagos":       loadPagosReport(); break;
       // case "consolidado": loadConsolidadoReport(); break;
        default:
            loadSalesReport();
    }
}


//  INICIALIZACIÓN 
document.addEventListener('DOMContentLoaded', () => {
    loadReportCards();
    loadSalesReport(); 
});

document.addEventListener("DOMContentLoaded", () => {

    loadReporteProductos();

});






//*********************************** */ REPORTES PRODUCTOS / INSUMOS

let chartInventario = null;

// CARGAR  
function loadReporteProductos() {

    const container = document.getElementById("dynamic-report-content");
    if (!container) return;

    container.innerHTML = `
<div id="reporteProductos">

    <!-- ================= KPIs ================= -->
    <div class="row g-3 mb-4">

        <div class="col-md-3">
            <div class="card border-primary shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-box-seam fs-2 text-primary"></i>
                    <h6>Total Productos</h6>
                    <h3 id="kpiTotalProductos">0</h3>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card border-success shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-cash-coin fs-2 text-success"></i>
                    <h6>Valor Inventario</h6>
                    <h3 id="kpiValorInventario">0</h3>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card border-danger shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-exclamation-triangle fs-2 text-danger"></i>
                    <h6>Stock Crítico</h6>
                    <h3 id="kpiStockCritico">0</h3>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card border-warning shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-x-circle fs-2 text-warning"></i>
                    <h6>Agotados</h6>
                    <h3 id="kpiAgotados">0</h3>
                </div>
            </div>
        </div>

    </div>

    <!-- ================= TOP Y ALERTAS ================= -->
    <div class="row g-3 mb-4">

        <div class="col-md-6">
            <div class="card shadow-sm">
                <div class="card-header">🏆 Productos más valiosos</div>
                <div class="card-body" id="topProductosValor"></div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="card shadow-sm">
                <div class="card-header text-danger">⚠ Alertas de inventario</div>
                <div class="card-body" id="alertasInventario"></div>
            </div>
        </div>

    </div>

    <!-- ================= POR CATEGORIA ================= -->
    <div class="card shadow-sm mb-4">
        <div class="card-header">📦 Productos por categoría</div>
        <div class="card-body" id="productosPorCategoria"></div>
    </div>

    <!-- ================= GRAFICO ================= -->
    <div class="card shadow-sm">
        <div class="card-header">📊 Valor de inventario (Top productos)</div>
        <div class="card-body">
            <canvas id="graficoInventario"></canvas>
        </div>
    </div>

</div>
`;

    fetch("/api/reportes/productos/dashboard")
        .then(res => res.json())
        .then(data => {

            if (!data) return;

            // ================= KPIs =================
            setText("kpiTotalProductos", data.totalProductos);
            setText("kpiValorInventario", `S/ ${data.valorTotalInventario?.toFixed(2) ?? 0}`);
            setText("kpiStockCritico", data.stockCritico);
            setText("kpiAgotados", data.productosAgotados);

            // ================= STOCK CRÍTICO (ALERTA) =================
            fetch("/api/reportes/productos/stock-critico")
                .then(res => res.json())
                .then(criticos => {

                    document.getElementById("alertasInventario").innerHTML =
                        criticos.length
                            ? criticos.map(p => `
                                <div class="border-bottom py-1">
                                    ⚠ ${p.nombre} - Stock: ${p.stock}
                                </div>
                            `).join("")
                            : "<div class='text-success'>Sin alertas de stock</div>";
                });

            // ================= TOP VALOR =================
            fetch("/api/reportes/productos/top-precio?top=5")
                .then(res => res.json())
                .then(top => {

                    document.getElementById("topProductosValor").innerHTML =
                        top.length
                            ? top.map(p => `
                                <div class="d-flex justify-content-between border-bottom py-1">
                                    <span>${p.nombre}</span>
                                    <strong class="text-success">S/ ${(p.precio * p.stock).toFixed(2)}</strong>
                                </div>
                            `).join("")
                            : "<div class='text-muted'>Sin datos</div>";

                    renderGraficoInventario(top);
                });

            // ================= POR CATEGORIA =================
            fetch("/api/reportes/productos/por-categoria")
                .then(res => res.json())
                .then(dataCat => {

                    const container = document.getElementById("productosPorCategoria");

                    container.innerHTML = Object.keys(dataCat).length
                        ? Object.entries(dataCat).map(([cat, productos]) => `
                            <div class="mb-3">
                                <h6 class="text-primary">${cat}</h6>
                                <ul class="mb-0">
                                    ${productos.map(p => `<li>${p.nombre} (Stock: ${p.stock})</li>`).join("")}
                                </ul>
                            </div>
                        `).join("")
                        : "<div class='text-muted'>Sin categorías</div>";
                });

        })
        .catch(err => {
            console.error(err);
        });
}

// HELPERS
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

// GRAFICO INVENTARIO

function renderGraficoInventario(productos) {

    if (!productos?.length) return;

    if (chartInventario) chartInventario.destroy();

    chartInventario = new Chart(
        document.getElementById("graficoInventario"),
        {
            type: "bar",
            data: {
                labels: productos.map(p => p.nombre),
                datasets: [{
                    label: "Valor (S/)",
                    data: productos.map(p => p.precio * p.stock)
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


























//********************************************* REPORTE DE CLIENTES

function loadReporteClientes() {

    const container = document.getElementById("dynamic-report-content");
    if (!container) return;

    container.innerHTML = `
<div id="reporteClientes">

    <!-- ================= KPIs ================= -->
    <div class="row g-3 mb-4">

    <h4 class="text-success">REPOPRTE DE CLIENTES QUE REALIZARON AL MENOS UNA COMPRA EN LA WEB</h6>


        <div class="col-md-3">
            <div class="card border-primary shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-people fs-2 text-primary"></i>
                    <h6>Total Clientes</h6>
                    <h3 id="kpiTotalClientes">0</h3>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card border-success shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-person-check fs-2 text-success"></i>
                    <h6>Clientes Activos (comparon hasta hace 30 días)</h6>
                    <h3 id="kpiActivos">0</h3>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card border-warning shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-person-dash fs-2 text-warning"></i>
                    <h6>Clientes Inactivos (no compran hace 90 dias)</h6>
                    <h3 id="kpiInactivos">0</h3>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card border-danger shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-percent fs-2 text-danger"></i>
                    <h6>% Inactividad</h6>
                    <h3 id="kpiPorcentaje">0%</h3>
                </div>
            </div>
        </div>

    </div>

    <!-- ================= TOP + ALERTAS ================= -->
    <div class="row g-3 mb-4">

        <div class="col-md-6">
            <div class="card shadow-sm">
                <div class="card-header">🏆 Top Clientes (mayor compra)</div>
                <div class="card-body" id="topClientes"></div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="card shadow-sm">
                <div class="card-header text-danger">⚠ Alertas Gerenciales</div>
                <div class="card-body" id="alertasClientes"></div>
            </div>
        </div>

    </div>

    <!-- ================= LISTA INACTIVOS ================= -->
    <div class="card shadow-sm">
        <div class="card-header">📉 Clientes Inactivos (riesgo)</div>
        <div class="card-body" id="listaInactivos"></div>
    </div>

</div>
`;

    fetch("/api/reportes/clientes")
        .then(res => res.json())
        .then(data => {

            if (!data) return;

            // ================= KPIs =================
            setText("kpiTotalClientes", data.totalClientes);
            setText("kpiActivos", data.clientesActivos);
            setText("kpiInactivos", data.clientesInactivos);
            setText("kpiPorcentaje", `${data.porcentajeInactivos?.toFixed(1) ?? 0}%`);
            console.log("TOP CLIENTES:", data.topClientes);

            // ================= TOP CLIENTES =================
            const top = data.topClientes || [];

            document.getElementById("topClientes").innerHTML = top.length
                ? top.map(c => `
                    <div class="d-flex justify-content-between border-bottom py-1">
<span>${c.nombreCompleto?? "Sin nombre"}</span>
                        <strong class="text-success">S/ ${c.totalGastado.toFixed(2)}</strong>
                    </div>
                `).join("")
                : "<div class='text-muted'>Sin datos</div>";

            // ================= ALERTAS =================
            document.getElementById("alertasClientes").innerHTML =
                data.alertas?.length
                    ? data.alertas.map(a => `<div>⚠ ${a}</div>`).join("")
                    : "<div class='text-success'>Sin alertas</div>";

            // ================= INACTIVOS =================
            const inactivos = data.clientesInactivos || [];

            document.getElementById("listaInactivos").innerHTML =
                inactivos.length
                    ? inactivos.map(c => `
                        <div class="border-bottom py-2">
                            <b>${c.nombre}</b> <br>
                            <small class="text-muted">
                                Última compra: ${c.ultimaCompra ?? "Nunca"}
                            </small>
                        </div>
                    `).join("")
                    : "<div class='text-success'>No hay clientes inactivos </div>";

        })
        .catch(err => {
            console.error("Error cargando reporte clientes:", err);
        });
}

// helper
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}













// ***************************************REPORTES  RENTABILIDAD

let chartRentabilidad = null;
let timeoutSim = null;

// CARGAR DASHBOARD
function loadReporteRentabilidad() {

    const container = document.getElementById("dynamic-report-content");
    if (!container) return;

    container.innerHTML = `
<div id="reporteRentabilidad">

    <!-- ================= KPIs ================= -->
    <div class="row g-3 mb-4">

        <div class="col-md-3">
            <div class="card border-success shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-cash fs-2 text-success"></i>
                       <h6>Ventas Totales de todos los productos que fueron vendidos  </h6>
                 <h3 id="kpiVentas">0</h3>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card border-danger shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-bank fs-2 text-danger"></i>
                    <h6>Costo Total de produccion de todos los productos vendidos</h6>
                    <h3 id="kpiCosto">0</h3>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card border-primary shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-graph-up fs-2 text-primary"></i>
                    <h6>Utilidad: Ganancia real después de restar costos de produción</h6>
                    <h3 id="kpiUtilidad">0</h3>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card border-warning shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-percent fs-2 text-warning"></i>
                    <h6>Margen: Porcentaje de ganancia sobre las ventas realizadas</h6>
                    <h3 id="kpiMargen">0%</h3>
                </div>
            </div>
        </div>

    </div>

    <!-- ================= TOP + ALERTAS ================= -->
    <div class="row g-3 mb-4">

        <div class="col-md-6">
            <div class="card shadow-sm">
                <div class="card-header">🏆 Productos más rentables</div>
                <div class="card-body" id="topProductos"></div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="card shadow-sm">
                <div class="card-header text-danger">⚠ Alertas</div>
                <div class="card-body" id="alertas"></div>
            </div>
        </div>

    </div>

    <!-- ================= SIMULADOR ================= -->
    <div class="card shadow-sm mb-4">
        <div class="card-header">🧮 Simulador de costos</div>

        <div class="card-body">

            <div class="row g-2">

                <div class="col-md-5">
                    <select id="productoSim" class="form-control">
                        <option value="">Seleccione producto</option>
                    </select>
                </div>

                <div class="col-md-4">
                    <input type="number"
                           id="costoSim"
                           class="form-control"
                           placeholder="Costo por kilo"
                           min="0">
                </div>

                <div class="col-md-3">
                    <button class="btn btn-secondary w-100" onclick="simularRentabilidadManual()">
                        Recalcular
                    </button>
                </div>

            </div>

            <div id="resultadoSim" class="mt-3 text-muted">
                Ingresa datos para ver la rentabilidad...
            </div>

        </div>
    </div>

    <!-- ================= GRAFICO ================= -->
    <div class="card shadow-sm">
        <div class="card-header">📊 Rentabilidad</div>
        <div class="card-body">
            <canvas id="graficoRentabilidad"></canvas>
        </div>
    </div>

</div>
`;

    fetch("/admin/rentabilidad/dashboard")
        .then(res => res.json())
        .then(data => {

            if (!data) return;

            // ================= KPIs =================
            setText("kpiVentas", `S/ ${data.totalVentas?.toFixed(2) ?? 0}`);
            setText("kpiCosto", `S/ ${data.totalCosto?.toFixed(2) ?? 0}`);
            setText("kpiUtilidad", `S/ ${data.utilidadTotal?.toFixed(2) ?? 0}`);
            setText("kpiMargen", `${data.margenTotal?.toFixed(2) ?? 0}%`);

            // ================= TOP =================
            const top = (data.productos || []).slice(0, 5);

            document.getElementById("topProductos").innerHTML = top.length
                ? top.map(p => `
                    <div class="d-flex justify-content-between border-bottom py-1">
                        <span>${p.nombre}</span>
                        <strong class="text-success">S/ ${p.utilidad.toFixed(2)}</strong>
                    </div>
                `).join("")
                : "<div class='text-muted'>Sin datos</div>";

            // ================= ALERTAS =================
            document.getElementById("alertas").innerHTML =
                data.alertas?.length
                    ? data.alertas.map(a => `<div>⚠ ${a}</div>`).join("")
                    : "<div class='text-success'>Sin alertas</div>";

            // ================= SELECT =================
            const select = document.getElementById("productoSim");
            select.innerHTML = `
                <option value="">Seleccione producto</option>
                ${(data.productos || []).map(p =>
                    `<option value="${p.productoId}">${p.nombre}</option>`
                ).join("")}
            `;

            // ================= EVENTOS SIMULADOR =================
            iniciarSimuladorRentabilidad();

            // ================= GRAFICO =================
            renderGraficoRentabilidad(data.productos || []);
        })
        .catch(err => {
            console.error(err);
        });
}

// HELPERS
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

// GRAFICO

function renderGraficoRentabilidad(productos) {

    if (!productos?.length) return;

    if (chartRentabilidad) chartRentabilidad.destroy();

    const top = [...productos]
        .sort((a, b) => b.utilidad - a.utilidad)
        .slice(0, 7);

    chartRentabilidad = new Chart(
        document.getElementById("graficoRentabilidad"),
        {
            type: "bar",
            data: {
                labels: top.map(p => p.nombre),
                datasets: [{
                    label: "Utilidad S/",
                    data: top.map(p => p.utilidad)
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

// SIMULADOR
function iniciarSimuladorRentabilidad() {

    const producto = document.getElementById("productoSim");
    const costo = document.getElementById("costoSim");

    if (!producto || !costo) return;

    producto.onchange = simularRentabilidadAuto;
    costo.oninput = simularRentabilidadAuto;
}

function simularRentabilidadAuto() {

    clearTimeout(timeoutSim);

    timeoutSim = setTimeout(() => {

        const productoId = document.getElementById("productoSim").value;
        const costo = parseFloat(document.getElementById("costoSim").value);

        if (!productoId || !costo || costo <= 0) {
            document.getElementById("resultadoSim").innerHTML =
                `<div class="text-muted">Ingrese datos válidos</div>`;
            return;
        }

        document.getElementById("resultadoSim").innerHTML =
            `<div class="text-primary">Calculando...</div>`;

        fetch("/admin/rentabilidad/simular", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productoId, costoPorKilo: costo })
        })
        .then(res => res.json())
        .then(data => {

            let mensaje = "Sin análisis";
            let color = "info";

            if (data.margenTotal >= 30) {
                mensaje = "🟢 Excelente rentabilidad";
                color = "success";
            } else if (data.margenTotal >= 10) {
                mensaje = "🟡 Rentabilidad aceptable";
                color = "warning";
            } else if (data.margenTotal > 0) {
                mensaje = "🟠 Rentabilidad baja";
                color = "warning";
            } else {
                mensaje = "🔴 Pérdida detectada";
                color = "danger";
            }

            document.getElementById("resultadoSim").innerHTML = `
                <div class="alert alert-${color}">
                    <b>Utilidad:</b> S/ ${data.utilidadTotal.toFixed(2)} <br>
                    <b>Margen:</b> ${data.margenTotal.toFixed(2)}% <br>
                    <hr>
                    ${mensaje}
                </div>
            `;
        })
        .catch(() => {
            document.getElementById("resultadoSim").innerHTML =
                `<div class="alert alert-danger">Error en simulación</div>`;
        });

    }, 300);
}


















//************************************* reporte  SOLO PEDIDOS

let chartPedidosMes = null;

function loadPedidosReport() {

    const container = document.getElementById("dynamic-report-content");

    container.innerHTML = "";

    container.innerHTML = `
<div id="reportePedidos">

    <!-- ================= FILA PRINCIPAL ================= -->
    <div class="row g-3 mb-4">

 
        <div class="col-md-4">
            <div class="card border-primary shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-box-seam fs-2 text-primary"></i>
                    <h6>Total Pedidos</h6>
                    <h2 id="kpiTotalPedidos">0</h2>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card border-warning shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-hourglass-split fs-2 text-warning"></i>
                    <h6>Pendientes</h6>
                    <h2 id="kpiPendientes">0</h2>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card border-success shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-check-circle fs-2 text-success"></i>
                    <h6>Entregados</h6>
                    <h2 id="kpiEntregados">0</h2>
                </div>
            </div>
        </div>

    </div>

    <!-- ================= FILA SECUNDARIA ================= -->
    <div class="row g-3 mb-4">

        <div class="col-md-4">
            <div class="card border-secondary shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-receipt fs-3 text-secondary"></i>
                    <h6>Gasto promedio por pedido</h6>
                    <h4 id="kpiTicket">0</h4>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card border-secondary shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-calendar-event fs-3 text-secondary"></i>
                    <h6>Mejor mes</h6>
                    <h4 id="kpiMejorMes">-</h4>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card border-secondary shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-graph-up-arrow fs-3 text-secondary"></i>
                    <h6>Tasa de entrega</h6>
                    <h4 id="kpiTasa">0%</h4>
                </div>
            </div>
        </div>

    </div>

    <!-- ================= ZONA LATERAL (FACTURADO + ULTIMO PEDIDO) ================= -->
    <div class="row g-3 mb-4">

        <div class="col-md-4">
            <div class="card border-danger shadow-sm h-100">
                <div class="card-body text-center">
                    <i class="bi bi-cash-coin fs-2 text-danger"></i>
                    <h6>Total facturado</h6>
                    <h2 id="kpiFacturado">0</h2>
                </div>
            </div>
        </div>

        <div class="col-md-8">
            <div class="card border-secondary shadow-sm h-100">
                <div class="card-body">
                    <i class="bi bi-clock-history fs-3 text-secondary"></i>
                    <h6>Último pedido que solicitó el usuario por la web</h6>
                    <div id="kpiUltimo">-</div>
                </div>
            </div>
        </div>

    </div>

    <!-- ================= GRAFICO ================= -->
    <div class="row">

        <div class="col-lg-12">
            <div class="card shadow-sm">
                <div class="card-header">
                    <i class="bi bi-bar-chart-line me-2"></i>
                    Pedidos realizados por los usuarios desde la web
                </div>
                <div class="card-body">
                    <canvas id="graficoPedidosMes"></canvas>
                </div>
            </div>
        </div>

    </div>

</div>
`;
    fetch("/admin/reportes/pedidos")
        .then(res => res.json())
        .then(data => {

            // ================= KPIs =================

            document.getElementById("kpiTotalPedidos").textContent =
                data.totalPedidos ?? 0;

            document.getElementById("kpiPendientes").textContent =
                data.pendientes ?? 0;

            document.getElementById("kpiEntregados").textContent =
                data.entregados ?? 0;

            document.getElementById("kpiFacturado").textContent =
                `S/ ${(data.totalFacturado ?? 0).toFixed(2)}`;

            document.getElementById("kpiTicket").textContent =
                `S/ ${(data.ticketPromedio ?? 0).toFixed(2)}`;

            document.getElementById("kpiMejorMes").textContent =
                data.mejorMes ?? "-";

            document.getElementById("kpiTasa").textContent =
                `${(data.tasaEntrega ?? 0).toFixed(2)}%`;
document.getElementById("kpiUltimo").innerHTML =
    data.ultimoPedido
        ? `
        <div>

            <!-- ================= DATOS ================= -->
            <div class="mb-3">

                <div class="fw-bold text-primary fs-5 mb-2">
                    <i class="bi bi-receipt"></i>
                    Pedido #${data.ultimoPedido.id}
                </div>

                <div class="d-flex flex-wrap gap-4 fs-6 fw-semibold">

                    <div>
                        <i class="bi bi-person text-secondary me-1"></i>
                        ${data.ultimoPedido.usuario}
                    </div>

                    <div>
                        <i class="bi bi-credit-card text-secondary me-1"></i>
                        DNI: ${data.ultimoPedido.telefono}
                    </div>

                    <div>
                        <i class="bi bi-flag text-secondary me-1"></i>
                        ${data.ultimoPedido.estado}
                    </div>

                    <div>
                        <i class="bi bi-calendar-event text-secondary me-1"></i>
                        ${new Date(data.ultimoPedido.fechaPedido).toLocaleString()}
                    </div>

                </div>

                <div class="fw-bold text-success fs-5 mt-2">
                    <i class="bi bi-cash me-1"></i>
                    S/ ${Number(data.ultimoPedido.total).toFixed(2)}
                </div>

            </div>

            <hr>

            <!-- ================= PRODUCTOS ================= -->
            <div>

                <div class="fw-bold text-dark fs-6 mb-3">
                    <i class="bi bi-bag"></i> Productos comprados
                </div>

                <div class="row g-2">

                    ${
                        data.ultimoPedido.productos.map(p => `
                            <div class="col-md-6">

                                <div class="d-flex justify-content-between align-items-center border rounded p-2 shadow-sm">

                                    <div class="fw-semibold fs-6">
                                        ${p.nombre}
                                        <span class="text-muted">x${p.cantidad}</span>
                                    </div>

                                    <div class="fw-bold text-success fs-6">
                                        S/ ${Number(p.subtotal).toFixed(2)}
                                    </div>

                                </div>

                            </div>
                        `).join("")
                    }

                </div>

            </div>

        </div>
        `
        : "-";
            // ================= CHART =================

            if (chartPedidosMes) chartPedidosMes.destroy();

            const labels = Object.keys(data.pedidosPorMes || {});
            const values = Object.values(data.pedidosPorMes || {});

            chartPedidosMes = new Chart(
                document.getElementById("graficoPedidosMes"),
                {
                    type: "bar",
                    data: {
                        labels: labels,
                        datasets: [{
                            label: "Pedidos",
                            data: values,
                            backgroundColor: "#0d6efd"
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

        })
        .catch(err => {
            console.error("Error cargando reporte de pedidos:", err);
        });
}

















//************************************REPORTE REAL PARA VENTAS 

let chartVentasMes = null;
let chartProductos = null;

function loadVentasReport() {

    const container = document.getElementById("dynamic-report-content");

    container.innerHTML = "";

    container.innerHTML = `
        <div id="reporteVentas">

            <div class="row g-3 mb-4">

                <div class="col-md-4">
                    <div class="card border-success shadow-sm">
                        <div class="card-body text-center">
                            <i class="bi bi-cash-stack fs-2 text-success"></i>
                            <h6>Total Ventas</h6>
                            <h2 id="kpiTotalVentas">0</h2>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card border-primary shadow-sm">
                        <div class="card-body text-center">
                            <i class="bi bi-trophy fs-2 text-primary"></i>
                            <h6>Producto más vendido</h6>
                            <h5 id="kpiProductoTop">-</h5>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card border-warning shadow-sm">
                        <div class="card-body text-center">
                            <i class="bi bi-calendar-event fs-2 text-warning"></i>
                            <h6>Mejor mes</h6>
                            <h5 id="kpiMejorMes">-</h5>
                        </div>
                    </div>
                </div>

            </div>

            <div class="row">

                <div class="col-lg-6">
                    <div class="card shadow-sm">
                        <div class="card-header">Ventas por mes</div>
                        <div class="card-body">
                            <canvas id="graficoVentasMes"></canvas>
                        </div>
                    </div>
                </div>

                <div class="col-lg-6">
                    <div class="card shadow-sm">
                        <div class="card-header">Top productos vendidos</div>
                        <div class="card-body">
                            <canvas id="graficoProductos"></canvas>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    `;

    fetch("/admin/pedidos/reportes-ventas")
        .then(r => r.json())
        .then(data => {

            
            // KPIs
    
            document.getElementById("kpiTotalVentas").textContent =
                `$${data.totalVentas.toFixed(2)}`;

            document.getElementById("kpiProductoTop").textContent =
                data.productoMasVendido;

            document.getElementById("kpiMejorMes").textContent =
                data.mejorMes;

          
            // destruir charts viejos
            if (chartVentasMes) chartVentasMes.destroy();
            if (chartProductos) chartProductos.destroy();

            
            // ventas por mes
          
            chartVentasMes = new Chart(
                document.getElementById("graficoVentasMes"),
                {
                    type: "bar",
                    data: {
                        labels: Object.keys(data.ventasPorMes),
                        datasets: [{
                            label: "Ventas ($)",
                            data: Object.values(data.ventasPorMes),
                            backgroundColor: "#0d6efd"
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                display: false
                            }
                        }
                    }
                }
            );

            //  productos + vendidos
            
            chartProductos = new Chart(
                document.getElementById("graficoProductos"),
                {
                    type: "doughnut",
                    data: {
                        labels: Object.keys(data.rankingProductos),
                        datasets: [{
                            data: Object.values(data.rankingProductos),
                            backgroundColor: [
                                "#198754",
                                "#0d6efd",
                                "#ffc107",
                                "#dc3545",
                                "#6610f2"
                            ]
                        }]
                    }
                }
            );

        })
        .catch(err => {
            console.error("Error cargando reportes de ventas:", err);
        });
}


















//************************************REPORTE PARA VIUSTAS TECNICAS REALES

let chartEstados = null;
let chartEspecialistas = null;

function loadVisitasReport() {

    const container = document.getElementById("dynamic-report-content");

    container.innerHTML = "";

    container.innerHTML = `
        <div id="reporteVisitas">

<div class="row g-3 mb-4 bg-white">
    

                <div class="col-md-3">
                    <div class="card border-success shadow-sm">
                        <div class="card-body text-center">
                            <i class="bi bi-calendar-week fs-2 text-success"></i>
                            <h6>Esta semana</h6>
                            <h2 id="kpiSemana">0</h2>
                        </div>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="card border-primary shadow-sm">
                        <div class="card-body text-center">
                            <i class="bi bi-calendar-month fs-2 text-primary"></i>
                            <h6>Este mes</h6>
                            <h2 id="kpiMes">0</h2>
                        </div>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="card border-warning shadow-sm">
                        <div class="card-body text-center">
                            <i class="bi bi-hourglass-split fs-2 text-warning"></i>
                            <h6>Pendientes</h6>
                            <h2 id="kpiPendientes">0</h2>
                        </div>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="card border-success shadow-sm">
                        <div class="card-body text-center">
                            <i class="bi bi-check-circle fs-2 text-success"></i>
                            <h6>Finalizadas</h6>
                            <h2 id="kpiFinalizadas">0</h2>
                        </div>
                    </div>
                </div>

            </div>

            <div class="row">

                <div class="col-lg-6">
                    <div class="card shadow-sm">
                        <div class="card-header">Estado de Visitas</div>
                        <div class="card-body">
                            <canvas id="graficoEstados"></canvas>
                        </div>
                    </div>
                </div>

                <div class="col-lg-6">
                    <div class="card shadow-sm">
                        <div class="card-header">Especialistas</div>
                        <div class="card-body">
                            <canvas id="graficoEspecialistas"></canvas>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    `;

    fetch("/api/visitas/reportes")
        .then(r => r.json())
        .then(data => {

            document.getElementById("kpiSemana").textContent = data.estaSemana;
            document.getElementById("kpiMes").textContent = data.esteMes;
            document.getElementById("kpiPendientes").textContent = data.pendientes;
            document.getElementById("kpiFinalizadas").textContent = data.finalizadas;

            // destruir gráficos anteriores
            if (chartEstados) chartEstados.destroy();
            if (chartEspecialistas) chartEspecialistas.destroy();

            chartEstados = cargarGraficoEstados(data);
            chartEspecialistas = cargarGraficoEspecialistas(data);
        });
}


function cargarGraficoEspecialistas(data) {

    const nombres = data.especialistas.map(e => e[0]);
    const totales = data.especialistas.map(e => e[1]);

    return new Chart(
        document.getElementById("graficoEspecialistas"),
        {
            type: "bar",
            data: {
                labels: nombres,
                datasets: [{
                    label: "Visitas",
                    data: totales,
                    backgroundColor: "#198754"
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        }
    );
}

function cargarGraficoEstados(data) {

    const ctx = document.getElementById("graficoEstados");

    return new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Pendientes", "Programadas", "Finalizadas"],
            datasets: [{
                data: [
                    data.pendientes,
                    data.programadas,
                    data.finalizadas
                ],
                backgroundColor: ["#ffc107", "#0d6efd", "#198754"]
            }]
        }
    });
}
















