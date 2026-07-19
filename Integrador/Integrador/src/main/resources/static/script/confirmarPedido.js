document.getElementById("btnFinalizar").addEventListener("click", async () => {

    const documento = document.getElementById("documentoInput").value;
    const telefono = document.getElementById("telefonoInput").value;

    const tipoDoc = document.querySelector('input[name="tipoDoc"]:checked').value;

    if (!documento) {
        alert("Ingrese DNI o RUC");
        return;
    }

    if (!telefono) {
        alert("Ingrese teléfono");
        return;
    }

    try {

        const response = await fetch(`/pedidos/finalizar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tipoDocumento: tipoDoc,
                documento: documento,
                telefono: telefono
            })
        });

        const pedido = await response.json();

        if (!pedido.ok) {
            alert(pedido.error);
            return;
        }

        // UI update
        document.querySelector(".checkout-summary h5").innerText =
            "Pedido #" + pedido.id;

        document.querySelector(".checkout-summary b").innerText =
            "S/ " + pedido.total;

        document.querySelector(".checkout-success").classList.remove("d-none");

        // limpiar carrito local
        localStorage.removeItem("carrito");

        setTimeout(() => {
            window.location.reload();
        }, 2000);

    } catch (error) {
        console.error(error);
        alert("Error al generar pedido");
    }

});