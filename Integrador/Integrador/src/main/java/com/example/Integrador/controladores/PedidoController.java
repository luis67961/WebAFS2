package com.example.Integrador.controladores;

import com.example.Integrador.modelos.*;
import com.example.Integrador.repositorios.*;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    @Autowired
    private PedidoRepository pedidoRepository;
    @Autowired
    private CarritoRepository carritoRepository;
    @Autowired
    private ClienteRepository clienteRepository;

    @PostMapping("/finalizar")
    public Map<String, Object> finalizarPedido(@RequestBody Map<String, String> body,
            HttpSession session) {

        try {

            Usuario u = (Usuario) session.getAttribute("usuario");
            if (u == null) {
                return Map.of("ok", false, "error", "NO_LOGIN");
            }

            String tipoDocumento = body.get("tipoDocumento");
            String documento = body.get("documento");
            String telefono = body.get("telefono");

            Carrito carrito = carritoRepository.findByUsuario(u);

            if (carrito == null || carrito.getItems() == null || carrito.getItems().isEmpty()) {
                return Map.of("ok", false, "error", "CARRITO_VACIO");
            }

            Cliente cliente = clienteRepository.findByUsuarioId(u.getId())
                    .orElseGet(() -> {

                        Cliente c = new Cliente();
                        c.setUsuario(u);
                        c.setDeuda(0.0);
                        c.setPedidos(new ArrayList<>());

                        c.setNivel("CLIENTE"); 
                        c.setTelefono(telefono); 

                        c.setUltimaCompra(LocalDate.now());
                        return clienteRepository.save(c);
                    });

            if (tipoDocumento == null || tipoDocumento.isBlank()) {
                return Map.of("ok", false, "error", "TIPO_DOCUMENTO_OBLIGATORIO");
            }

            tipoDocumento = tipoDocumento.trim().toUpperCase();

            if ("RUC".equals(tipoDocumento)) {

                if (documento == null || documento.length() != 11) {
                    return Map.of("ok", false, "error", "RUC_INVALIDO");
                }

                cliente.setRuc(documento);
                cliente.setDni(null);

            } else {

                if (documento == null || documento.length() != 8) {
                    return Map.of("ok", false, "error", "DNI_INVALIDO");
                }

                cliente.setDni(documento);
                cliente.setRuc(null);
            }

            cliente.setTelefono(telefono);
            clienteRepository.save(cliente);

            Pedido pedido = new Pedido();
            pedido.setCliente(cliente);
            pedido.setFechaPedido(LocalDateTime.now());
            pedido.setEstado("PENDIENTE");

            pedido.setDni(cliente.getDni());
            pedido.setRuc(cliente.getRuc());
            pedido.setTelefono(cliente.getTelefono());

            List<ItemPedido> itemsPedido = new ArrayList<>();
            double total = 0;

            for (ItemCarrito ic : carrito.getItems()) {

                if (ic == null || ic.getProducto() == null)
                    continue;

                Producto prod = ic.getProducto();

                ItemPedido ip = new ItemPedido();
                ip.setPedido(pedido);
                ip.setProducto(prod);
                ip.setCantidad(ic.getCantidad());
                ip.setPrecioUnitario(prod.getPrecio());

                double subtotal = ic.getCantidad() * prod.getPrecio();
                total += subtotal;

                itemsPedido.add(ip); 
            }

            pedido.setItems(itemsPedido);
            pedido.setTotal(total);

            cliente.getPedidos().add(pedido);

            pedidoRepository.save(pedido);

            carrito.getItems().clear();
            carritoRepository.save(carrito);

            return Map.of(
                    "ok", true,
                    "id", pedido.getId(),
                    "total", total);

        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("ok", false, "error", e.getMessage());
        }
    }
}