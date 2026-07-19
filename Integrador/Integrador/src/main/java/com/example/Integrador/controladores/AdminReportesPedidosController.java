package com.example.Integrador.controladores;

import com.example.Integrador.modelos.Pedido;
import com.example.Integrador.modelos.ItemPedido;
import com.example.Integrador.repositorios.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/reportes/pedidos")
public class AdminReportesPedidosController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @GetMapping
    public Map<String, Object> reportePedidos() {

        Map<String, Object> r = new HashMap<>();
        List<Pedido> pedidos = pedidoRepository.findAll();

        // TOTAL PEDIDOS
        r.put("totalPedidos", pedidos.size());

        //  ESTADOS
        long pendientes = pedidos.stream()
                .filter(p -> "PENDIENTE".equals(p.getEstado()))
                .count();

        long aprobados = pedidos.stream()
                .filter(p -> "APROBADO".equals(p.getEstado()))
                .count();

        long entregados = pedidos.stream()
                .filter(p -> "ENTREGADO".equals(p.getEstado()))
                .count();

        r.put("pendientes", pendientes);
        r.put("aprobados", aprobados);
        r.put("entregados", entregados);

        // FACTURACION TOTAL
        double totalFacturado = pedidos.stream()
                .filter(p -> "ENTREGADO".equals(p.getEstado()))
                .mapToDouble(Pedido::getTotal)
                .sum();

        r.put("totalFacturado", totalFacturado);

        // PEDIDOS POR MES
        Map<String, Long> pedidosPorMes = pedidos.stream()
                .filter(p -> p.getFechaPedido() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getFechaPedido().getYear() + "-" + p.getFechaPedido().getMonthValue(),
                        Collectors.counting()
                ));

        r.put("pedidosPorMes", pedidosPorMes);

        //  MEJOR MES
        String mejorMes = pedidosPorMes.isEmpty()
                ? "N/A"
                : Collections.max(pedidosPorMes.entrySet(), Map.Entry.comparingByValue()).getKey();

        r.put("mejorMes", mejorMes);

        // TICKET PROMEDIO
        long entregadosCount = entregados;

        double ticketPromedio = entregadosCount == 0
                ? 0
                : totalFacturado / entregadosCount;

        r.put("ticketPromedio", ticketPromedio);

        //  ULTIMO PEDIDO 
        Pedido ultimo = pedidos.stream()
                .filter(p -> p.getFechaPedido() != null)
                .max(Comparator.comparing(Pedido::getFechaPedido))
                .orElse(null);

        if (ultimo != null) {

            List<Map<String, Object>> productos = ultimo.getItems()
                    .stream()
                    .map(i -> {
                        Map<String, Object> mp = new HashMap<>();
                        mp.put("nombre", i.getProducto().getNombre());
                        mp.put("cantidad", i.getCantidad());
                        mp.put("precio", i.getProducto().getPrecio());
                        mp.put("subtotal", i.getCantidad() * i.getProducto().getPrecio());
                        return mp;
                    })
                    .toList();

            Map<String, Object> ultimoPedido = new HashMap<>();
            ultimoPedido.put("id", ultimo.getId());
            ultimoPedido.put("usuario",
                    ultimo.getCliente() != null && ultimo.getCliente().getUsuario() != null
                            ? ultimo.getCliente().getUsuario().getNombres()
                            : "Sin cliente");
            ultimoPedido.put("telefono", ultimo.getTelefono());
            ultimoPedido.put("estado", ultimo.getEstado());
            ultimoPedido.put("total", ultimo.getTotal());
            ultimoPedido.put("fechaPedido", ultimo.getFechaPedido());
            ultimoPedido.put("productos", productos);

            r.put("ultimoPedido", ultimoPedido);
        } else {
            r.put("ultimoPedido", null);
        }

        //  TASA DE ENTREGA
        r.put("tasaEntrega",
                pedidos.isEmpty()
                        ? 0
                        : (double) entregados / pedidos.size() * 100
        );

        return r;
    }
}