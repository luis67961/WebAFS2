document.addEventListener("DOMContentLoaded", function () {

    let rutaActual = window.location.pathname;

    console.log("Ruta actual:", rutaActual);


    document.querySelectorAll("#sidebar a").forEach(link => {

        let rutaLink = new URL(link.href).pathname;

        console.log("Comparando:", rutaActual, "con", rutaLink);


        if (rutaActual === rutaLink) {
            link.classList.add("active");
            console.log("ACTIVO:", rutaLink);
        } else {
            link.classList.remove("active");
        }

    });

});
document.addEventListener("DOMContentLoaded", () => {

    cargarAdministradores();

});



function cargarAdministradores() {


    fetch("/administradores/conectados")

        .then(response => response.json())

        .then(admins => {


            const contenedor = document.getElementById(
                "listaAdministradores"
            );


            contenedor.innerHTML = "";


            admins.forEach(admin => {


                const iniciales = admin.nombre.replaceAll(" ", "+");


                const conectado = admin.estado === "ONLINE";


                const colorBorde = conectado
                    ? "success"
                    : "secondary";


                const colorBadge = conectado
                    ? "success"
                    : "secondary";


                const estadoTexto = conectado
                    ? "En línea"
                    : "Desconectado";



                const avatarColor = conectado
                    ? "198754"
                    : "6c757d";



                const html = `


                <div class="usuario-online rounded-4 bg-transparent p-3 border border-${colorBorde} border-opacity-50 mb-3">


                    <div class="d-flex align-items-center">


                        <img src="https://ui-avatars.com/api/?name=${iniciales}&background=${avatarColor}&color=fff"
                            class="rounded-circle me-3"
                            width="55">



                        <div class="flex-grow-1">


                            <h6 class="mb-1 fw-semibold text-white">

                                ${admin.nombre}

                            </h6>



                            <small class="text-white-50">

                                ${admin.correo}

                            </small>


                        </div>



                        <span class="badge bg-${colorBadge} bg-opacity-75 rounded-pill px-3">

                            ${estadoTexto}

                        </span>



                    </div>


                </div>


                `;


                contenedor.innerHTML += html;



            });


        })

        .catch(error => {


            console.error(
                "Error cargando administradores:",
                error
            );


        });


}



document.addEventListener("DOMContentLoaded", () => {

    cargarAdministradores();

});


//cerrar sesion
function cerrarSesion(){


    fetch("/auth/logout",{

        method:"POST"

    })


    .then(res=>res.json())


    .then(data=>{


        if(data.ok){


            window.location.href="/login";


        }


    })


    .catch(()=>{


        alert("Error cerrando sesión");


    });


}


