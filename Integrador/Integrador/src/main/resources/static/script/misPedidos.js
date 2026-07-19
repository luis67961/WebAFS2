  
document.querySelectorAll(".order-card").forEach(card => {
  card.addEventListener("click", () => {

    const id = card.getAttribute("data-id");
    const estado = card.getAttribute("data-estado");

    document.getElementById("orderTitle").innerText =
      "Pedido #" + id;

    document.getElementById("orderStatus").innerHTML =
      "Estado: <b>" + estado + "</b>";

  });
});




