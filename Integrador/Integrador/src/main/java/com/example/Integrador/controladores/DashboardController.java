package com.example.Integrador.controladores;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Integrador.modelos.Pedido;
import com.example.Integrador.modelos.VentaManual;
import com.example.Integrador.repositorios.ClienteRepository;
import com.example.Integrador.repositorios.PedidoRepository;
import com.example.Integrador.repositorios.VentaManualRepository;
import com.example.Integrador.repositorios.VisitaTecnicaRepository;

import java.time.LocalDateTime;
import java.time.DayOfWeek;

@RestController
@RequestMapping("/vendedor")
public class DashboardController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private VisitaTecnicaRepository visitaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private VentaManualRepository ventaManualRepository;

    @GetMapping("/stats")
    public Map<String, Object> statsVendedor() {

        Map<String, Object> data = new HashMap<>();

        
        // FECHA INICIO SEMANA
        
        LocalDateTime inicioSemana = LocalDateTime.now()
                .with(DayOfWeek.MONDAY)
                .toLocalDate()
                .atStartOfDay();

        
        // TOTALES GENERALES
        
        long pedidos = pedidoRepository.count();
        long visitas = visitaRepository.count();

        long clientesWeb = clienteRepository.count();

        long clientesManual = ventaManualRepository.findAll()
                .stream()
                .map(v -> v.getDni())
                .distinct()
                .count();

        long clientesTotales = clientesWeb + clientesManual;

        
        // VENTAS TOTALES (WEB + MANUAL)
        
        double ventasWebTotal = pedidoRepository.findAll()
                .stream()
                .filter(p -> "ENTREGADO".equals(p.getEstado()))
                .mapToDouble(Pedido::getTotal)
                .sum();

        double ventasManualTotal = ventaManualRepository.findAll()
                .stream()
                .mapToDouble(VentaManual::getTotal)
                .sum();

        double ventas = ventasWebTotal + ventasManualTotal;

        
        // ESTA SEMANA
        
        long pedidosSemana = pedidoRepository.findAll()
                .stream()
                .filter(p -> p.getFechaPedido() != null)
                .filter(p -> p.getFechaPedido().isAfter(inicioSemana))
                .count();

        long visitasSemana = visitaRepository.findAll()
                .stream()
                .filter(v -> v.getFechaSolicitud() != null)
                .filter(v -> v.getFechaSolicitud().isAfter(inicioSemana))
                .count();
        double ventasSemanaWeb = pedidoRepository.findAll()
                .stream()
                .filter(p -> p.getFechaPedido() != null)
                .filter(p -> p.getEstado() != null && p.getEstado().equalsIgnoreCase("ENTREGADO"))
                .filter(p -> !p.getFechaPedido().isBefore(inicioSemana))
                .mapToDouble(Pedido::getTotal)
                .sum();

        double ventasSemanaManual = ventaManualRepository.findAll()
                .stream()
                .filter(v -> v.getFecha() != null)
                .filter(v -> !v.getFecha().isBefore(inicioSemana))
                .mapToDouble(VentaManual::getTotal)
                .sum();

        double ventasSemana = ventasSemanaWeb + ventasSemanaManual;

        
        // RESPONSE
        
        data.put("pedidos", pedidos);
        data.put("visitas", visitas);
        data.put("clientes", clientesTotales);

        data.put("ventas", ventas);

        data.put("pedidosSemana", pedidosSemana);
        data.put("visitasSemana", visitasSemana);
        data.put("ventasSemana", ventasSemana);

        return data;
    }

    @GetMapping("/vendedor/graficas")
    public Map<String, Object> graficas() {

        Map<String, Object> data = new HashMap<>();

        // VENTAS POR MES
        List<Pedido> pedidos = pedidoRepository.findAll();

        Map<String, Double> ventasMensuales = new LinkedHashMap<>();

        String[] meses = { "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic" };

        for (int i = 0; i < 12; i++) {
            ventasMensuales.put(meses[i], 0.0);
        }

        for (Pedido p : pedidos) {
            if (p.getFechaPedido() == null)
                continue;

            int mes = p.getFechaPedido().getMonthValue() - 1;
            String nombreMes = meses[mes];

            ventasMensuales.put(
                    nombreMes,
                    ventasMensuales.get(nombreMes) + p.getTotal());
        }

        // PRODUCTOS + VENDIDOS

        Map<String, Integer> productos = new HashMap<>();

        for (Pedido p : pedidos) {
            p.getItems().forEach(item -> {
                String nombre = item.getProducto().getNombre();
                productos.put(nombre,
                        productos.getOrDefault(nombre, 0) + item.getCantidad());
            });
        }

        data.put("ventasMensuales", ventasMensuales);
        data.put("productos", productos);

        return data;
    }

    // REPORTES

    @GetMapping("/reporte/pedidos")
    public List<Map<String, Object>> reportePedidos() {

        List<Map<String, Object>> lista = new ArrayList<>();

        for (Pedido p : pedidoRepository.findAll()) {

            Map<String, Object> fila = new HashMap<>();

            fila.put("id", p.getId());

            String cliente = "SIN CLIENTE";

            if (p.getCliente() != null && p.getCliente().getUsuario() != null) {
                cliente = p.getCliente().getUsuario().getNombres();
            }

            fila.put("cliente", cliente);

            fila.put("fecha", p.getFechaPedido());
            fila.put("estado", p.getEstado());
            fila.put("total", p.getTotal());

            lista.add(fila);
        }

        return lista;
    }

    @GetMapping("/reporte/visitas")
    public List<Map<String, Object>> reporteVisitas() {

        List<Map<String, Object>> lista = new ArrayList<>();

        visitaRepository.findAll().forEach(v -> {

            Map<String, Object> fila = new HashMap<>();

            fila.put("cliente", v.getUsuario());
            fila.put("fecha", v.getFechaSolicitud());
            fila.put("telefono", v.getUsuarioTelefono());
            fila.put("estado", v.getEstado());

            lista.add(fila);

        });

        return lista;

    }

    @GetMapping("/reporte/clientes")
    public List<Map<String, Object>> reporteClientes() {

        List<Map<String, Object>> lista = new ArrayList<>();

        clienteRepository.findAll().forEach(c -> {

            Map<String, Object> fila = new HashMap<>();

            fila.put("nombre", c.getUsuario().getNombres());
            fila.put("dni", c.getDni());
            fila.put("telefono", c.getTelefono());
            fila.put("pedidos", c.getPedidos());

            lista.add(fila);

        });

        return lista;

    }

 @GetMapping("/reporte/ventas")
public List<Map<String, Object>> reporteVentas() {

    List<Map<String, Object>> lista = new ArrayList<>();

    pedidoRepository.findAll().stream()
            .filter(p -> "ENTREGADO".equals(p.getEstado()))
            .forEach(p -> {

                Map<String, Object> fila = new HashMap<>();

                String cliente = "SIN CLIENTE";

                if (p.getCliente() != null && p.getCliente().getUsuario() != null) {

                    String nombres = p.getCliente().getUsuario().getNombres();
                    String apellidos = p.getCliente().getUsuario().getApellidos();

                    cliente = nombres + " " + (apellidos != null ? apellidos : "");
                }

                fila.put("tipo", "WEB");
                fila.put("cliente", cliente);
                fila.put("fecha", p.getFechaPedido());
                fila.put("total", p.getTotal());

                lista.add(fila);

            });

    ventaManualRepository.findAll().forEach(v -> {

        Map<String, Object> fila = new HashMap<>();

        fila.put("tipo", "MANUAL");
        fila.put("cliente", v.getNombreCliente());
        fila.put("fecha", v.getFecha());
        fila.put("total", v.getTotal());

        lista.add(fila);

    });

    return lista;
}
}