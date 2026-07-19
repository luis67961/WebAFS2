document.addEventListener("DOMContentLoaded", () => {

  const botones = document.querySelectorAll(".boton-pestana");
  const contenedor = document.getElementById("rejillaProductos");
  const detalle = document.getElementById("detalleCategoria");

  let categoriaActual = "avicola";

  async function cargarProductos(categoria) {
    try {
      const res = await fetch(`/api/productos/categoria/${categoria}`);

      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

      const data = await res.json();

      contenedor.innerHTML = "";

      if (detalle) {
        detalle.textContent =
          data.length > 0
            ? `Mostrando ${categoria}`
            : "No hay productos en esta categoría";
      }

      data.forEach(p => {
        contenedor.innerHTML += `
          <div class="parent">
<div class="card" data-id="${p.id}">

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

                  <div class="contt">
                <span class="title">${p.nombre}</span>
                <span class="text">${p.descripcion}</span>
                </div>
                <div class="etiquetas">
                  <span>${p.peso || "40 kg"}</span>
                  <span>Prot. ${p.proteina || "22%"}</span>
                </div>
              </div>

              <div class="footer-card">
                <div class="precios">
                  <span class="precio">S/ ${p.precio} /kg</span>
                </div>

                <div class="view-more">
                  <button class="view-more-button">
                    Comprar
                  </button>
                </div>
              </div>

            </div>
          </div>
        `;
      });

    } catch (error) {
      console.error("Error al cargar productos:", error);

      contenedor.innerHTML = `
        <div class="alert alert-danger">
          Error al cargar los productos.
        </div>
      `;
    }
  }

  botones.forEach(btn => {
    btn.addEventListener("click", () => {

      botones.forEach(b => b.classList.remove("activo"));
      btn.classList.add("activo");

      categoriaActual = btn.dataset.categoria;

      cargarProductos(categoriaActual);
    });
  });

  cargarProductos(categoriaActual);

});
















 
    const texts = [
      "Compra inteligente",
      "Compra al mejor precio",
      "Envío GRATIS en Trujillo",
      "Calidad que te mereces"
    ];

    let index = 0;
    let charIndex = 0;
    let isDeleting = false;

    const speed = 90;      // velocidad escritura
    const eraseSpeed = 50; // velocidad borrado
    const delay = 2900;    // pausa

    function typeEffect() {
      const element = document.getElementById("typing-text");

      let currentText = texts[index];

      if (!isDeleting) {
        element.textContent = currentText.substring(0, charIndex++);
      } else {
        element.textContent = currentText.substring(0, charIndex--);
      }

      let timeout = isDeleting ? eraseSpeed : speed;

      if (!isDeleting && charIndex === currentText.length + 1) {
        isDeleting = true;
        timeout = delay;
      }

      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        index = (index + 1) % texts.length;
      }

      setTimeout(typeEffect, timeout);
    }

    typeEffect();





function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2500);
}


//AGREGAR PRODCUTOS AL CARRITO
document.addEventListener("click", async (e) => {

  if (e.target.classList.contains("view-more-button")) {

    const card = e.target.closest(".card");
    const productoId = card.dataset.id;

    try {

      const res = await fetch("/api/carrito/agregar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ productoId: parseInt(productoId) })
      });

      const data = await res.json();

      // NO LOGIN
      if (!data.ok) {
        if (data.error === "NO_LOGIN") {
          showToast("Debes iniciar sesión", "error");

          setTimeout(() => {
            window.location.href = "/miCuenta";
          }, 1200);

          return;
        }

        showToast(data.error || "Error al agregar", "error");
        return;
      }

      showToast("Producto agregado al carrito 🛒", "success");
      cargarCarrito();

    } catch (err) {
      console.error(err);
      showToast("Error de red", "error");
    }
  }
});




//BOTONES AUMENTAR O DISMINUIR
document.addEventListener("click", async (e) => {

  if (e.target.classList.contains("btn-plus") ||
      e.target.classList.contains("btn-minus")) {

    const id = e.target.dataset.id;
    const isPlus = e.target.classList.contains("btn-plus");

    const qtyEl = e.target.parentElement.querySelector(".qty");

    let qty = parseInt(qtyEl.textContent);

    qty = isPlus ? qty + 1 : Math.max(0, qty - 1);

    await fetch("/api/carrito/actualizar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        productoId: parseInt(id),
        cantidad: qty
      })
    });

    cargarCarrito();
  }
});


//EVENTO PARA ELMIMINAR PRODCUTO DEL CARRITO
document.addEventListener("click", async (e) => {

  const btn = e.target.closest(".btn-delete");
  if (!btn) return;

  const id = btn.dataset.id;

  try {

    const res = await fetch("/api/carrito/eliminar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        productoId: Number(id)
      })
    });

    const data = await res.json();

    if (!data.ok) {
      console.error(data.error);
      return;
    }

    cargarCarrito();

  } catch (err) {
    console.error(err);
  }
});



  // cargar carrito en offcanvas
async function cargarCarrito() {

  const res = await fetch("/api/carrito");
  const data = await res.json();

  const contenedor = document.querySelector(".offcanvas-body");
  const totalBox = document.getElementById("cart-total");

  contenedor.innerHTML = "";

  if (!data || !data.items || data.items.length === 0) {
    contenedor.innerHTML = `
      <div class="cart-empty text-center text-muted p-3">
        Tu carrito está vacío
      </div>
    `;
    totalBox.innerText = "S/ 0.00";
    return;
  }

  let total = 0;

  data.items.forEach(item => {

    const subtotal = item.cantidad * item.producto.precio;
    total += subtotal;

    contenedor.innerHTML += `
      <div class="cart-item">

        <div class="cart-info">
          <h6>${item.producto.nombre}</h6>
          <span>S/ ${item.producto.precio.toFixed(2)} c/u</span>
        </div>

        <div class="cart-controls">
          <button class="btn-minus" data-id="${item.producto.id}">-</button>

          <span class="qty">${item.cantidad}</span>

          <button class="btn-plus" data-id="${item.producto.id}">+</button>
        </div>

        <button class="btn-delete" data-id="${item.producto.id}">
  Eliminar
</button>



        <div class="cart-subtotal">
          S/ ${subtotal.toFixed(2)}
        </div>

      </div>
    `;
  });

  totalBox.innerText = `S/ ${total.toFixed(2)}`;
}
//cartgar productos al off canvas
document.addEventListener("DOMContentLoaded", () => {
  cargarCarrito(); //  IMPORTANTE
});












function irATienda(tipo) {
  localStorage.setItem("openOffcanvas", tipo);
  window.location.href = "/tienda";
}



document.addEventListener("DOMContentLoaded", () => {

  const open = localStorage.getItem("openOffcanvas");

  if (open === "cart") {
    const cartEl = document.getElementById("cartOffcanvas");
    const offcanvas = new bootstrap.Offcanvas(cartEl);
    offcanvas.show();
  }

  if (open === "notif") {
    const notifEl = document.getElementById("notifOffcanvas");
    const offcanvas = new bootstrap.Offcanvas(notifEl);
    offcanvas.show();
  }

  localStorage.removeItem("openOffcanvas");
});
















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


