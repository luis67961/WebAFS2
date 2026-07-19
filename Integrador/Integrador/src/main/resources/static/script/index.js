
const botones = document.querySelectorAll(".boton-pestana");
const contenedor = document.getElementById("rejillaProductos");
const detalle = document.getElementById("detalleCategoria");

let categoriaActual = "avicola";

//  cargar productos desde Spring
async function cargarProductos(categoria) {

  const res = await fetch(`/api/productos/categoria/${categoria}`);
  const data = await res.json();

  contenedor.innerHTML = "";

  if (data.length > 0) {
    detalle.textContent = `Mostrando ${categoria}`;

  } else {
    detalle.textContent = "No hay productos en esta categoría";
  }

data.forEach(p => {
contenedor.innerHTML += `
<div class="parent">
  <div class="card">

    <div class="logo">
      <span class="circle circle1"></span>
      <span class="circle circle2"></span>
      <span class="circle circle3"></span>
      <span class="circle circle4"></span>
      <span class="circle circle5"></span>
    </div>

    <div class="glass"></div>

    <div class="content">
      <img src="${p.imagen}" alt="${p.nombre}" class="img-producto">

      <span class="title">${p.nombre}</span>
      <span class="text">${p.descripcion}</span>

      <div class="etiquetas">
        <span>${p.peso || '40 kg'}</span>
        <span>Prot. ${p.proteina || '22%'}</span>
      </div>
    </div>

    <div class="bottom">

     <div class="precios">
    <span class="precio">S/ ${p.precio} /kg</span>
  </div>

    <div class="view-more">
  <a href="/tienda" class="view-more-button">Ver</a>
</div>

    </div>

  </div>
</div>
`;
})};


botones.forEach(btn => {
  btn.addEventListener("click", () => {

    botones.forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");

    categoriaActual = btn.dataset.categoria;

    cargarProductos(categoriaActual);
  });
});

// carga inicial
cargarProductos(categoriaActual);











//  CHAT FLOTANTE 
const contenedorChat = document.querySelector(".contenedor-chat-flotante");
const btnToggleChat = document.getElementById("btnToggleChat");
const chipsSugerencias = document.querySelectorAll(".chip-sugerencia");
const inputMensajeChat = document.getElementById("inputMensajeChat");
const btnEnviarChat = document.querySelector(".boton-enviar-chat");


btnToggleChat.addEventListener("click", (e) => {
  e.stopPropagation(); 
  contenedorChat.classList.toggle("abierto");
});

// Cerrara clic fuera 
document.addEventListener("click", (e) => {
  if (!contenedorChat.contains(e.target)) {
    contenedorChat.classList.remove("abierto");
  }
});


chipsSugerencias.forEach(chip => {
  chip.addEventListener("click", () => {
    const textoPregunta = chip.textContent;
    inputMensajeChat.value = textoPregunta;
    inputMensajeChat.focus();
    
   
  });
});










/*faq acordeonn*/

document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".item-acordeon");

  items.forEach((item) => {
    const header = item.querySelector(".header-acordeon");

    header.addEventListener("click", () => {

      // cerrar los demas
      items.forEach((el) => {
        if (el !== item) el.classList.remove("activo");
      });

      // abrir/cerrar actual
      item.classList.toggle("activo");
    });
  });
});



//FORMUALRIO

document
.getElementById("formContacto")
.addEventListener("submit", function(e){


    e.preventDefault();


    limpiarErrores();



    let valido = true;


    let nombre = document.getElementById("nombre").value.trim();

    let correo = document.getElementById("correo").value.trim();

    let telefono = document.getElementById("telefono").value.trim();

    let mensaje = document.getElementById("mensaje").value.trim();



    // NOMBRE

    if(nombre === ""){

        mostrarError(
            "errorNombre",
            "El nombre es obligatorio"
        );

        valido=false;

    }



    if(nombre.length < 3 && nombre !== ""){

        mostrarError(
            "errorNombre",
            "El nombre debe tener mínimo 3 caracteres"
        );

        valido=false;

    }





    // CORREO

    let regexCorreo =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



    if(correo === ""){


        mostrarError(
            "errorCorreo",
            "El correo es obligatorio"
        );


        valido=false;


    }
    else if(!regexCorreo.test(correo)){


        mostrarError(
            "errorCorreo",
            "Ingrese un correo válido"
        );


        valido=false;

    }






    // TELEFONO

    if(telefono !== "" && telefono.length < 9){


        mostrarError(
            "errorTelefono",
            "El teléfono debe tener 9 números"
        );


        valido=false;


    }







    // MENSAJE

    if(mensaje === ""){


        mostrarError(
            "errorMensaje",
            "El mensaje es obligatorio"
        );


        valido=false;


    }


    if(mensaje.length < 10 && mensaje !== ""){


        mostrarError(
            "errorMensaje",
            "El mensaje debe tener mínimo 10 caracteres"
        );


        valido=false;


    }





    if(valido){


        enviarFormulario();

    }



});






function mostrarError(id,mensaje){


    document.getElementById(id).textContent = mensaje;


}






function limpiarErrores(){


    document
    .querySelectorAll(".text-danger")
    .forEach(e=>{


        e.textContent="";


    });


}







async function enviarFormulario(){


    let formulario =
    document.getElementById("formContacto");



    let datos =
    new FormData(formulario);



    let boton =
    document.getElementById("btnEnviar");



    let texto =
    document.getElementById("textoBtn");



    let loader =
    document.getElementById("loader");




    boton.disabled=true;

    texto.textContent="Enviando...";

    loader.style.display="inline-block";





    try{


        let respuesta = await fetch("/contacto",{

            method:"POST",

            body:datos

        });




      if(respuesta.ok){


    let resultado = await respuesta.json();



    if(resultado){


        alert("Consulta enviada correctamente");


        formulario.reset();


    }


}



    }
    catch(error){


        alert("Error al enviar consulta");


    }
    finally{


        boton.disabled=false;

        texto.textContent="Enviar mensaje";

        loader.style.display="none";


    }



}
















// VER USUARIUO VIISTANDO PAGINA XD

const userId = localStorage.getItem("userId");

fetch("/analytics/registrar", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        pagina: window.location.pathname,
        sesionId: localStorage.getItem("sessionId") || "anon",
        usuarioId: (userId && userId !== "null" && userId !== "undefined")
            ? userId
            : null
    })
});









