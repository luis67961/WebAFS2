document.addEventListener("DOMContentLoaded", () => {

    cargarStats();
    cargarPedidos();
    setInterval(cargarAlerta, 2000);

});

//  STATS 
async function cargarStats() {
    const res = await fetch("/admin/pedidos/stats");
    const data = await res.json();

    document.getElementById("totalPedidos").innerText = data.totalPedidos;
    document.getElementById("pendientes").innerText = data.pendientes;
    document.getElementById("entregados").innerText = data.entregados;
    document.getElementById("facturado").innerText = "S/ " + data.facturado.toFixed(2);
}



//VENTAS MANUALES
async function cargarStatsExtras() {

    const res = await fetch("/admin/pedidos/stats");
    const data = await res.json();

    // ventas totales 
    document.getElementById("ventasTotales").innerText =
        data.ventasTotales ?? 0;

    // facturación manual 
    document.getElementById("facturadoManual").innerText =
        "S/ " + (data.facturadoManual ? data.facturadoManual.toFixed(2) : "0.00");

    // entregados manuales
    document.getElementById("entregadosManuales").innerText =
        data.entregadosManuales ?? 0;


        const facturacionTotal =
    (data.facturado ?? 0) + (data.facturadoManual ?? 0);

document.getElementById("facturacionTotal").innerText =
    "S/ " + facturacionTotal.toFixed(2);
}

document.addEventListener("DOMContentLoaded", () => {
    const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );

    
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

cargarStatsExtras();

//  PEDIDOS 
async function cargarPedidos() {

    const res = await fetch("/admin/pedidos");
    const data = await res.json();

    const pendientes = document.getElementById("tablaPendientes");
    const aprobados = document.getElementById("tablaAprobados");
    const historial = document.getElementById("tablaHistorial");

    pendientes.innerHTML = "";
    aprobados.innerHTML = "";
    historial.innerHTML = "";

    data.forEach(p => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.nombreCliente ?? "-"}</td>
            <td>${p.dni ?? "-"}</td>
            <td>${p.telefono ?? "-"}</td>
            <td>S/ ${p.total.toFixed(2)}</td>
            <td>${p.estado}</td>
        `;

        // PENDIENTES
        if (p.estado === "PENDIENTE") {
            tr.style.cursor = "pointer";
            tr.onclick = () => abrirModal(p);
            pendientes.appendChild(tr);
        }

        // APROBADOS
else if (p.estado === "APROBADO") {

    tr.classList.add("fila-aprobado");

    // Guardar TODO el pedido
    tr.dataset.pedido = JSON.stringify(p);

    tr.style.cursor = "pointer";

    aprobados.appendChild(tr);
}
        // HISTORIAL
        else if (p.estado === "ENTREGADO") {

    const tr = document.createElement("tr");

    tr.classList.add("fila-historial");

    tr.dataset.pedido = JSON.stringify(p);

    tr.style.cursor = "pointer";

    tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.nombreCliente ?? "-"}</td>
        <td>${p.dni ?? "-"}</td>
        <td>${p.telefono ?? "-"}</td>
        <td>S/ ${p.total.toFixed(2)}</td>
        <td><span class="badge bg-secondary">ENTREGADO</span></td>
    `;

    historial.appendChild(tr);
}
    });
}


























let pedidoSeleccionado = null;

document.addEventListener("DOMContentLoaded", () => {
    cargarPedidos();
    cargarStats();
});


