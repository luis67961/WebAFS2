document.addEventListener("DOMContentLoaded", () => {
    cargarDashboardVendedor();
});

async function cargarDashboardVendedor() {

    const res = await fetch("/vendedor/stats");
    const data = await res.json();

    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    };

    set("pedidos", data.pedidos ?? 0);
    set("visitas", data.visitas ?? 0);
    set("clientes", data.clientes ?? 0);

    set("pedidosSemana", data.pedidosSemana ?? 0);
    set("visitasSemana", data.visitasSemana ?? 0);

 document.getElementById("ventas").innerText =
    "S/ " + (data.ventas ?? 0).toFixed(2);

document.getElementById("ventasSemana").innerText =
    "S/ " + (data.ventasSemana ?? 0).toFixed(2);
}

let alertas = [];

document.addEventListener("DOMContentLoaded", () => {

    cargarAlertas();

    setInterval(cargarAlertas, 6000);

});

//CARGAR IMG DE GITHUB XD
function cargarImagen(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            resolve(canvas.toDataURL("image/png"));
        };
    });
}
//REPORTES

async function crearPDF(titulo, columnas, filas) {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    const logo = await cargarImagen(
        "https://raw.githubusercontent.com/davonlzz18/multimedia/main/LOGOTIPO%20AI-10.png"
    );

    doc.addImage(logo, "PNG", 10, 8, 30, 30);

    doc.setFontSize(18);
    doc.text(titulo, 45, 18);

    doc.setFontSize(10);
    doc.text("SISTEMA DE REPORTES - ANIMAL FEED SOLUTIONS", 45, 25);
    doc.text("Fecha: " + new Date().toLocaleString(), 45, 32);

    // TABLA
    doc.autoTable({
        startY: 45,
        head: [columnas],
        body: filas,
        styles: {
            fontSize: 10
        },
        headStyles: {
            fillColor: [13, 110, 253]
        }
    });

    doc.save(titulo.replace(/\s+/g, "_") + ".pdf");
}

//PEDIDOS PDF

async function exportarPedidos() {

    const res = await fetch("/vendedor/reporte/pedidos");
    const datos = await res.json();

    const filas = datos.map(p => [
        p.id,
        p.cliente,
        p.fecha,
        p.estado,
        "S/ " + Number(p.total).toFixed(2)
    ]);

    crearPDF(
        "Reporte de Pedidos",
        ["ID","Cliente","Fecha","Estado","Total"],
        filas
    );

}


//Reporte de Visitas



async function exportarVisitas(){

    const res = await fetch("/vendedor/reporte/visitas");

    const datos = await res.json();

    const filas = datos.map(v=>[
        v.cliente,
        v.fecha,
        v.telefono,
        v.estado
    ]);

    crearPDF(
        "Reporte de Visitas Técnicas",
        ["Cliente","Fecha","Teléfono","Estado"],
        filas
    );

}


//Reporte de Clientes


async function exportarClientes(){

    const res=await fetch("/vendedor/reporte/clientes");

    const datos=await res.json();

    const filas=datos.map(c=>[
        c.nombre,
        c.dni,
        c.telefono,
        c.pedidos?.length ?? c.pedidos ?? 0
    ]);

    crearPDF(
        "Reporte de Clientes",
        ["Nombre","DNI","Teléfono","Pedidos"],
        filas
    );

}




//Reporte de Ventas

async function exportarVentas(){

    const res=await fetch("/vendedor/reporte/ventas");

    const datos=await res.json();

    const filas=datos.map(v=>[
        v.tipo,
        v.cliente,
        v.fecha,
        "S/ "+Number(v.total).toFixed(2)
    ]);

    crearPDF(
        "Reporte General de Ventas",
        ["Tipo","Cliente","Fecha","Total"],
        filas
    );

}


//VISITAS DE LA WEB

// VISITAS DE LA WEB

const paginasBonitas = {
    "/": "Página Principal",
    "/miCuenta": "Cuenta de Usuario",
    "/iniciar-sesion": "Inicio de Sesión",
    "/tienda": "Tienda"
};


let graficaVisitas = null;


// Ejecutar cuando cargue la página
document.addEventListener("DOMContentLoaded", () => {
    cargarAnalytics();
});



