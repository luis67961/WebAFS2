package com.example.Integrador.servicios;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Integrador.modelos.AlertaAdmin;
import com.example.Integrador.modelos.Producto;
import com.example.Integrador.repositorios.AlertaRepository;
import com.example.Integrador.repositorios.ProductoRepository;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private AlertaRepository alertaRepository;

    private static final String TIPO_PRODUCTO = "PRODUCTO";
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    private final ConcurrentHashMap<Long, Runnable> pendingTasks = new ConcurrentHashMap<>();

    private final ConcurrentHashMap<Long, Integer> stockAnterior = new ConcurrentHashMap<>();

   
    private void programarAlertaStock(Producto producto) {

        Long id = producto.getId();
        pendingTasks.remove(id);

        Runnable tarea = () -> {

            Producto p = productoRepository.findById(id)
                    .orElse(null);

            if (p == null)
                return;

            Integer anterior = stockAnterior.getOrDefault(id, p.getStock());

            int actual = p.getStock();
            int diferencia = actual - anterior;

            String movimiento;

            if (diferencia > 0) {
                movimiento = "incrementó en +" + diferencia + " kg";
            } else if (diferencia < 0) {
                movimiento = "disminuyó en " + diferencia + " kg";
            } else {
                movimiento = "no presentó cambios significativos";
            }

            String mensaje = "Se detectaron modificaciones en el stock del producto '"
                    + p.getNombre()
                    + "'. Durante esta operación el stock pasó de "
                    + anterior + " kg a " + actual + " kg, lo que significa que el sistema "
                    + movimiento + " durante el proceso de actualización.";

            registrarAlerta(
                    "Actualización de stock",
                    mensaje,
                    TIPO_PRODUCTO);

            pendingTasks.remove(id);
            stockAnterior.remove(id);
        };

        pendingTasks.put(id, tarea);

        scheduler.schedule(() -> {
            Runnable t = pendingTasks.get(id);
            if (t == tarea) {
                tarea.run();
            }
        }, 12, TimeUnit.SECONDS);
    }

    // REGISTRAR ALERTA
    private void registrarAlerta(String titulo, String mensaje, String tipo) {

        AlertaAdmin alerta = new AlertaAdmin();
        alerta.setTitulo(titulo);
        alerta.setMensaje(mensaje);
        alerta.setTipo(tipo);
        alerta.setFecha(LocalDateTime.now());
        alerta.setLeida(false);

        alertaRepository.save(alerta);
    }

    // LISTADOS
    public List<Producto> listarPorCategoria(String categoria) {
        return productoRepository.findByCategoria(categoria);
    }

    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    // STOCK
    public Producto aumentarStock(Long id) {

        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        p.setStock(p.getStock() + 1);

        Producto actualizado = productoRepository.save(p);

        programarAlertaStock(actualizado);
        return actualizado;
    }

    public Producto disminuirStock(Long id) {

        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (p.getStock() > 0) {
            p.setStock(p.getStock() - 1);
        }

        Producto actualizado = productoRepository.save(p);

        programarAlertaStock(actualizado);
        return actualizado;
    }

    // ELIMINAR
    public void eliminarProducto(Long id) {

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        String nombre = producto.getNombre();

        productoRepository.delete(producto);

        registrarAlerta(
                "Producto eliminado",
                "Se eliminó el producto '" + nombre + "'.",
                TIPO_PRODUCTO);
    }

    // OBTENER
    public Producto obtenerPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con id: " + id));
    }

    // ACTUALIZAR
    public Producto actualizarProducto(Long id, Producto productoActualizado) {

        return productoRepository.findById(id)
                .map(producto -> {

                    producto.setNombre(productoActualizado.getNombre());
                    producto.setCategoria(productoActualizado.getCategoria());
                    producto.setDescripcion(
                            productoActualizado.getDescripcion() != null
                                    ? productoActualizado.getDescripcion()
                                    : producto.getDescripcion());

                    producto.setStock(productoActualizado.getStock());
                    producto.setPrecio(productoActualizado.getPrecio());
                    producto.setImagen(productoActualizado.getImagen());

                    Producto actualizado = productoRepository.save(producto);

                    registrarAlerta(
                            "Producto actualizado",
                            "Se actualizó la información del producto '" + actualizado.getNombre() + "'.",
                            TIPO_PRODUCTO);

                    if (actualizado.getStock() <= 50) {
                        registrarAlerta(
                                "Stock bajo",
                                "El producto '" + actualizado.getNombre()
                                        + "' tiene solamente " + actualizado.getStock() + " kg disponibles.",
                                TIPO_PRODUCTO);
                    }

                    return actualizado;
                })
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con id: " + id));
    }

    // CREAR
    public Producto guardarProducto(Producto producto) {

        Producto nuevo = productoRepository.save(producto);

        registrarAlerta(
                "Nuevo producto",
                "Se registró el producto '" + nuevo.getNombre()
                        + "' con " + nuevo.getStock() + " kg de stock.",
                TIPO_PRODUCTO);

        return nuevo;
    }

   
    // BUSCAR

    public List<Producto> buscarPorNombreOCategoria(String term) {

        if (term == null || term.trim().isEmpty()) {
            return listarTodos();
        }

        return productoRepository
                .findByNombreContainingIgnoreCaseOrCategoriaContainingIgnoreCase(term, term);
    }
}
