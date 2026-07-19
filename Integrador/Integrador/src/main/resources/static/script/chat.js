window.addEventListener("DOMContentLoaded", () => {

    const contenedor = document.querySelector(".contenedor-chat-flotante");
    const chatBox = document.querySelector("#ventanaChat");
    const chatBody = document.querySelector(".cuerpo-chat");
    const input = document.querySelector("#inputMensajeChat");
    const btnSend = document.querySelector(".boton-enviar-chat");
    const btnToggle = document.querySelector("#btnToggleChat");

    const backendURL = "http://localhost:8080/api/chat";

    if (!contenedor || !chatBox || !chatBody || !input || !btnSend || !btnToggle) {
        console.error("Chat: elementos no encontrados");
        return;
    }

  
    const crearMensaje = (texto, tipo) => {
        const div = document.createElement("div");
        div.classList.add(tipo === "user" ? "mensaje-usuario" : "mensaje-bot");
        div.innerHTML = `<p>${texto}</p>`;
        return div;
    };

    const mostrarMensaje = (texto, tipo) => {
        const msg = crearMensaje(texto, tipo);
        chatBody.appendChild(msg);
        chatBody.scrollTop = chatBody.scrollHeight;
    };

  
    let typingElement = null;

    const mostrarTyping = () => {
        typingElement = document.createElement("div");
        typingElement.classList.add("mensaje-bot");
        typingElement.innerHTML = `<p>Escribiendo...</p>`;
        chatBody.appendChild(typingElement);
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    const ocultarTyping = () => {
        if (typingElement) typingElement.remove();
        typingElement = null;
    };

   
    const enviarAlBackend = async (mensaje) => {
        try {
            const res = await fetch(backendURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: mensaje })
            });

            const data = await res.json();
            return data.reply || "Sin respuesta del servidor";

        } catch (err) {
            console.error(err);
            return "Error al conectar con el servidor";
        }
    };

  
    const enviarMensaje = async () => {
        const mensaje = input.value.trim();
        if (!mensaje) return;

        mostrarMensaje(mensaje, "user");
        input.value = "";

        mostrarTyping();

        const respuesta = await enviarAlBackend(mensaje);

        ocultarTyping();
        mostrarMensaje(respuesta, "bot");
    };

    btnSend.addEventListener("click", enviarMensaje);

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            enviarMensaje();
        }
    });

 
    let abierto = false;

    btnToggle.addEventListener("click", () => {
        abierto = !abierto;

        if (abierto) {
            contenedor.classList.add("abierto");
        } else {
            contenedor.classList.remove("abierto");
        }
    });

});