function abrirModal(p) {

    pedidoSeleccionado = p;

    document.getElementById("modalId").innerText = p.id;
    document.getElementById("modalTotal").innerText = p.total;
    document.getElementById("modalTelefono").innerText = p.telefono;

   
    const lista = document.getElementById("modalItems");
    lista.innerHTML = "";

    let resumen = "";

    if (p.items && p.items.length > 0) {

        p.items.forEach(i => {

            const li = document.createElement("li");
            li.innerText = `${i.producto} → kilos: ${i.cantidad}`;
            lista.appendChild(li);

            //  para WhatsApp
            resumen += `• ${i.producto} --> kilos: ${i.cantidad}\n`;
        });

    } else {
        lista.innerHTML = "<li>Sin productos</li>";
        resumen = "Sin productos\n";
    }

  
    // MENSAJE WHATSAPP
 
    const mensaje = encodeURIComponent(
`Hola 👋 ${p.nombreCliente}

Su pedido #${p.id} ha sido registrado correctamente.

🛒 Detalle de su compra:
${resumen}

💰 Total a pagar: S/ ${p.total}

 Para aprobar su pedido debe cancelar el total indicado.
 A continuación nuestro personal le estara proporcionando los metodos de pago.
 

Gracias por su preferencia 🙌`
    );

    document.getElementById("btnWhatsApp").href =
        `https://wa.me/51${p.telefono}?text=${mensaje}`;

    new bootstrap.Modal(document.getElementById("pedidoModal")).show();
}





//PARA LA SEGUNDA TABLA DE PEDIDOS APROBADOSSS



let pedidoSeleccionadoAprobado = null;

document.addEventListener("click", (e) => {

    const fila = e.target.closest(".fila-aprobado");
    if (!fila) return;

    // Recuperar el pedido completo
    pedidoSeleccionadoAprobado = JSON.parse(fila.dataset.pedido);

    document.getElementById("aprobadoId").innerText =
        pedidoSeleccionadoAprobado.id;

    document.getElementById("aprobadoTelefono").innerText =
        pedidoSeleccionadoAprobado.telefono;
        const lista = document.getElementById("aprobadoItems");
lista.innerHTML = "";

if (pedidoSeleccionadoAprobado.items &&
    pedidoSeleccionadoAprobado.items.length > 0) {

    pedidoSeleccionadoAprobado.items.forEach(i => {

        const li = document.createElement("li");

        li.className =
            "list-group-item bg-secondary text-white border-secondary";

        li.innerHTML = `
            <b>${i.producto}</b>
            <span class="float-end">
                ${i.cantidad} kg
            </span>
        `;

        lista.appendChild(li);
    });

} else {

    lista.innerHTML = `
        <li class="list-group-item bg-secondary text-white border-secondary">
            No hay productos.
        </li>
    `;
}

    // Resumen de productos
    let resumen = "";

    if (pedidoSeleccionadoAprobado.items &&
        pedidoSeleccionadoAprobado.items.length > 0) {

        pedidoSeleccionadoAprobado.items.forEach(i => {
            resumen += `• ${i.producto} → kilos: ${i.cantidad}\n`;
        });

    } else {
        resumen = "Sin productos\n";
    }

    // Mensaje para WhatsApp
    const mensaje = encodeURIComponent(
`Hola 👋 ${pedidoSeleccionadoAprobado.nombreCliente}

Nos comunicamos de Comercial Animal Feed Solutions.

✅ Su pedido #${pedidoSeleccionadoAprobado.id} ya se encuentra preparado.

🛒 Resumen de su compra:

${resumen}

💰 Total cancelado: S/ ${pedidoSeleccionadoAprobado.total}

📦 Ya puede acercarse a nuestra tienda para recoger su pedido.

¡Muchas gracias por su compra! 😊`
    );

    document.getElementById("btnWhatsAppAprobado").href =
        `https://wa.me/51${pedidoSeleccionadoAprobado.telefono}?text=${mensaje}`;

    new bootstrap.Modal(
        document.getElementById("modalAprobado")
    ).show();
});


























/* ================================
   FINALIZAR PEDIDO - ENTREGADO
================================ */


let pedidoAEntregar = null;





document.getElementById("btnFinalizar")
.addEventListener("click", () => {


    if (!pedidoSeleccionadoAprobado) return;



    pedidoAEntregar = pedidoSeleccionadoAprobado;



    const modal = new bootstrap.Modal(
        document.getElementById("modalFinalizar")
    );


    modal.show();


});








// ================================
// CONFIRMAR ENTREGA
// ================================