// Cargar datos de analytics
async function cargarAnalytics() {

    try {

        const [totalRes, activosRes, paginasRes] = await Promise.all([
            fetch("/analytics/total-visitas"),
            fetch("/analytics/activos"),
            fetch("/analytics/por-pagina")
        ]);


        const total = await totalRes.json();
        const activos = await activosRes.json();
        const paginas = await paginasRes.json();



        // Mostrar tarjetas superiores

        const totalElemento = document.getElementById("totalVisitas");
        const activosElemento = document.getElementById("usuariosActivos");


        if (totalElemento) {
            totalElemento.innerText = total;
        }


        if (activosElemento) {
            activosElemento.innerText = activos;
        }




        // Preparar datos para la gráfica

        const nombresPaginas = [];
        const cantidadVisitas = [];


        paginas.forEach(p => {

            const nombre = paginasBonitas[p.pagina] || p.pagina;

            nombresPaginas.push(nombre);

            cantidadVisitas.push(p.visitas);

        });





        // Crear gráfica

        const canvas = document.getElementById("graficaVisitas");


        if (!canvas) {
            console.error("No existe el canvas graficaVisitas");
            return;
        }



        const ctx = canvas.getContext("2d");



        // Evitar duplicar gráficas

        if (graficaVisitas !== null) {

            graficaVisitas.destroy();

        }




        graficaVisitas = new Chart(ctx, {

            type: "bar",


            data: {

                labels: nombresPaginas,


                datasets: [
                    {

                        label: "Visitas",

                        data: cantidadVisitas,


                        borderRadius: 12,


                        backgroundColor: [
                            "#ffc107",
                            "#198754",
                            "#0d6efd",
                            "#dc3545"
                        ],


                        hoverBackgroundColor: [
                            "#ffca2c",
                            "#20c997",
                            "#3d8bfd",
                            "#bb2d3b"
                        ]

                    }
                ]

            },



            options: {


                responsive: true,


                maintainAspectRatio: false,



                plugins: {


                    legend: {

                        display: false

                    },


                    tooltip: {

                        backgroundColor: "#212529",

                        padding: 12,

                        cornerRadius: 10,


                        callbacks: {

                            label: function(context) {

                                return " Visitas: " + context.raw;

                            }

                        }

                    }

                },




                scales: {


                    y: {

                        beginAtZero: true,


                        ticks: {

                            precision: 0

                        },


                        grid: {

                            color: "rgba(0,0,0,0.08)"

                        }

                    },



                    x: {

                        ticks: {

                            maxRotation: 40,

                            minRotation: 0

                        },


                        grid: {

                            display: false

                        }

                    }

                }



            }


        });



    } catch (error) {


        console.error("Error cargando analytics:", error);


    }

}


