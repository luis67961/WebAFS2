function mostrarAlertaAdmin(mensaje, tipo = "danger") {

  const alerta = document.getElementById("alertaLoginAdmin");

  alerta.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show">
      ${mensaje}
      <button type="button"
              class="btn-close"
              data-bs-dismiss="alert"></button>
    </div>
  `;

  setTimeout(() => {
    alerta.innerHTML = "";
  }, 3000);
}


function enviarCodigo() {

  const email = document.getElementById("emailAdmin").value.trim();


  if (email === "") {

    mostrarAlertaAdmin("Ingresa el correo");

    return;

  }


  fetch("/auth/send-code", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({ email })

  })


  .then(res => res.json())


  .then(data => {


    if (data.ok) {


      mostrarAlertaAdmin(
        "Código enviado al correo",
        "success"
      );


      document.getElementById("btnEnviarCodigo").style.display = "none";

      document.getElementById("btnIngresar").style.display = "block";


    } else {


      mostrarAlertaAdmin(
        "correo SIN ACCESO"
      );


    }


  })


  .catch(() => {

    mostrarAlertaAdmin(
      "Credenciales incorrectas"
    );

  });


}


function validarAdmin() {

  const email = document.getElementById("emailAdmin").value;
  const password = document.getElementById("passwordAdmin").value;
  const codigo = document.getElementById("codigoAdmin").value;

  if (email === "" || password === "" || codigo === "") {
    mostrarAlertaAdmin("Completa todos los campos");
    return;
  }

  fetch("/auth/verify-admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password,
      code: codigo
    })
  })
  .then(res => res.json())
  .then(data => {

    if (data.ok) {

      mostrarAlertaAdmin("Acceso concedido", "success");

      setTimeout(() => {
        window.location.href = "/admin";
      }, 1000);

    } else {
      mostrarAlertaAdmin("Credenciales incorrectas");
    }

  })
  .catch(() => {
    mostrarAlertaAdmin("Error de conexión");
  });
}


function volverIndex() {
  window.location.href = "/";
}