document.getElementById("confirmarFinalizar")
.addEventListener("click", async () => {



    if (!pedidoAEntregar) return;




    try {



        const loader =
            document.getElementById("notificandoCorreo");



        const correoTexto =
            document.getElementById("correoNotificando");







        // ================================
        // MOSTRAR NOTIFICACIÓN
        // ================================


        if(loader){

            loader.style.display = "flex";

        }



        if(correoTexto){

            correoTexto.textContent =
                "Obteniendo cliente...";

        }






        await new Promise(resolve =>
            setTimeout(resolve,300)
        );








        // ================================
        // OBTENER CORREO CLIENTE
        // ================================


        const correoResponse = await fetch(
            `/admin/pedidos/correo/${pedidoAEntregar.id}`
        );



        const correoData =
            await correoResponse.json();




        if(correoData.ok && correoTexto){


            correoTexto.textContent =
                correoData.correo;


        }else{


            correoTexto.textContent =
                "Cargando...";


        }









        // ================================
        // CAMBIAR A ENTREGADO
        // ================================


        const response = await fetch(
            `/admin/pedidos/finalizar/${pedidoAEntregar.id}`,
            {
                method:"PUT"
            }
        );



        const data =
            await response.json();








        // ================================
        // VALIDAR RESPUESTA
        // ================================


        if(!data.ok){



            loader.style.display="none";



            alert(
                "❌ No se pudo finalizar el pedido"
            );



            return;


        }







        if(data.correo && correoTexto){


            correoTexto.textContent =
                data.correo;


        }








        // Mantener visible

        await new Promise(resolve =>
            setTimeout(resolve,1500)
        );







        // OCULTAR NOTIFICACIÓN


        if(loader){

            loader.style.display="none";

        }








        alert(
            "✅ Pedido entregado correctamente\n\n" +
            "Cliente notificado: " +
            (data.correo || correoData.correo)
        );








        // ================================
        // CERRAR MODALES
        // ================================


        const modalFinalizar =
            bootstrap.Modal.getInstance(
                document.getElementById("modalFinalizar")
            );



        if(modalFinalizar){

            modalFinalizar.hide();

        }





        const modalAprobado =
            bootstrap.Modal.getInstance(
                document.getElementById("modalAprobado")
            );



        if(modalAprobado){

            modalAprobado.hide();

        }









        cargarPedidos();

        cargarStats();




        pedidoAEntregar = null;







    }catch(error){



        console.error(
            "Error al finalizar pedido:",
            error
        );



        const loader =
            document.getElementById(
                "notificandoCorreo"
            );



        if(loader){

            loader.style.display="none";

        }



        alert(
            "❌ Error al entregar pedido"
        );



    }




});




























/* ================================
   APROBAR PEDIDO
================================ */


document.getElementById("btnAprobar")
.addEventListener("click", () => {


    if (!pedidoSeleccionado) return;


    const modal = new bootstrap.Modal(
        document.getElementById("modalAprobar")
    );


    modal.show();


});






