package com.example.Integrador.controladores;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.Integrador.dto.ProductoRentabilidadDTO;
import com.example.Integrador.dto.RentabilidadDashboardDTO;
import com.example.Integrador.dto.SimulacionDTO;
import com.example.Integrador.modelos.*;
import com.example.Integrador.repositorios.*;

@RestController
@RequestMapping("/admin/rentabilidad")
public class AdminRentabilidadController {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private VentaManualRepository ventaManualRepository;

    // COSTO REAL
  
    private Double obtenerCostoUnitario(Producto prod) {
        return prod.getCostoProduccion(); 
    }

    @GetMapping("/dashboard")
    public RentabilidadDashboardDTO dashboard() {

        List<Pedido> pedidos = pedidoRepository.findAll();
        List<VentaManual> ventas = ventaManualRepository.findAll();

        Map<Long, ProductoRentabilidadDTO> mapa = new HashMap<>();

        double totalVentas = 0;
        double totalCosto = 0;
        int totalKilos = 0;
        int totalVentasCount = 0;

        List<String> alertas = new ArrayList<>();

        //  PEDIDOS WEB
        for (Pedido p : pedidos) {

            if (!"ENTREGADO".equals(p.getEstado()))
                continue;

            totalVentasCount++;

            for (ItemPedido item : p.getItems()) {

                Producto prod = item.getProducto();

                double venta = item.getCantidad() * item.getPrecioUnitario();

                Double costoUnitario = obtenerCostoUnitario(prod);

                if (costoUnitario == null) {
                    alertas.add("⚠ Producto sin costo definido: " + prod.getNombre());
                    continue;
                }

                double costoTotal = item.getCantidad() * costoUnitario;

                totalVentas += venta;
                totalCosto += costoTotal;
                totalKilos += item.getCantidad();

                mapa.computeIfAbsent(prod.getId(),
                        k -> new ProductoRentabilidadDTO(prod.getId(), prod.getNombre()))
                        .sumar(item.getCantidad(), venta, costoTotal);
            }
        }

        // VENTAS MANUALES
        for (VentaManual v : ventas) {

            totalVentasCount++;

            for (VentaManualItem item : v.getItems()) {

                Producto prod = productoRepository.findById(item.getProductoId()).orElse(null);
                if (prod == null) continue;

                double venta = item.getSubtotal();

                Double costoUnitario = obtenerCostoUnitario(prod);

                if (costoUnitario == null) {
                    alertas.add("⚠ Producto sin costo definido: " + prod.getNombre());
                    continue;
                }

                double costoTotal = item.getKilos() * costoUnitario;

                totalVentas += venta;
                totalCosto += costoTotal;
                totalKilos += item.getKilos();

                mapa.computeIfAbsent(prod.getId(),
                        k -> new ProductoRentabilidadDTO(prod.getId(), prod.getNombre()))
                        .sumar(item.getKilos(), venta, costoTotal);
            }
        }

        //  LISTA PRODUCTOS
        
        List<ProductoRentabilidadDTO> productos = new ArrayList<>(mapa.values());

        for (ProductoRentabilidadDTO p : productos) {
            p.calcular();
        }

        //  ORDENAMIENTO
        productos.sort(Comparator.comparingDouble(ProductoRentabilidadDTO::getUtilidad).reversed());

        ProductoRentabilidadDTO mejor = productos.isEmpty() ? null : productos.get(0);
        ProductoRentabilidadDTO peor = productos.isEmpty() ? null : productos.get(productos.size() - 1);

        
        // ALERTAS DE RENTABILIDAD
    
        for (ProductoRentabilidadDTO p : productos) {

            double margen = p.getMargen();
            double utilidad = p.getUtilidad();

            if (margen >= 30) {
                alertas.add("🟢 Excelente margen en " + p.getNombre()
                        + " (" + String.format("%.2f", margen) + "%)");

            } else if (margen >= 10) {
                alertas.add("🟡 Margen aceptable en " + p.getNombre()
                        + " (" + String.format("%.2f", margen) + "%)");

            } else {
                alertas.add("🟠 Bajo margen en " + p.getNombre()
                        + " (" + String.format("%.2f", margen) + "%)");
            }

            if (utilidad < 0) {
                alertas.add("🔴 PÉRDIDA: " + p.getNombre()
                        + " (S/ " + String.format("%.2f", utilidad) + ")");
            }
        }

        
        //  RESPUESTA FINAL
        
        RentabilidadDashboardDTO dto = new RentabilidadDashboardDTO();

        dto.setTotalVentas(totalVentas);
        dto.setTotalCosto(totalCosto);
        dto.setUtilidadTotal(totalVentas - totalCosto);

        dto.setMargenTotal(
                totalVentas == 0 ? 0 : ((totalVentas - totalCosto) / totalVentas) * 100);

        dto.setKilosVendidos(totalKilos);
        dto.setCantidadVentas(totalVentasCount);

        dto.setProductos(productos);
        dto.setMejorProducto(mejor);
        dto.setPeorProducto(peor);
        dto.setAlertas(alertas);

        return dto;
    }

    @PostMapping("/simular")
    public RentabilidadDashboardDTO simular(@RequestBody SimulacionDTO dto) {

        List<Pedido> pedidos = pedidoRepository.findAll();
        List<VentaManual> ventas = ventaManualRepository.findAll();

        Map<Long, ProductoRentabilidadDTO> mapa = new HashMap<>();

        double totalVentas = 0;
        double totalCosto = 0;
        int totalKilos = 0;
        int totalVentasCount = 0;

        for (Pedido p : pedidos) {

            if (!"ENTREGADO".equals(p.getEstado()))
                continue;

            for (ItemPedido item : p.getItems()) {

                Producto prod = item.getProducto();

                double venta = item.getCantidad() * item.getPrecioUnitario();

                double costoUnitario = item.getPrecioUnitario();

                if (prod.getId().equals(dto.getProductoId())) {
                    costoUnitario = dto.getCostoPorKilo();
                } else {
                    costoUnitario = item.getPrecioUnitario() * 0.75;
                }

                double costo = item.getCantidad() * costoUnitario;

                totalVentas += venta;
                totalCosto += costo;
                totalKilos += item.getCantidad();

                mapa.computeIfAbsent(prod.getId(),
                        k -> new ProductoRentabilidadDTO(prod.getId(), prod.getNombre()))
                        .sumar(item.getCantidad(), venta, costo);
            }
        }

        List<ProductoRentabilidadDTO> productos = new ArrayList<>(mapa.values());
        for (ProductoRentabilidadDTO p : productos)
            p.calcular();

        RentabilidadDashboardDTO dtoRes = new RentabilidadDashboardDTO();
        dtoRes.setTotalVentas(totalVentas);
        dtoRes.setTotalCosto(totalCosto);
        dtoRes.setUtilidadTotal(totalVentas - totalCosto);
        dtoRes.setMargenTotal(totalVentas == 0 ? 0 : ((totalVentas - totalCosto) / totalVentas) * 100);
        dtoRes.setKilosVendidos(totalKilos);
        dtoRes.setCantidadVentas(totalVentasCount);
        dtoRes.setProductos(productos);

        return dtoRes;
    }
}