//MODAL DE USUARIOS ACTIVOS: 
document.getElementById("modalActivos").addEventListener("show.bs.modal", async () => {

    try {

        const res = await fetch("/analytics/activos-lista");

        const data = await res.json();

        const tbody = document.getElementById("tablaActivos");
        tbody.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-warning">
                        No hay usuarios activos en este momento
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach(u => {

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${u.id ?? "NULL"}</td>
                <td>${u.nombre ?? "NULL"}</td>
                <td>${u.dni ?? "NULL"}</td>
                <td>${u.whatsapp ?? "NULL"}</td>
                <td>
                    <a class="btn btn-success btn-sm"
                       href="https://wa.me/51${u.whatsapp}"
                       target="_blank">
                       WhatsApp
                    </a>
                </td>
            `;

            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error cargando usuarios activos:", error);
    }
});






// OBTENER ALERTAS

async function cargarAlertas() {

    try {

        const res = await fetch("/alertas");

        if (!res.ok) throw new Error("Error al cargar alertas");

        alertas = await res.json() || [];

        mostrarAlertas(alertas);

    } catch (error) {

        console.error("Error:", error);

        document.getElementById("listaAlertas").innerHTML = `
            <div class="text-center text-danger py-3">
                Error al cargar alertas
            </div>
        `;
    }
}



// MOSTRAR ALERTAS

function mostrarAlertas(lista) {

    const contenedor = document.getElementById("listaAlertas");

    contenedor.innerHTML = "";

    if (!lista || lista.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center text-muted py-5">
                No existen alertas.
            </div>
        `;
        return;
    }

   lista.forEach(a => {

    const estilo = obtenerEstiloAlerta(a.tipo);

    contenedor.innerHTML += `
        <div class="alert-item border ${estilo.border} rounded-3 p-3 mb-2 shadow-sm bg-dark">

            <div class="d-flex justify-content-between align-items-start">

                <div class="d-flex gap-2">

                    <i class="bi ${estilo.icono} ${estilo.color} fs-5"></i>

                    <div class="flex-grow-1">

                        <!-- TÍTULO: Blanco y Bold -->
                        <div class="fw-bold text-white mb-1 fs-6">
                            ${a.titulo ?? "Sin título"}
                        </div>

                        <!-- MENSAJE: Blanco suave -->
                        <div class="text-light">
                            ${a.mensaje ?? ""}
                        </div>

                        <div class="small mt-2">

                            <!-- BADGE: Con texto blanco -->
                            <span class="badge ${estilo.badge} fw-bold">
                                ${a.tipo ?? "SIN TIPO"}
                            </span>

                        </div>

                    </div>
                </div>

                <!-- FECHA: Blanco suave -->
                <small class="text-light-emphasis">
                    ${formatearTiempo(a.fecha)}
                </small>


                <!--  ELIMINAR -->
                    <button onclick="eliminarAlerta(${a.id}, this)" 
                            class="btn btn-sm btn-outline-danger border-0 px-2 py-1"
                            title="Eliminar alerta">
                        <i class="bi bi-trash3"></i>
                    </button>
            </div>

        </div>
    `;
});
}


// ELIMINAR ALERTA

let alertaIdAEliminar = null;
let elementoAlertaActual = null;


// ELIMINAR ALERTA 

function eliminarAlerta(id, boton) {

    alertaIdAEliminar = id;
    elementoAlertaActual = boton.closest('.alert-item');

    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('modalEliminar'));
    modal.show();
}

// Evento para el botn elimianr
document.getElementById('btnConfirmarEliminar').addEventListener('click', async () => {

    if (!alertaIdAEliminar) return;

    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEliminar'));

    try {
        const res = await fetch(`/alertas/${alertaIdAEliminar}`, {
            method: 'DELETE'
        });

        if (!res.ok) throw new Error("Error al eliminar");

        // Animación de salida
        elementoAlertaActual.style.transition = "all 0.3s ease";
        elementoAlertaActual.style.opacity = "0";
        elementoAlertaActual.style.transform = "translateX(30px)";

        setTimeout(() => {
            elementoAlertaActual.remove();

            // Si no quedan alertas
            if (document.querySelectorAll('.alert-item').length === 0) {
                document.getElementById("listaAlertas").innerHTML = `
                    <div class="text-center text-muted py-5">
                        No existen alertas.
                    </div>
                `;
            }

            modal.hide();
        }, 300);

    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo eliminar la alerta");
    }
});

// FILTRAR ALERTAS

function filtrarAlertas(tipo, btn) {
    document.querySelectorAll(".alert-card button")
        .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    let resultado;

    if (tipo === "TODAS") {
        resultado = alertas;
    } else if (tipo === "PRODUCTO") {
        resultado = alertas.filter(a => 
            (a.tipo || "").toUpperCase().includes("PRODUCTO")
        );
    } else {
        resultado = alertas.filter(a => 
            (a.tipo || "").toUpperCase().includes(tipo)
        );
    }

    mostrarAlertas(resultado);
}


// TIEMPO RELATIVO

function formatearTiempo(fecha) {

    if (!fecha) return "sin fecha";

    const ahora = new Date();
    const f = new Date(fecha.toString().replace(" ", "T"));

    if (isNaN(f.getTime())) return "fecha inválida";

    const segundos = Math.floor((ahora - f) / 1000);

    if (segundos < 60) return "hace unos segundos";

    const minutos = Math.floor(segundos / 60);

    if (minutos < 60) return `hace ${minutos} min`;

    const horas = Math.floor(minutos / 60);

    if (horas < 24) return `hace ${horas} h`;

    const dias = Math.floor(horas / 24);

    return `hace ${dias} días`;
}




// ESTILOS
function obtenerEstiloAlerta(tipo) {

    const t = (tipo || "").toString().trim().toUpperCase();
    console.log("Tipo recibido:", tipo, "→ Procesado:", t);  

    //  LAS ALERTAS DE PRODUCTOS → Verde
    if (t.includes("PRODUCTO")) {
        return {
            border: "border-success",
            icono: "bi-box-seam",
            color: "text-success",
            badge: "bg-success text-white"
        };
    }

    //  VENTAS
    if (t.includes("VENTA")) {
        return {
            border: "border-warning",
            icono: "bi-cart-check",
            color: "text-warning",
            badge: "bg-warning"
        };
    }

    //  DEFAULT
    return {
        border: "border-primary",
        icono: "bi-info-circle",
        color: "text-primary",
        badge: "bg-primary"
    };
}















// Mostrar credenciales (nombre y correo) al ingresar en el navbar

document.addEventListener("DOMContentLoaded", cargarUsuarioSesion);



function cargarUsuarioSesion(){


    fetch("/auth/usuario")


    .then(res => res.json())


    .then(data => {


        if(data.ok){



            // Mostrar nombre

            document.getElementById("nombreAdminSesion").textContent =
                data.nombre;



            // Mostrar correo

            document.getElementById("correoAdminSesion").textContent =
                data.correo;




            // Avatar con inicial

            const inicial =
                data.nombre.charAt(0).toUpperCase();



            document.getElementById("avatarAdmin").textContent =
                inicial;




            // Mensaje de bienvenida

            const mensaje =
                document.getElementById("mensajeBienvenida");


            if(mensaje){


               mensaje.innerHTML =
    "👋 Bienvenido <span class='nombre-bienvenida'>" 
    + data.nombre +
    "</span> al sistema de Animal Feed Solutions. Aquí podrás gestionar y administrar la información de la empresa.";


            }


        }


    })


    .catch(error => console.log(error));


}