document.getElementById("confirmarAprobar")
.addEventListener("click", async () => {


    try {



        // ================================
        // MOSTRAR NOTIFICACIÓN
        // ================================


        const loader =
            document.getElementById("notificandoCorreo");



        const correoTexto =
            document.getElementById("correoNotificando");



        if(loader){

            loader.style.display = "flex";

        }



        if(correoTexto){

         const correoResponse = await fetch(
    `/admin/pedidos/correo/${pedidoSeleccionado.id}`
);


const correoData = await correoResponse.json();



if(correoData.ok && correoTexto){


    correoTexto.textContent =
        correoData.correo;


}else{


    correoTexto.textContent =
        "Cargando...";


}

        }





        // ================================
        // APROBAR PEDIDO
        // ================================


        const response = await fetch(
            `/admin/pedidos/aprobar/${pedidoSeleccionado.id}`,
            {
                method:"PUT"
            }
        );



        const data = await response.json();






        // ================================
        // MOSTRAR CORREO DEL CLIENTE
        // ================================


        if(data.ok && data.correo && correoTexto){


            correoTexto.textContent =
                data.correo;


        }






        // Pequeña espera visual para mostrar correo

        await new Promise(resolve => 
            setTimeout(resolve,1500)
        );







        // ================================
        // OCULTAR NOTIFICACIÓN
        // ================================


        if(loader){

            loader.style.display = "none";

        }







        // ================================
        // VALIDAR RESPUESTA
        // ================================


        if(!data.ok){



            if(data.error === "STOCK_INSUFICIENTE"){



                alert(
                    "⚠️ Stock insuficiente\n\n" +
                    "Producto: " +
                    data.producto
                );



            }else{



                alert(
                    "❌ No se pudo aprobar el pedido"
                );


            }



            return;

        }








        // ================================
        // MENSAJE FINAL
        // ================================


        let mensajeCorreo = "";



        if(data.correo){


            mensajeCorreo =
                "\nCliente notificado: " + data.correo;


        }





        alert(
            "✅ Pedido aprobado correctamente"
            + mensajeCorreo
        );








        // ================================
        // CERRAR MODALES
        // ================================



        const modalAprobar =
            bootstrap.Modal.getInstance(
                document.getElementById("modalAprobar")
            );



        if(modalAprobar){

            modalAprobar.hide();

        }






        const modalPedido =
            bootstrap.Modal.getInstance(
                document.getElementById("pedidoModal")
            );



        if(modalPedido){

            modalPedido.hide();

        }








        // ================================
        // ACTUALIZAR DATOS
        // ================================


        cargarPedidos();

        cargarStats();







    }catch(error){





        const loader =
            document.getElementById(
                "notificandoCorreo"
            );



        if(loader){

            loader.style.display = "none";

        }






        console.error(
            "Error al aprobar pedido:",
            error
        );



        alert(
            "❌ Error al aprobar pedido"
        );



    }



});





















/* ================================
   ELIMINAR PEDIDO
================================ */


document.getElementById("btnEliminar")
.addEventListener("click", () => {


    if (!pedidoSeleccionado) return;


    const modal = new bootstrap.Modal(
        document.getElementById("modalEliminar")
    );


    modal.show();


});






document.getElementById("confirmarEliminar")
.addEventListener("click", async () => {


    try {



        // ================================
        // MOSTRAR NOTIFICACIÓN
        // ================================


        const loader =
            document.getElementById("notificandoCorreo");


        const correoTexto =
            document.getElementById("correoNotificando");



        if(loader){

            loader.style.display = "flex";

        }



        if(correoTexto){

            correoTexto.textContent =
                "Eliminando pedido...";

        }







        // ================================
        // ELIMINAR PEDIDO
        // ================================


        const res = await fetch(
            `/admin/pedidos/eliminar/${pedidoSeleccionado.id}`,
            {
                method:"DELETE"
            }
        );



        const data = await res.json();






        // Espera visual

        await new Promise(resolve =>
            setTimeout(resolve,1200)
        );







        // OCULTAR NOTIFICACIÓN


        if(loader){

            loader.style.display = "none";

        }








        // ================================
        // CERRAR MODALES
        // ================================



        const modalEliminar =
            bootstrap.Modal.getInstance(
                document.getElementById("modalEliminar")
            );


        if(modalEliminar){

            modalEliminar.hide();

        }






        const modalPedido =
            bootstrap.Modal.getInstance(
                document.getElementById("pedidoModal")
            );


        if(modalPedido){

            modalPedido.hide();

        }







        // ================================
        // RESULTADO
        // ================================


        if(data.ok){


            alert(
                "✅ Pedido eliminado correctamente"
            );


            cargarPedidos();

            cargarStats();



        }else{


            alert(
                "❌ No se pudo eliminar el pedido"
            );


        }







    }catch(error){



        const loader =
            document.getElementById("notificandoCorreo");



        if(loader){

            loader.style.display="none";

        }



        console.error(
            "Error al eliminar pedido:",
            error
        );


        alert(
            "❌ Error al eliminar pedido"
        );


    }


});

























