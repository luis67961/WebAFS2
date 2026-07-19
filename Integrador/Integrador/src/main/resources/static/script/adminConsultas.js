





document.addEventListener("DOMContentLoaded", () => {

    cargarConsultas();

});




// ===============================
// CARGAR CONSULTAS PENDIENTES
// ===============================

function cargarConsultas(){


    fetch("/admin/consultas")
    .then(res => res.json())
    .then(data => {


        let contenedor = document.getElementById("contenedorConsultas");


        contenedor.innerHTML = "";



        let pendientes = data.filter(
            c => c.estado === "PENDIENTE"
        );



        if(pendientes.length === 0){


            contenedor.innerHTML = `

            <div class="alert alert-success">

                No existen consultas pendientes

            </div>

            `;


            return;

        }





  pendientes.forEach(c => {


    contenedor.innerHTML += `


    <div class="col-md-4">


        <div class="card h-100 rounded-4 
                    border border-success border-opacity-25
                    bg-dark bg-opacity-75 shadow-lg">


            <div class="card-body p-4">



                <!-- HEADER -->

                <div class="d-flex align-items-center mb-4">


                    <div class="rounded-circle 
                                bg-success bg-opacity-25
                                p-3 me-3">


                        <i class="bi bi-person-fill text-success fs-3"></i>


                    </div>



                    <div>


                        <h5 class="mb-0 fw-bold text-white">

                            ${c.nombre}

                        </h5>


                        <small class="text-white-50">

                            Usuario

                        </small>


                    </div>



                </div>





                <!-- DATOS -->


                <div class="border-top border-success border-opacity-25 pt-3">



                    <p class="text-white mb-2">

                        <i class="bi bi-envelope-fill text-success me-2"></i>

                        <b>Correo:</b>

                        <span class="text-white-50">
                            ${c.correo}
                        </span>

                    </p>





                    <p class="text-white mb-2">

                        <i class="bi bi-telephone-fill text-success me-2"></i>

                        <b>Teléfono:</b>

                        <span class="text-white-50">
                            ${c.telefono ?? "No registrado"}
                        </span>

                    </p>





                    <p class="text-white mb-2">

                        <i class="bi bi-chat-left-text-fill text-success me-2"></i>

                        <b>Mensaje:</b>

                    </p>


                    <div class="rounded-3 
                                bg-black bg-opacity-25
                                p-3 mb-3">


                        <span class="text-white-50">

                            ${c.mensaje}

                        </span>


                    </div>





                    <p class="text-white mb-2">

                        <i class="bi bi-circle-fill text-warning me-2"></i>

                        <b>Estado:</b>

                        <span class="badge bg-warning text-dark">

                            ${c.estado}

                        </span>


                    </p>





                    <p class="text-white mb-2">


                        <i class="bi bi-calendar-event text-success me-2"></i>

                        <b>Creado:</b>


                       <span class="text-white-50">

    ${formatoFecha(c.fechaCreacion)}

</span>


                    </p>





                    <p class="text-white mb-2">


                        <i class="bi bi-reply-fill text-success me-2"></i>

                        <b>Respuesta:</b>


                        <span class="text-white-50">

                            ${c.respuesta ?? "Pendiente de respuesta"}

                        </span>


                    </p>





                    <p class="text-white mb-0">


                        <i class="bi bi-clock-history text-success me-2"></i>

                        <b>Fecha respuesta:</b>


                        <span class="text-white-50">

                            ${c.fechaRespuesta ?? "Aún no respondida"}

                        </span>


                    </p>



                </div>





                <!-- BOTON -->


                <button class="btn btn-outline-success 
                               rounded-pill 
                               w-100 mt-4"


                        onclick="abrirConsulta(${c.id})">


                    <i class="bi bi-envelope-paper-fill me-2"></i>


                    Responder consulta


                </button>




                <button class="btn btn-outline-danger 
               rounded-pill 
               w-100 mt-2"


        onclick="eliminarConsulta(${c.id})">


    <i class="bi bi-trash3-fill me-2"></i>


    Cancelar consulta


</button>



            </div>



        </div>



    </div>


    `;


});

    });


}






// ===============================
// ABRIR MODAL
// ===============================


function abrirConsulta(id){


    fetch(`/admin/consulta/${id}`)
    .then(res => res.json())
    .then(c => {



        document.getElementById("consultaId").value = c.id;


        document.getElementById("consultaNombre").value = c.nombre;


        document.getElementById("consultaCorreo").value = c.correo;


        document.getElementById("consultaTelefono").value =
            c.telefono ?? "";



      document.getElementById("consultaFecha").value =
    formatoFecha(c.fechaCreacion);


        document.getElementById("consultaMensaje").value =
            c.mensaje;



        document.getElementById("respuesta").value = "";




        let modal = new bootstrap.Modal(
            document.getElementById("modalConsulta")
        );


        modal.show();



    });


}







// ===============================
// RESPONDER CONSULTA
// ===============================


