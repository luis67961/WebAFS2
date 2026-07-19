


const urlAdmin = "http://localhost:8080/administradores";

let idAdministradorActualizar = null;


// GUARDAR ADMINISTRADOR


function guardarAdministrador(){

    const admin = {

        nombre: document.getElementById("nombreAdmin").value,

        correo: document.getElementById("correoAdmin").value,

        password: document.getElementById("passwordAdmin").value

    };


    fetch(urlAdmin,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify(admin)

    })

    .then(res=>res.text())

    .then(data=>{

        alert(data);

        document.getElementById("formAgregarAdmin").reset();

        location.reload();

    })

    .catch(error=>console.log(error));

}





// BUSCAR ADMINISTRADOR POR CORREO


function buscarAdministrador(){

    const correo = document.getElementById("buscarCorreoActualizar").value;


    fetch(`${urlAdmin}/buscar?texto=${correo}`)

    .then(res=>res.json())

    .then(data=>{


        if(data.length === 0){

            alert("Administrador no encontrado");

            return;

        }


        const admin = data[0];


        idAdministradorActualizar = admin.id;


        document.getElementById("actualizarNombre").value = admin.nombre;

        document.getElementById("actualizarCorreo").value = admin.correo;

        document.getElementById("actualizarPassword").value = admin.password;



    })

    .catch(error=>console.log(error));

}





// ACTUALIZAR ADMINISTRADOR


function actualizarAdministrador(){


    if(idAdministradorActualizar == null){

        alert("Primero busque un administrador");

        return;

    }



    const admin = {


        nombre:
        document.getElementById("actualizarNombre").value,


        correo:
        document.getElementById("actualizarCorreo").value,


        password:
        document.getElementById("actualizarPassword").value


    };



    fetch(`${urlAdmin}/${idAdministradorActualizar}`,{


        method:"PUT",


        headers:{

            "Content-Type":"application/json"

        },


        body:JSON.stringify(admin)


    })

    .then(res=>res.text())


    .then(data=>{


        alert(data);

        location.reload();


    })


    .catch(error=>console.log(error));


}




let idAdminEliminar = null;


// ENVIAR OTP


function enviarOTPEliminar(){


    const correo = document.getElementById("correoEliminar").value;



    fetch(`${urlAdmin}/enviar-otp`,{


        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },


        body:JSON.stringify({
            correo:correo
        })


    })


    .then(res=>res.text())


    .then(data=>{


        alert(data);


        document.getElementById("campoOTP").style.display="block";


    })


    .catch(error=>console.log(error));


}






// ELIMINAR ADMINISTRADOR



function eliminarAdministrador(){


    const correo =
    document.getElementById("correoEliminar").value;


    const otp =
    document.getElementById("codigoOTP").value;



    fetch(`${urlAdmin}/eliminar-confirmado`,{


        method:"POST",

        headers:{

            "Content-Type":"application/json"

        },


        body:JSON.stringify({

            correo:correo,

            otp:otp

        })


    })



    .then(res=>res.text())


    .then(data=>{


        alert(data);


        location.reload();


    })



    .catch(error=>console.log(error));

}

















document.addEventListener("DOMContentLoaded", () => {

    cargarHistorial();

});


function cargarHistorial() {

    fetch("/administradores/historial")

        .then(response => response.json())

        .then(data => {


            const contenedor = document.getElementById("listaHistorial");


            contenedor.innerHTML = "";


            data.forEach(act => {


                let estilo = obtenerEstilo(act.tipo);



                const html = `

                <div class="notificacion rounded-4 bg-transparent p-3 border ${estilo.border} border-opacity-50 mb-3">


                    <div class="d-flex align-items-center">


                        <div class="rounded-circle ${estilo.bg} bg-opacity-10 p-3 me-3">

                            <i class="bi ${estilo.icono} ${estilo.texto} fs-5"></i>

                        </div>


                        <div>


                            <h6 class="mb-1 fw-semibold text-white">

                                ${act.descripcion}

                            </h6>


                            <small class="text-white-50">

                                ${formatearFecha(act.fecha)}

                            </small>


                        </div>


                    </div>


                </div>

                `;


                contenedor.innerHTML += html;


            });


        })

        .catch(error => {

            console.error("Error cargando historial:", error);

        });

}




function obtenerEstilo(tipo) {


    switch(tipo) {


        case "CREAR":

            return {

                border: "border-primary",
                bg: "bg-primary",
                texto: "text-primary",
                icono: "bi-person-plus"

            };


        case "ACTUALIZAR":

            return {

                border: "border-warning",
                bg: "bg-warning",
                texto: "text-warning",
                icono: "bi-pencil-square"

            };


        case "ELIMINAR":

            return {

                border: "border-danger",
                bg: "bg-danger",
                texto: "text-danger",
                icono: "bi-trash"

            };


        case "LOGIN":

            return {

                border: "border-success",
                bg: "bg-success",
                texto: "text-success",
                icono: "bi-box-arrow-in-right"

            };


        default:

            return {

                border: "border-secondary",
                bg: "bg-secondary",
                texto: "text-secondary",
                icono: "bi-clock-history"

            };

    }

}




function formatearFecha(fecha) {


    const fechaActividad = new Date(fecha);


    const ahora = new Date();


    const diferencia = Math.floor(
        (ahora - fechaActividad) / 60000
    );


    if (diferencia < 1) {

        return "Hace unos segundos";

    }


    if (diferencia < 60) {

        return `Hace ${diferencia} minutos`;

    }


    const horas = Math.floor(diferencia / 60);


    if (horas < 24) {

        return `Hace ${horas} horas`;

    }


    return fechaActividad.toLocaleDateString();

}