//HISTORIALLLLLLLLLLLLLLLLLLLLL
let pedidoHistorialSeleccionado = null;

document.addEventListener("click", (e) => {

    const fila = e.target.closest(".fila-historial");
    if (!fila) return;

    const pedido = JSON.parse(fila.dataset.pedido);

    pedidoHistorialSeleccionado = pedido;

    // DATOS 
    document.getElementById("hId").innerText = pedido.id;
    document.getElementById("hCliente").innerText = pedido.nombreCliente;
    document.getElementById("hFecha").innerText = pedido.fechaPedido;
    document.getElementById("hTotal").innerText = pedido.total;

    const lista = document.getElementById("hItems");
    lista.innerHTML = "";

    if (pedido.items && pedido.items.length > 0) {
        pedido.items.forEach(i => {
            const li = document.createElement("li");
            li.innerText = `${i.producto.nombre ?? i.producto} →  cantidad (kilos): ${i.cantidad}`;
            lista.appendChild(li);
        });
    } else {
        lista.innerHTML = "<li>Sin productos</li>";
    }

    new bootstrap.Modal(document.getElementById("modalHistorial")).show();
});




















// CAMBIO DE SECCIONES 


const secciones = {
    pendientes: document.getElementById("seccionPendientes"),
    aprobados: document.getElementById("seccionAprobados"),
    historial: document.getElementById("seccionHistorial"),
    ventasManuales: document.getElementById("seccionVentasManuales") 
};

const botones = {
    pendientes: document.getElementById("btnPendientes"),
    aprobados: document.getElementById("btnAprobados"),
    historial: document.getElementById("btnHistorial"),
    ventasManuales: document.getElementById("btnVentasManuales") 
};

// LIMPIAR BOTONES

function limpiarBotones() {
    Object.values(botones).forEach(btn => {
        if (btn) btn.classList.remove("active-tab");
    });
}

// MOSTRAR SECCIÓN
function mostrarSeccion(nombre) {

    // ocultar todas las secciones
    Object.values(secciones).forEach(sec => {
        if (sec) sec.style.display = "none";
    });

    // mostrar la seleccionada
    if (secciones[nombre]) {
        secciones[nombre].style.display = "block";
    }

    // actualizar botones activos
    limpiarBotones();

    if (botones[nombre]) {
        botones[nombre].classList.add("active-tab");
    }
}

// EVENTOS BOTONES
botones.pendientes.onclick = () => mostrarSeccion("pendientes");
botones.aprobados.onclick = () => mostrarSeccion("aprobados");
botones.historial.onclick = () => mostrarSeccion("historial");

// BOTON VENTAS MANUALES
if (botones.ventasManuales) {
    botones.ventasManuales.onclick = () => {
        mostrarSeccion("ventasManuales");
        cargarVentasManuales();
    };
}

// INICIO 
mostrarSeccion("pendientes");





async function cargarAlerta() {

    try {
        const panel = document.getElementById("infoUltimoPedido");
        const cliente = document.getElementById("clienteAlerta");

        if (!panel || !cliente) return;

        const res = await fetch("/admin/pedidos/ultimo-pendiente");

        if (!res.ok) {
            panel.classList.add("d-none");
            return;
        }

        const text = await res.text();

        if (!text) {
            panel.classList.add("d-none");
            return;
        }

        const p = JSON.parse(text);

        if (!p || !p.id) {
            panel.classList.add("d-none");
            return;
        }

        panel.classList.remove("d-none");
        cliente.innerText = p.nombreCliente || "Sin nombre";

    } catch (error) {
        console.error("Error alerta:", error);
    }
}