function responderConsulta(){



    let id =
    document.getElementById("consultaId").value;



    let respuesta =
    document.getElementById("respuesta").value;



    if(respuesta.trim()===""){


        alert("Escribe una respuesta");

        return;

    }





    fetch(`/admin/consulta/${id}/responder`,
    {


        method:"PUT",


        headers:{


            "Content-Type":"application/json"

        },


        body:JSON.stringify({

            respuesta:respuesta

        })


    })
    .then(res=>res.json())
    .then(data=>{


        alert("Respuesta enviada correctamente");


        let modal =
        bootstrap.Modal.getInstance(
            document.getElementById("modalConsulta")
        );


        modal.hide();



        cargarConsultas();



    })

    .catch(error=>{


        console.error(error);


        alert("Error enviando respuesta");


    });



}










function responderConsulta(){


    let id =
    document.getElementById("consultaId").value;



    let respuesta =
    document.getElementById("respuesta").value;



    if(respuesta.trim()===""){

        alert("Escribe una respuesta");

        return;

    }



    // MOSTRAR CARGA

    let modalCarga = new bootstrap.Modal(
        document.getElementById("modalEnviando")
    );


    modalCarga.show();





    fetch(`/admin/consulta/${id}/responder`,
    {


        method:"PUT",

        headers:{

            "Content-Type":"application/json"

        },


        body:JSON.stringify({

            respuesta:respuesta

        })


    })

    .then(res=>res.json())


    .then(data=>{



        // OCULTAR CARGA

        modalCarga.hide();



        alert("Respuesta enviada correctamente");



        let modal =
        bootstrap.Modal.getInstance(
            document.getElementById("modalConsulta")
        );


        modal.hide();



        cargarConsultas();



    })


    .catch(error=>{


        modalCarga.hide();


        console.error(error);


        alert("Error enviando respuesta");


    });



}




function eliminarConsulta(id){


    if(!confirm("¿Deseas eliminar esta consulta?")){

        return;

    }



    fetch(`/admin/consulta/${id}`,
    {

        method:"DELETE"

    })

    .then(res=>res.json())

    .then(data=>{


        if(data){


            cargarConsultas();


        }else{


            alert("No se pudo eliminar la consulta");


        }


    })

    .catch(error=>{


        console.error(error);


        alert("Error eliminando consulta");


    });


}







function cargarHistorial(){


fetch("/admin/consultas")

.then(res=>res.json())

.then(data=>{


let tabla=document.getElementById("tablaHistorial");


tabla.innerHTML="";



let respondidas=data.filter(
c=>c.estado==="RESPONDIDO"
);



respondidas.forEach(c=>{


tabla.innerHTML+=`


<tr onclick="verHistorial(${c.id})"
style="cursor:pointer;">



<td class="text-white fw-bold">

${c.nombre}

</td>



<td class="text-white-50">

${c.correo}

</td>


<td class="text-white-50">
    ${formatoFecha(c.fechaCreacion)}
</td>



<td>

<span class="badge bg-success">

${c.estado}

</span>

</td>



</tr>


`;


});


});


}







function verHistorial(id){


fetch(`/admin/consulta/${id}`)

.then(res=>res.json())

.then(c=>{


document.getElementById("hNombre").textContent=c.nombre;

document.getElementById("hCorreo").textContent=c.correo;

document.getElementById("hTelefono").textContent=
c.telefono ?? "No registrado";


document.getElementById("hFecha").textContent =
    formatoFecha(c.fechaCreacion);


document.getElementById("hEstado").textContent=
c.estado;


document.getElementById("hMensaje").textContent=
c.mensaje;


document.getElementById("hRespuesta").textContent =
c.respuesta ?? "Sin respuesta";


document.getElementById("hFechaRespuesta").textContent =
formatoFecha(c.fechaRespuesta);



let modal=new bootstrap.Modal(
document.getElementById("modalHistorial")
);


modal.show();


});


}


document.addEventListener("DOMContentLoaded",()=>{

    cargarHistorial();

});






function formatoFecha(fecha){


    if(!fecha){

        return "Sin fecha";

    }


    const f = new Date(fecha);


    return f.toLocaleDateString("es-PE", {

        day: "2-digit",

        month: "long",

        year: "numeric",

        hour: "2-digit",

        minute: "2-digit",

        hour12: true

    });


}













function mostrarSolicitudes(){


    document.getElementById("seccionSolicitudes")
    .style.display="block";


    document.getElementById("seccionHistorial")
    .style.display="none";


}



function mostrarHistorial(){


    document.getElementById("seccionSolicitudes")
    .style.display="none";


    document.getElementById("seccionHistorial")
    .style.display="block";


    cargarHistorial();


}

// AL CARGAR PAGINA

document.addEventListener("DOMContentLoaded",()=>{


    cargarConsultas();


});



// AL CARGAR PAGINA

document.addEventListener("DOMContentLoaded",()=>{


    mostrarSolicitudes();


});