document.getElementById("visitaTecnicaForm")
.addEventListener("submit", async function (e) {

    e.preventDefault();

    const dni = document.getElementById("dniUsuario").value.trim();
    const telefono = document.getElementById("telefonoVisita").value.trim();
    const nombre = document.getElementById("nombreUsuarioVisita").value.trim();
    const acepto = document.getElementById("aceptoTerminos").checked;

    //  TERMINOS
    if (!acepto) {
        alert("Debes aceptar los términos y condiciones");
        return;
    }

    //  DNI
    if (!/^\d{8}$/.test(dni)) {
        alert("DNI inválido");
        return;
    }

    // NOMBRE
    if (nombre.length < 3 || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(nombre)) {
        alert("Nombre inválido");
        return;
    }

    // TELEFONO
    if (!/^9\d{8}$/.test(telefono)) {
        alert("Teléfono inválido");
        return;
    }

    const btn = document.getElementById("btnEnviarVisita");
    btn.disabled = true;
    btn.innerText = "Enviando...";

    try {

        const res = await fetch("/api/visitas", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                usuario: nombre,
                usuarioTelefono: telefono,
                dni: dni
            })
        });

        btn.disabled = false;
        btn.innerText = "Solicitar";

        if (!res.ok) {
            const msg = await res.text();
            alert(msg);
            return;
        }

        alert("Solicitud enviada correctamente");

        bootstrap.Modal.getInstance(
            document.getElementById("visitaTecnicaModal")
        ).hide();

        document.getElementById("visitaTecnicaForm").reset();
        document.getElementById("btnEnviarVisita").disabled = true;

    } catch (err) {
        btn.disabled = false;
        btn.innerText = "Solicitar";
        alert("Error: " + err.message);
    }
});


document.getElementById("aceptoTerminos").addEventListener("change", function () {
    document.getElementById("btnEnviarVisita").disabled = !this.checked;
});