document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("modalVenta");

    const dniInput = modal.querySelector("input[type='number']");
    const nombreInput = modal.querySelector("input[type='text']");
    const fechaInput = document.getElementById("fechaVentaManual");

    const tbody = document.getElementById("tablaProductosVenta");

    // FECHA AUTOMATICA (SOLO HOY)
    function configurarFecha() {
        const hoy = new Date().toISOString().split("T")[0];

        fechaInput.value = hoy;
        fechaInput.min = hoy;
        fechaInput.max = hoy;
    }

    // ABRIR MODAL
    modal.addEventListener("shown.bs.modal", async () => {
        configurarFecha();
        await cargarProductos();
    });

    // AGREGAR PRODUCTO
    document.getElementById("btnAgregarProducto").addEventListener("click", () => {

        const select = document.getElementById("productoVenta");
        const kilosInput = document.getElementById("kilosVenta");

        const option = select.options[select.selectedIndex];

        const id = select.value;
        const nombre = option?.text;
        const stock = Number(option?.dataset?.stock);
        const precio = Number(option?.dataset?.precio);
        const kilos = Number(kilosInput.value);

        if (!id) return alert("Selecciona un producto");
        if (!kilos || kilos <= 0) return alert("Kilos inválidos");

        let existente = [...tbody.querySelectorAll("tr")]
            .find(tr => tr.dataset.id === id);

        if (existente) {

            let input = existente.querySelector(".kilos");
            let nuevo = Number(input.value) + kilos;

            if (nuevo > stock) return alert("Stock insuficiente");

            input.value = nuevo;
            actualizarFila(existente, precio);

        } else {

            if (kilos > stock) return alert("Stock insuficiente");

            const tr = document.createElement("tr");

            tr.dataset.id = id;
            tr.dataset.stock = stock;
            tr.dataset.precio = precio;

            tr.innerHTML = `
                <td>#</td>
                <td>${nombre}</td>
                <td>${precio.toFixed(2)}</td>

                <td>
                    <input type="number" class="form-control kilos" value="${kilos}" min="1">
                </td>

                <td><span class="badge bg-secondary">${stock}</span></td>

                <td class="subtotal">0.00</td>

                <td>
                    <button class="btn btn-danger btn-sm btnEliminar">🗑</button>
                </td>
            `;

            tbody.appendChild(tr);
            actualizarFila(tr, precio);
        }

        kilosInput.value = "";
        actualizarTotal();
    });

    // CAMBIO DE KILOS
    document.addEventListener("input", (e) => {

        if (!e.target.classList.contains("kilos")) return;

        const tr = e.target.closest("tr");

        const stock = Number(tr.dataset.stock);
        let value = Number(e.target.value);

        if (value > stock) {
            alert("No puedes superar el stock");
            value = stock;
            e.target.value = stock;
        }

        if (value < 1 || isNaN(value)) {
            value = 1;
            e.target.value = 1;
        }

        actualizarFila(tr, Number(tr.dataset.precio));
    });

    // ELIMINAR PRODUCTO
    document.addEventListener("click", (e) => {

        if (e.target.closest(".btnEliminar")) {
            e.target.closest("tr").remove();
            actualizarTotal();
        }
    });

    // PRECIO AUTO
    document.getElementById("productoVenta").addEventListener("change", function () {

        const option = this.options[this.selectedIndex];

        document.getElementById("precioVenta").value =
            option?.dataset?.precio || "";
    });

    // REGISTRAR VENTA
    document.getElementById("btnRegistrarVenta").addEventListener("click", async () => {

        const dni = dniInput.value;
        const nombre = nombreInput.value;
        const fecha = fechaInput.value;

        const hoy = new Date().toISOString().split("T")[0];

        if (!dni || !nombre || !fecha) {
            return alert("Completa todos los datos");
        }

        // SOLO HOY
        if (fecha !== hoy) {
            return alert("La fecha debe ser HOY obligatoriamente");
        }

        let filas = document.querySelectorAll("#tablaProductosVenta tr");

        if (filas.length === 0) {
            return alert("Agrega productos");
        }

        let productos = [];

        filas.forEach(f => {

            productos.push({
                productoId: Number(f.dataset.id),
                kilos: Number(f.querySelector(".kilos").value),
                precio: Number(f.dataset.precio)
            });
        });

        if (!confirm("¿Confirmar venta manual?")) return;

        const res = await fetch("/admin/pedidos/venta-manual", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                dni,
                nombreCliente: nombre,
                productos
            })
        });

        const data = await res.json();

        if (!data.ok) {
            return alert(data.error || "Error en venta");
        }

        alert("Venta registrada correctamente");

        bootstrap.Modal.getInstance(modal)?.hide();

        tbody.innerHTML = "";
        document.getElementById("totalVenta").value = "S/ 0.00";

        cargarVentasManuales();
    });

    // ACTUALIZAR FILA
    function actualizarFila(tr, precio) {

        let kilos = Number(tr.querySelector(".kilos").value || 0);

        let subtotal = kilos * precio;

        tr.querySelector(".subtotal").innerText = subtotal.toFixed(2);

        actualizarTotal();
    }

    // TOTAL
    function actualizarTotal() {

        let total = 0;

        document.querySelectorAll("#tablaProductosVenta .subtotal")
            .forEach(s => total += Number(s.innerText || 0));

        document.getElementById("totalVenta").value =
            "S/ " + total.toFixed(2);
    }

    // CARGAR PRODUCTOS
    async function cargarProductos() {

        const res = await fetch("/api/productos/todos");
        const productos = await res.json();

        const select = document.getElementById("productoVenta");

        select.innerHTML = `<option value="">Seleccione...</option>`;

        productos.forEach(p => {

            select.innerHTML += `
                <option value="${p.id}"
                    data-precio="${p.precio}"
                    data-stock="${p.stock}">
                    ${p.nombre} - Stock: ${p.stock}
                </option>
            `;
        });
    }

    // CARGAR VENTAS MANUALES
    cargarVentasManuales();


});

