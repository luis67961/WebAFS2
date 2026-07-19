package com.example.Integrador.controladores;

import com.example.Integrador.dto.PedidoDTO;
import com.example.Integrador.modelos.ItemPedido;
import com.example.Integrador.modelos.Pedido;
import com.example.Integrador.modelos.Producto;
import com.example.Integrador.modelos.VentaManual;
import com.example.Integrador.modelos.VentaManualItem;
import com.example.Integrador.repositorios.PedidoRepository;
import com.example.Integrador.repositorios.ProductoRepository;
import com.example.Integrador.repositorios.VentaManualRepository;
import com.example.Integrador.servicios.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Integrador.dto.VentaManualDTO;

import java.time.LocalDateTime;
import java.util.ArrayList;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/pedidos")
public class AdminPedidoController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private VentaManualRepository ventaManualRepository;

    @GetMapping
    public List<PedidoDTO> listarPedidos() {
        return pedidoRepository.findTop20ByOrderByIdDesc()
                .stream()
                .map(PedidoDTO::new)
                .toList();
    }

    // ESTADISTICAS DE PEDIDOS

    @GetMapping("/stats")
    public StatsPedidos stats() {

        List<Pedido> pedidos = pedidoRepository.findAll();
        List<VentaManual> ventasManuales = ventaManualRepository.findAll();

        // PEDIDOS WEB
        long aprobados = pedidos.stream()
                .filter(p -> "APROBADO".equals(p.getEstado()))
                .count();

        long pendientes = pedidos.stream()
                .filter(p -> "PENDIENTE".equals(p.getEstado()))
                .count();

        long entregados = pedidos.stream()
                .filter(p -> "ENTREGADO".equals(p.getEstado()))
                .count();

        double facturado = pedidos.stream()
                .filter(p -> "ENTREGADO".equals(p.getEstado()))
                .mapToDouble(Pedido::getTotal)
                .sum();

        // VENTAS MANUALES

        long ventasTotales = pedidos.size() + ventasManuales.size();

        double facturadoManual = ventasManuales.stream()
                .mapToDouble(VentaManual::getTotal)
                .sum();

        long entregadosManuales = ventasManuales.stream()
                .filter(v -> "ENTREGADO".equals(v.getEstado()))
                .count();

        // CREAR DTO COMPLETO

        StatsPedidos stats = new StatsPedidos(
                aprobados,
                pendientes,
                entregados,
                facturado);

        stats.ventasTotales = ventasTotales;
        stats.facturadoManual = facturadoManual;
        stats.entregadosManuales = entregadosManuales;

        return stats;
    }

    // DTO por mientras por mientras luego separara en otra clase me dio paja
    public static class StatsPedidos {

        public long totalPedidos;
        public long pendientes;
        public long entregados;
        public double facturado;

        public long ventasTotales;
        public double facturadoManual;
        public long entregadosManuales;

        public StatsPedidos(long totalPedidos, long pendientes, long entregados, double facturado) {
            this.totalPedidos = totalPedidos;
            this.pendientes = pendientes;
            this.entregados = entregados;
            this.facturado = facturado;

            this.ventasTotales = 0;
            this.facturadoManual = 0;
            this.entregadosManuales = 0;
        }
    }

    // APROBAR PEDIDDO UNA VEZ PAGADO
    @PutMapping("/aprobar/{id}")
    public Map<String, Object> aprobar(@PathVariable Long id) {

        Pedido p = pedidoRepository.findById(id).orElse(null);

        if (p == null) {
            return Map.of("ok", false);
        }

        for (ItemPedido item : p.getItems()) {

            Producto producto = item.getProducto();

            if (producto.getStock() < item.getCantidad()) {
                return Map.of(
                        "ok", false,
                        "error", "STOCK_INSUFICIENTE",
                        "producto", producto.getNombre());
            }

            producto.setStock(producto.getStock() - item.getCantidad());
        }

        p.setEstado("APROBADO");
        pedidoRepository.save(p);

        // ENVIO DE CORREO

        String correo = p.getCliente().getUsuario().getEmail();

        // modificar tetxo
        String asunto = "Pedido #" + p.getId() + " aprobado";
        String mensaje = "Hola, tu pedido #" + p.getId()
                + " ha sido aprobado correctamente y ya está en preparación.";

        emailService.enviarCorreo(correo, asunto, mensaje);

        return Map.of(
                "ok", true,
                "correo", correo);
    }

    // ELIMINAR PEDIDO
    @DeleteMapping("/eliminar/{id}")
    public Map<String, Object> eliminarPedido(@PathVariable Long id) {

        Pedido pedido = pedidoRepository.findById(id).orElse(null);

        if (pedido == null) {
            return Map.of("ok", false, "error", "PEDIDO_NO_EXISTE");
        }

        // ENVÍO DE CORREO

        String correo = pedido.getCliente().getUsuario().getEmail();

        String asunto = "Pedido #" + pedido.getId() + " cancelado";

        String mensaje = "Hola 👋,\n\n"
                + "Tu pedido #" + pedido.getId() + " ha sido CANCELADO por el administrador.\n"
                + "Si tienes dudas, contáctanos.";

        emailService.enviarCorreo(correo, asunto, mensaje);

        // ELIMINAR PEDIDO
        pedido.getItems().clear();
        pedidoRepository.delete(pedido);

        return Map.of(
                "ok", true,
                "mensaje", "Pedido eliminado correctamente",
                "correo", correo);

    }

    @PutMapping("/finalizar/{id}")
    public Map<String, Object> finalizar(@PathVariable Long id) {

        Pedido p = pedidoRepository.findById(id).orElse(null);

        if (p == null) {
            return Map.of("ok", false, "error", "NOT_FOUND");
        }

        // CAMBIAR ESTADO

        p.setEstado("ENTREGADO");
        pedidoRepository.save(p);

        // ENVÍO DE CORREO
        String correo = p.getCliente().getUsuario().getEmail();

        String asunto = "Pedido #" + p.getId() + " entregado";

        String mensaje = "Hola 👋,\n\n"
                + "Tu pedido #" + p.getId() + " ha sido ENTREGADO con éxito.\n"
                + "Gracias por tu compra 🙌";

        emailService.enviarCorreo(correo, asunto, mensaje);

        return Map.of("ok", true, "correo",correo);
    }

    @GetMapping("/ultimo-pendiente")
    public ResponseEntity<PedidoDTO> ultimoPendiente() {

        return pedidoRepository.findAll().stream()
                .filter(p -> "PENDIENTE".equals(p.getEstado()))
                .max(Comparator.comparing(Pedido::getFechaPedido))
                .map(p -> ResponseEntity.ok(new PedidoDTO(p)))
                .orElse(ResponseEntity.ok(null));
    }

    // VENTA MANUAL
    @PostMapping("/venta-manual")
    public Map<String, Object> registrarVentaManual(@RequestBody VentaManualDTO dto) {

        VentaManual venta = new VentaManual();

        venta.setDni(dto.dni);
        venta.setNombreCliente(dto.nombreCliente);
        venta.setFecha(LocalDateTime.now());
        venta.setEstado("ENTREGADO");

        List<VentaManualItem> items = new ArrayList<>();
        double total = 0;

        for (VentaManualDTO.ItemVentaDTO itemDTO : dto.productos) {

            Producto producto = productoRepository.findById(itemDTO.productoId)
                    .orElse(null);

            if (producto == null) {
                return Map.of("ok", false, "error", "PRODUCTO_NO_EXISTE");
            }

            int kilos = (int) itemDTO.kilos;

            if (kilos <= 0) {
                return Map.of("ok", false, "error", "KILOS_INVALIDOS");
            }

            if (producto.getStock() < kilos) {
                return Map.of("ok", false, "error", "STOCK_INSUFICIENTE");
            }

            // descontar stock
            producto.setStock(producto.getStock() - kilos);

            VentaManualItem item = new VentaManualItem();
            item.setProductoId(producto.getId());
            item.setNombreProducto(producto.getNombre());
            item.setKilos(kilos);
            item.setPrecio(itemDTO.precio);

            double subtotal = kilos * itemDTO.precio;
            item.setSubtotal(subtotal);

            item.setVenta(venta);

            items.add(item);
            total += subtotal;
        }

        venta.setItems(items);
        venta.setTotal(total);

        ventaManualRepository.save(venta);

        return Map.of("ok", true, "total", total);
    }

    @GetMapping("/ventas-manuales")
    public List<VentaManual> listarVentasManuales() {
        return ventaManualRepository.findAll();
    }

    @GetMapping("/venta-manual/{id}")
    public VentaManual getVentaManual(@PathVariable Long id) {
        return ventaManualRepository.findById(id)
                .orElse(null);
    }

    @GetMapping("/reportes-ventas")
    public Map<String, Object> reportesVentas() {

        Map<String, Object> r = new HashMap<>();

        List<Pedido> pedidos = pedidoRepository.findAll();
        List<VentaManual> ventasManuales = ventaManualRepository.findAll();

        // TOTAL VENDIDO GENERAL

        double totalWeb = pedidos.stream()
                .filter(p -> "ENTREGADO".equals(p.getEstado()))
                .mapToDouble(Pedido::getTotal)
                .sum();

        double totalManual = ventasManuales.stream()
                .mapToDouble(VentaManual::getTotal)
                .sum();

        r.put("totalVentas", totalWeb + totalManual);

        // VENTAS POR MES

        Map<String, Double> ventasPorMes = new HashMap<>();

        pedidos.forEach(p -> {
            if ("ENTREGADO".equals(p.getEstado())) {
                String mes = p.getFechaPedido().getYear() + "-" + p.getFechaPedido().getMonthValue();
                ventasPorMes.put(mes,
                        ventasPorMes.getOrDefault(mes, 0.0) + p.getTotal());
            }
        });

        ventasManuales.forEach(v -> {
            String mes = v.getFecha().getYear() + "-" + v.getFecha().getMonthValue();
            ventasPorMes.put(mes,
                    ventasPorMes.getOrDefault(mes, 0.0) + v.getTotal());
        });

        r.put("ventasPorMes", ventasPorMes);

        // PRODUCTO + VENDIDO

        Map<String, Integer> productosVendidos = new HashMap<>();

        pedidos.forEach(p -> {
            p.getItems().forEach(i -> {
                String nombre = i.getProducto().getNombre();
                productosVendidos.put(nombre,
                        productosVendidos.getOrDefault(nombre, 0) + i.getCantidad());
            });
        });

        ventasManuales.forEach(v -> {
            v.getItems().forEach(i -> {
                productosVendidos.put(i.getNombreProducto(),
                        productosVendidos.getOrDefault(i.getNombreProducto(), 0) + i.getKilos());
            });
        });

        String productoMasVendido = productosVendidos.entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        r.put("productoMasVendido", productoMasVendido);
        r.put("rankingProductos", productosVendidos);

        // MES CON + VENTAS
        String mejorMes = ventasPorMes.entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        r.put("mejorMes", mejorMes);

        // CONTEO GENERAL
        r.put("totalPedidos", pedidos.size());
        r.put("totalVentasManuales", ventasManuales.size());

        return r;
    }

}