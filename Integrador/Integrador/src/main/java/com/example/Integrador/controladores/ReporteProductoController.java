package com.example.Integrador.controladores;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.Integrador.modelos.Producto;
import com.example.Integrador.servicios.ProductoService;

@RestController
@RequestMapping("/api/reportes/productos")
@CrossOrigin(origins = "*")
public class ReporteProductoController {

    @Autowired
    private ProductoService productoService;

    
    //  INVENTARIO GENERAL
    
    @GetMapping("/inventario-general")
    public Map<String, Object> inventarioGeneral() {

        List<Producto> productos = productoService.listarTodos();

        int totalProductos = productos.size();
        int stockTotal = productos.stream()
                .mapToInt(Producto::getStock)
                .sum();

        double valorInventario = productos.stream()
                .mapToDouble(p -> p.getStock() * p.getPrecio())
                .sum();

        Map<String, Object> response = new HashMap<>();
        response.put("totalProductos", totalProductos);
        response.put("stockTotal", stockTotal);
        response.put("valorInventario", valorInventario);

        return response;
    }

    
    //  PRODUCTOS CON STOCK CRÍTICO
    
    @GetMapping("/stock-critico")
    public List<Producto> stockCritico(@RequestParam(defaultValue = "5") int limite) {

        return productoService.listarTodos()
                .stream()
                .filter(p -> p.getStock() <= limite)
                .collect(Collectors.toList());
    }

    // 3. PRODUCTOS + CAROS
    @GetMapping("/top-precio")
    public List<Producto> topPorPrecio(@RequestParam(defaultValue = "5") int top) {

        return productoService.listarTodos()
                .stream()
                .sorted((a, b) -> Double.compare(b.getPrecio(), a.getPrecio()))
                .limit(top)
                .collect(Collectors.toList());
    }

    //  PRODUCTOS POR CATEGORÍA
    
    @GetMapping("/por-categoria")
    public Map<String, List<Producto>> productosPorCategoria() {

        return productoService.listarTodos()
                .stream()
                .collect(Collectors.groupingBy(Producto::getCategoria));
    }

    
    // VALOR DE INVENTARIO POR CATEGORÍA
    
    @GetMapping("/valor-por-categoria")
    public Map<String, Double> valorPorCategoria() {

        return productoService.listarTodos()
                .stream()
                .collect(Collectors.groupingBy(
                        Producto::getCategoria,
                        Collectors.summingDouble(p -> p.getStock() * p.getPrecio())
                ));
    }

    
    // PRODUCTOS SIN STOCK
    
    @GetMapping("/agotados")
    public List<Producto> productosAgotados() {

        return productoService.listarTodos()
                .stream()
                .filter(p -> p.getStock() == 0)
                .collect(Collectors.toList());
    }

    
    // MARGEN BRUTO POR PRODUCTO
    
    @GetMapping("/margen-ganancia")
    public List<Map<String, Object>> margenGanancia() {

        return productoService.listarTodos()
                .stream()
                .map(p -> {
                    Map<String, Object> data = new HashMap<>();

                    double ganancia = p.getPrecio() - p.getCostoProduccion();
                    double margen = (ganancia / p.getPrecio()) * 100;

                    data.put("id", p.getId());
                    data.put("nombre", p.getNombre());
                    data.put("precio", p.getPrecio());
                    data.put("costoProduccion", p.getCostoProduccion());
                    data.put("gananciaUnitaria", ganancia);
                    data.put("margenPorcentaje", margen);

                    return data;
                })
                .collect(Collectors.toList());
    }

    
    //  RESUMEN EJECUTIVO (DASHBOARD)
    
    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {

        List<Producto> productos = productoService.listarTodos();

        Map<String, Object> dashboard = new HashMap<>();

        dashboard.put("totalProductos", productos.size());

        dashboard.put("productosAgotados",
                productos.stream().filter(p -> p.getStock() == 0).count());

        dashboard.put("stockCritico",
                productos.stream().filter(p -> p.getStock() > 0 && p.getStock() <= 5).count());

        dashboard.put("valorTotalInventario",
                productos.stream()
                        .mapToDouble(p -> p.getStock() * p.getPrecio())
                        .sum());

        dashboard.put("categoriaMasFrecuente",
                productos.stream()
                        .collect(Collectors.groupingBy(Producto::getCategoria, Collectors.counting()))
                        .entrySet()
                        .stream()
                        .max(Map.Entry.comparingByValue())
                        .map(Map.Entry::getKey)
                        .orElse("Sin datos"));

        return dashboard;
    }
}