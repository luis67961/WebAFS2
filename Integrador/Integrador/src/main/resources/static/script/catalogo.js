const card = document.querySelector(".card");

card.classList.add('rotate');












function toggleContenedor() {
  const contenedor = document.getElementById("contenedorDinamico");

  contenedor.classList.toggle("mostrar");
  contenedor.classList.toggle("oculto");
}
