
function toggleMenu(btn){


    document.querySelectorAll(".card-actions")
    .forEach(menu => {

        menu.classList.toggle("show");

    });


}











document.addEventListener("DOMContentLoaded", () => {

    const grid = document.querySelector(".product-grid");
    let categoriaActual = "avicola";

    if (!grid) return;

    // =========================
    // CARGAR PRODUCTOS
    // =========================
    function cargarProductos(categoria) {

        categoriaActual = categoria;

        fetch(`http://localhost:8080/api/productos/categoria/${categoria}`)
            .then(res => res.json())
            .then(data => {

                grid.innerHTML = "";

                data.forEach(p => {

                    const card = document.createElement("div");
                    card.className = "book";
                    card.setAttribute("data-id", p.id);

                   card.innerHTML = `

<div class="cover glass-card h-100 d-flex flex-column border border-success">
    <!-- Imagen -->
    <div class="text-center pt-3">

        <img
            src="${p.imagen}"
            class="product-img img-fluid"
            alt="${p.nombre}">

    </div>


    <!-- Nombre -->
    <div class="text-center px-3 mt-2">

        <h5 class="product-name text-white fw-bold mb-2">

            ${p.nombre}

        </h5>

        <span class="badge bg-success rounded-pill px-3">

            ${p.categoria}

        </span>

    </div>



    <!-- Información -->
    <div class="px-3 mt-3">

        <div class="glass-info">

            <div>

                <small>Precio</small>

                <h5 class="text-success mb-0">

                    S/ ${p.precio}

                </h5>

            </div>

            <div class="text-end">

                <small>Stock</small>

                <h6 class="text-white mb-0">

                    ${p.stock} KG

                </h6>

            </div>

        </div>


        <div class="glass-cost mt-2">

            <i class="bi bi-cash-stack text-warning me-2"></i>

            <span>

                Costo Admin

            </span>

            <strong class="text-warning ms-auto">

                S/ ${p.costoProduccion ?? "No definido"}

            </strong>

        </div>

    </div>



    <!-- Footer -->
 <div class="inside mt-auto p-3">

    <div class="d-flex justify-content-between align-items-center">


        <!-- STOCK -->
        <div class="d-flex gap-2">

            <button
                class="btn btn-success rounded-circle btn-plus">

                <i class="bi bi-plus-lg"></i>

            </button>


            <button
                class="btn btn-outline-light rounded-circle btn-minus">

                <i class="bi bi-dash-lg"></i>

            </button>

        </div>



        <!-- BOTON MENU -->
        <button
            class="btn btn-outline-success rounded-circle"
            onclick="toggleMenu(this)">

            <i class="bi bi-three-dots"></i>

        </button>


    </div>



    <!-- MENU INTERNO -->
    <div class="card-actions mt-3">


        <button
            class="btn btn-warning btn-sm w-100 mb-2"
            onclick='abrirModalCosto(${p.id}, ${JSON.stringify(p.nombre)})'>


            <i class="bi bi-cash-coin me-2"></i>

            Precio de Producción


        </button>



        <button
            class="btn btn-primary btn-sm w-100 mb-2 btn-update">


            <i class="bi bi-pencil-square me-2"></i>

            Editar producto


        </button>



        <button
            class="btn btn-danger btn-sm w-100 btn-delete">


            <i class="bi bi-trash3 me-2"></i>

            Eliminar


        </button>


    </div>


</div>

    </div>

</div>

`;

                    grid.appendChild(card);
                });
            })
            .catch(err => {
                console.error("Error cargando productos:", err);
            });
    }

  

    // =========================
    // EVENTOS BOTONES 
    // =========================
    grid.addEventListener("click", async (e) => {

        const card = e.target.closest(".book");
        if (!card) return;

        const id = card.dataset.id;

        //  AUMENTAR STOCK
        if (e.target.closest(".btn-plus")) {

            await fetch(`http://localhost:8080/api/productos/aumentar/${id}`, {
                method: "PUT"
            });

            cargarProductos(categoriaActual);
        }

        //  DISMINUIR STOCK
        if (e.target.closest(".btn-minus")) {

            await fetch(`http://localhost:8080/api/productos/disminuir/${id}`, {
                method: "PUT"
            });

            cargarProductos(categoriaActual);
        }

    
    });


// ==================== ELIMINAR PRODUCTO ====================
let productoAEliminar = null;

grid.addEventListener("click", async (e) => {

    const card = e.target.closest(".book");
    if (!card) return;

    const id = card.dataset.id;

    if (e.target.closest(".btn-delete")) {

        const productName = card.querySelector('.product-name')?.textContent || "este producto";

        productoAEliminar = { id: id, card: card, nombre: productName };

        document.getElementById('deleteModalBody').innerHTML = `
            <p class="mb-1">¿Estás seguro de que deseas eliminar el siguiente producto?</p>
            <strong class="text-danger fs-5">"${productName}"</strong>
            <p class="text-muted mt-3 small">Esta acción es irreversible.</p>
        `;

        const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        modal.show();
    }
});

// ==================== CONFIRMAR ELIMINACIÓN ====================
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {

    if (!productoAEliminar) return;

    try {
        const response = await fetch(`http://localhost:8080/api/productos/${productoAEliminar.id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            productoAEliminar.card.remove();
        } else {
            alert(" Error al eliminar el producto");
        }
    } catch (error) {
        console.error(error);
        alert(" Error de conexión con el servidor");
    }

    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
    if (modal) modal.hide();
    
    productoAEliminar = null;
});


















    // =========================
    // FILTROS CATEGORÍAS
    // =========================
    document.querySelectorAll(".boton-pestana").forEach(btn => {

        btn.addEventListener("click", () => {

            document.querySelectorAll(".boton-pestana")
                .forEach(b => b.classList.remove("activo"));

            btn.classList.add("activo");

            const categoria = btn.dataset.categoria;
            cargarProductos(categoria);
        });
    });

    // =========================
    // INICIAL
    // =========================
    cargarProductos(categoriaActual);

});




// ==================== ABRIR MODAL ====================
document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-update')) {
        const card = e.target.closest('.book');
        const productId = card.dataset.id;

        fetch(`http://localhost:8080/api/productos/${productId}`)
            .then(res => {
                if (!res.ok) throw new Error("Producto no encontrado");
                return res.json();
            })
            .then(p => {
                document.getElementById('productId').value = p.id;
                document.getElementById('modal-name').value = p.nombre;
                document.getElementById('modal-category').value = p.categoria;
                document.getElementById('modal-desc').value = p.descripcion || '';
                document.getElementById('modal-stock').value = p.stock;
                document.getElementById('modal-price').value = p.precio;
                document.getElementById('modal-image').value = p.imagen || '';

                const modal = new bootstrap.Modal(document.getElementById('updateModal'));
                modal.show();
            })
            .catch(err => {
                console.error(err);
                alert("Error al cargar los datos del producto");
            });
    }
});

// ==================== ENVIAR AL BACKEND ====================
document.getElementById('updateForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const id = document.getElementById('productId').value;
    const modalElement = document.getElementById('updateModal');

    const updatedProduct = {
        nombre: document.getElementById('modal-name').value.trim(),
        categoria: document.getElementById('modal-category').value.trim(),
        descripcion: document.getElementById('modal-desc').value.trim(),
        stock: parseFloat(document.getElementById('modal-stock').value),
        precio: parseFloat(document.getElementById('modal-price').value),
        imagen: document.getElementById('modal-image').value.trim()
    };

    fetch(`http://localhost:8080/api/productos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProduct)
    })
    .then(res => {
        if (res.ok) {
            
            // Cerrar modal
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            } else {
                modalElement.style.display = 'none';
            }

            setTimeout(() => {
                window.location.reload();
            }, 100);  

        } else {
            alert(" Error al actualizar el producto");
        }
    })
    .catch(err => {
        console.error(err);
        alert(" Error de conexión con el servidor");
    });
});















// ==================== ABRIR MODAL AGREGAR ====================
document.querySelector('.btn-success').addEventListener('click', function() {
    // Limpiar formulario
    document.getElementById('addProductForm').reset();
    
    const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
    modal.show();
});

// ==================== ENVIAR NUEVO PRODUCTO ====================
document.getElementById('addProductForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const newProduct = {
        nombre: document.getElementById('add-name').value.trim(),
        categoria: document.getElementById('add-category').value,
        descripcion: document.getElementById('add-desc').value.trim(),
        precio: parseFloat(document.getElementById('add-price').value),
        stock: parseInt(document.getElementById('add-stock').value),
        imagen: document.getElementById('add-image').value.trim(),
        peso: document.getElementById('add-peso').value.trim(),
        proteina: document.getElementById('add-proteina').value.trim()
    };

    fetch('http://localhost:8080/api/productos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
    })
    .then(res => {
        if (res.ok) {
            bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
            window.location.reload(); // Recargar página
        } else {
            alert("Error al guardar el producto");
        }
    })
    .catch(err => {
        console.error(err);
        alert(" Error de conexión con el servidor");
    });
});









// ==================== BÚSQUEDA CON BOTÓN ====================
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

searchButton.addEventListener('click', function() {
    realizarBusqueda();
});

// También permitir buscar presionando "Enter" en el input
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        realizarBusqueda();
    }
});

function realizarBusqueda() {
    const term = searchInput.value.trim();

    if (term.length === 0) {
        alert("Por favor ingresa un término de búsqueda");
        return;
    }

    fetch(`http://localhost:8080/api/productos/search?term=${encodeURIComponent(term)}`)
        .then(res => {
            if (!res.ok) throw new Error("Error en la búsqueda");
            return res.json();
        })
        .then(data => {
            const resultsBody = document.getElementById('searchResultsBody');
            resultsBody.innerHTML = "";

            if (data.length === 0) {
                resultsBody.innerHTML = `
                    <div class="text-center py-5">
                        <h4 class="text-muted">No se encontraron resultados</h4>
                        <p>Para "<strong>${term}</strong>"</p>
                    </div>`;
            } else {
                let html = '<div class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">';
                
                data.forEach(p => {
                    html += `
                    <div class="col">
                        <div class="book" data-id="${p.id}">
                            <div class="cover">
                                <img class="product-img" src="${p.imagen || 'https://via.placeholder.com/65'}" alt="${p.nombre}">
                                <div class="product-info">
                                    <h3 class="product-name">${p.nombre}</h3>
                                    <small class="product-code">${p.categoria}</small>
                                    <div class="stock">STOCK: <strong>${p.stock} KG</strong></div>
                                </div>
                            </div>

                            <div class="inside">
                                <div class="price">Precio: S/ ${p.precio}</div>
                                <div class="actions">
                                    <button class="btn-plus"><i class="bi bi-plus"></i></button>
                                    <button class="btn-minus"><i class="bi bi-dash"></i></button>
                                    <button class="btn-update"><i class="bi bi-arrow-clockwise"></i></button>
                                    <button class="btn-delete"><i class="bi bi-trash"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>`;
                });

                html += '</div>';
                resultsBody.innerHTML = html;
            }

            // Mostrar el modal de resultados
            const searchModal = new bootstrap.Modal(document.getElementById('searchResultsModal'));
            searchModal.show();
        })
        .catch(err => {
            console.error(err);
            document.getElementById('searchResultsBody').innerHTML = `
                <div class="text-center py-5 text-danger">
                    <h4>Error al realizar la búsqueda</h4>
                    <p>Inténtalo de nuevo</p>
                </div>`;
            
            const searchModal = new bootstrap.Modal(document.getElementById('searchResultsModal'));
            searchModal.show();
        });
}

//COSTOP DE PRODUCCION

let modalCosto = null;

function abrirModalCosto(id, nombre) {

    document.getElementById("productoIdCosto").value = id;
    document.getElementById("productoNombreCosto").value = nombre;
    document.getElementById("costoProduccionInput").value = "";

    modalCosto = new bootstrap.Modal(
        document.getElementById("modalCostoProduccion")
    );

    modalCosto.show();
}

function guardarCostoProduccion() {

    const id = document.getElementById("productoIdCosto").value;
    const costo = document.getElementById("costoProduccionInput").value;

    if (!costo || costo <= 0) {
        alert("Ingrese un costo válido");
        return;
    }

    fetch(`/api/productos/costo/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            costoProduccion: parseFloat(costo)
        })
    })
    .then(res => res.json())
    .then(data => {

        alert("Costo actualizado correctamente");

        modalCosto.hide();

        // opcional: recargar tabla o dashboard
        if (typeof loadProductos === "function") {
            loadProductos();
        }

    })
    .catch(err => {
        console.error(err);
        alert("Error al actualizar costo");
    });
}