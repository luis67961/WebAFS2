package com.example.Integrador.controladores;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.Integrador.modelos.Carrito;
import com.example.Integrador.modelos.ItemCarrito;
import com.example.Integrador.modelos.Usuario;
import com.example.Integrador.modelos.Producto;
import com.example.Integrador.repositorios.CarritoRepository;
import com.example.Integrador.repositorios.ProductoRepository;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/carrito")
public class CarritoController {

    @Autowired
    private CarritoRepository carritoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    // AGREGAR AL CARRITO
    @PostMapping("/agregar")
    public Map<String, Object> agregar(@RequestBody Map<String, Long> body,
            HttpSession session) {

        Usuario u = (Usuario) session.getAttribute("usuario");

        // NO LOGUEADO
        if (u == null) {
            return Map.of(
                    "ok", false,
                    "error", "NO_LOGIN");
        }

        Long productoId = body.get("productoId");

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // BUSCAR O CREAR CARRITO
        Carrito carrito = carritoRepository.findByUsuario(u);

        if (carrito == null) {
            carrito = new Carrito();
            carrito.setUsuario(u);
            carrito.setItems(new ArrayList<>());
        }

        if (carrito.getItems() == null) {
            carrito.setItems(new ArrayList<>());
        }

        // BUSCAR ITEM EXISTENTE
        Optional<ItemCarrito> existente = carrito.getItems()
                .stream()
                .filter(i -> i.getProducto().getId().equals(productoId))
                .findFirst();

        if (existente.isPresent()) {
            existente.get().setCantidad(existente.get().getCantidad() + 1);
        } else {
            ItemCarrito item = new ItemCarrito();
            item.setCarrito(carrito);
            item.setProducto(producto);
            item.setCantidad(1);
            carrito.getItems().add(item);
        }

        carritoRepository.save(carrito);

        return Map.of(
                "ok", true);
    }

    // VER CARRITO
    @GetMapping
    public Map<String, Object> verCarrito(HttpSession session) {

        Usuario u = (Usuario) session.getAttribute("usuario");

        if (u == null) {
            return Map.of(
                    "ok", false,
                    "error", "NO_LOGIN");
        }

        Carrito carrito = carritoRepository.findByUsuario(u);

        if (carrito == null) {
            return Map.of(
                    "ok", true,
                    "items", List.of());
        }

        return Map.of(
                "ok", true,
                "items", carrito.getItems());
    }

    //actualizar cantidad
    @PostMapping("/actualizar")
    public Map<String, Object> actualizarCantidad(@RequestBody Map<String, Long> body,
            HttpSession session) {

        Usuario u = (Usuario) session.getAttribute("usuario");

        if (u == null) {
            return Map.of("ok", false, "error", "NO_LOGIN");
        }

        Long productoId = body.get("productoId");
        Long cantidad = body.get("cantidad");

        Carrito carrito = carritoRepository.findByUsuario(u);

        if (carrito == null) {
            return Map.of("ok", false, "error", "NO_CART");
        }

        carrito.getItems().forEach(item -> {
            if (item.getProducto().getId().equals(productoId)) {
                item.setCantidad(Math.max(1, cantidad.intValue()));
            }
        });

        carritoRepository.save(carrito);

        return Map.of("ok", true);
    }

    //ELIMINAR DEL CARRITO
 @PostMapping("/eliminar")
public Map<String, Object> eliminar(@RequestBody Map<String, Long> body,
                                   HttpSession session) {

    Usuario u = (Usuario) session.getAttribute("usuario");

    if (u == null) {
        return Map.of("ok", false, "error", "NO_LOGIN");
    }

    Long productoId = body.get("productoId");

    Carrito carrito = carritoRepository.findByUsuario(u);

    if (carrito == null) {
        return Map.of("ok", false, "error", "NO_CART");
    }

    carrito.getItems().removeIf(item ->
        item.getProducto().getId().equals(productoId)
    );

    carritoRepository.save(carrito);

    return Map.of("ok", true);
}

}