package com.example.Integrador.controladores;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Integrador.modelos.Producto;
import com.example.Integrador.servicios.ProductoService;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @GetMapping("/categoria/{categoria}")
    public List<Producto> listarPorCategoria(@PathVariable String categoria) {
        return productoService.listarPorCategoria(categoria);
    }

    @GetMapping("/todos")
    public List<Producto> listarTodos() {
        return productoService.listarTodos();
    }

    // ==================== ACTUALIZAR COMPLETO ====================
    @PutMapping("/{id}")
    public Producto actualizar(@PathVariable Long id, @RequestBody Producto productoActualizado) {
        return productoService.actualizarProducto(id, productoActualizado);
    }

    // aumentar stock
    @PutMapping("/aumentar/{id}")
    public Producto aumentar(@PathVariable Long id) {
        return productoService.aumentarStock(id);
    }

    // dimsinui

    @PutMapping("/disminuir/{id}")
    public Producto disminuir(@PathVariable Long id) {
        return productoService.disminuirStock(id);
    }

    // obetener por id
    @GetMapping("/{id}")
    public Producto obtenerPorId(@PathVariable Long id) {
        return productoService.obtenerPorId(id);
    }

    // eliminar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            productoService.eliminarProducto(id);
            return ResponseEntity.noContent().build(); // 204
        } catch (Exception e) {
            return ResponseEntity.notFound().build(); // 404
        }
    }

    // crera uno nuevo
    @PostMapping
    public Producto crear(@RequestBody Producto producto) {
        return productoService.guardarProducto(producto);
    }

    @GetMapping("/search")
    public List<Producto> buscarProductos(@RequestParam String term) {
        return productoService.buscarPorNombreOCategoria(term);
    }

    @PutMapping("/costo/{id}")
    public Producto actualizarCostoProduccion(
            @PathVariable Long id,
            @RequestBody Producto productoRequest) {

        Producto producto = productoService.obtenerPorId(id);

        producto.setCostoProduccion(productoRequest.getCostoProduccion());

        return productoService.guardarProducto(producto);
    }
}