async function cargarVentasManuales() {

    const tbodyVentas = document.getElementById("tablaVentasManuales");

    if (!tbodyVentas) return;

    try {
        const res = await fetch("/admin/pedidos/ventas-manuales");

        if (!res.ok) throw new Error("Error HTTP " + res.status);

        const data = await res.json();

        tbodyVentas.innerHTML = "";

        if (!data || data.length === 0) {
            tbodyVentas.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        No hay ventas registradas
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach(v => {

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${v.id}</td>
                <td>${v.dni}</td>
                <td>${v.nombreCliente}</td>
                <td>${v.fecha}</td>
                <td>S/ ${Number(v.total || 0).toFixed(2)}</td>
                <td><span class="badge bg-warning">MANUAL</span></td>
            `;

            tbodyVentas.appendChild(tr);
        });

    } catch (error) {
        console.error("Error cargando ventas manuales:", error);
    }
}


//ver mayor detalle de ventas manuales: 
 document.addEventListener("click", async (e) => {

    const tr = e.target.closest("#tablaVentasManuales tr");
    if (!tr) return;

    const id = tr.children[0].innerText; // ID venta

    try {
        const res = await fetch(`/admin/pedidos/venta-manual/${id}`);

        if (!res.ok) throw new Error("Error al cargar detalle");

        const venta = await res.json();

        // datos generales
        document.getElementById("detalleCliente").innerText = venta.nombreCliente;
        document.getElementById("detalleDni").innerText = venta.dni;
        document.getElementById("detalleFecha").innerText = venta.fecha;

        // productos
        const tbody = document.getElementById("detalleProductosVenta");
        tbody.innerHTML = "";

        venta.items.forEach(i => {

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${i.nombreProducto}</td>
                <td>${i.kilos}</td>
                <td>S/ ${Number(i.precio).toFixed(2)}</td>
                <td>S/ ${(i.kilos * i.precio).toFixed(2)}</td>
            `;

            tbody.appendChild(tr);
        });

        // abrir modal
        new bootstrap.Modal(document.getElementById("modalVentaDetalle")).show();

    } catch (err) {
        console.error(err);
        alert("No se pudo cargar el detalle");
    }
});