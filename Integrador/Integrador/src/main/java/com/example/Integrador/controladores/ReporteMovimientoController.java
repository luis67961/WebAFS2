package com.example.Integrador.controladores;

import com.example.Integrador.modelos.Movimiento;
import com.example.Integrador.servicios.MovimientoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reportes/movimientos")
@CrossOrigin("*")
public class ReporteMovimientoController {

    @Autowired
    private MovimientoService service;

    // TOTAL GENERAL

    @GetMapping("/resumen-general")
    public Map<String, Object> resumenGeneral() {

        List<Movimiento> lista = service.listar(null);

        BigDecimal totalIngresos = lista.stream()
                .filter(m -> "COBRO".equalsIgnoreCase(m.getTipo()))
                .map(Movimiento::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalEgresos = lista.stream()
                .filter(m -> "EGRESO".equalsIgnoreCase(m.getTipo())
                        || "PAGO".equalsIgnoreCase(m.getTipo()))
                .map(Movimiento::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balance = totalIngresos.subtract(totalEgresos);

        Map<String, Object> res = new HashMap<>();
        res.put("totalIngresos", totalIngresos);
        res.put("totalEgresos", totalEgresos);
        res.put("balance", balance);
        res.put("cantidadMovimientos", lista.size());

        return res;
    }

    // RESUMEN POR TIPO

    @GetMapping("/por-tipo")
    public Map<String, BigDecimal> porTipo() {

        List<Movimiento> lista = service.listar(null);

        return lista.stream()
                .collect(Collectors.groupingBy(
                        m -> m.getTipo() == null ? "SIN_TIPO" : m.getTipo(),
                        Collectors.mapping(
                                Movimiento::getMonto,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));
    }

    // RESUMEN POR ESTADO

    @GetMapping("/por-estado")
    public Map<String, Long> porEstado() {

        List<Movimiento> lista = service.listar(null);

        return lista.stream()
                .collect(Collectors.groupingBy(
                        m -> m.getEstado() == null ? "SIN_ESTADO" : m.getEstado(),
                        Collectors.counting()));
    }

    // TOP DESTINOS / PROVEEDORES

    @GetMapping("/top-destinos")
    public Map<String, BigDecimal> topDestinos() {

        List<Movimiento> lista = service.listar(null);

        return lista.stream()
                .collect(Collectors.groupingBy(
                        m -> m.getDestino() == null ? "SIN_DESTINO" : m.getDestino(),
                        Collectors.mapping(
                                Movimiento::getMonto,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))))
                .entrySet()
                .stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(5)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (a, b) -> a,
                        LinkedHashMap::new));
    }

    // MOVIMIENTOS POR FECHA

    @GetMapping("/rango-fechas")
    public List<Movimiento> porRangoFechas(
            @RequestParam LocalDate inicio,
            @RequestParam LocalDate fin) {

        return service.listar(null).stream()
                .filter(m -> m.getFecha() != null)
                .filter(m -> !m.getFecha().isBefore(inicio)
                        && !m.getFecha().isAfter(fin))
                .toList();
    }

    // INGRESOS VS EGRESOS

    @GetMapping("/flujo-diario")
    public Map<String, Map<String, BigDecimal>> flujoDiario() {

        List<Movimiento> lista = service.listar(null);

        Map<String, Map<String, BigDecimal>> resultado = new TreeMap<>();

        for (Movimiento m : lista) {

            if (m.getFecha() == null)
                continue;

            String fecha = m.getFecha().toString();

            resultado.putIfAbsent(fecha, new HashMap<>());
            Map<String, BigDecimal> dia = resultado.get(fecha);

            if ("COBRO".equalsIgnoreCase(m.getTipo())) {

                dia.put("ingresos",
                        dia.getOrDefault("ingresos", BigDecimal.ZERO)
                                .add(m.getMonto()));

            } else {

                dia.put("egresos",
                        dia.getOrDefault("egresos", BigDecimal.ZERO)
                                .add(m.getMonto()));
            }
        }

        return resultado;
    }

    @GetMapping("/flujo-neto")
    public BigDecimal flujoNeto() {

        List<Movimiento> lista = service.listar(null);

        BigDecimal ingresos = lista.stream()
                .filter(m -> "COBRO".equalsIgnoreCase(m.getTipo()))
                .map(Movimiento::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal egresos = lista.stream()
                .filter(m -> "EGRESO".equalsIgnoreCase(m.getTipo())
                        || "PAGO".equalsIgnoreCase(m.getTipo()))
                .map(Movimiento::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ingresos.subtract(egresos);
    }

    @GetMapping("/promedio-movimiento")
    public BigDecimal promedioMovimiento() {

        List<Movimiento> lista = service.listar(null);

        if (lista.isEmpty())
            return BigDecimal.ZERO;

        BigDecimal total = lista.stream()
                .map(Movimiento::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return total.divide(BigDecimal.valueOf(lista.size()), 2, BigDecimal.ROUND_HALF_UP);
    }

    @GetMapping("/distribucion-tipos")
    public Map<String, BigDecimal> distribucionTipos() {

        List<Movimiento> lista = service.listar(null);

        BigDecimal total = lista.stream()
                .map(Movimiento::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> res = new HashMap<>();

        res.put("COBRO", totalPorTipo(lista, "COBRO", total));
        res.put("PAGO", totalPorTipo(lista, "PAGO", total));
        res.put("EGRESO", totalPorTipo(lista, "EGRESO", total));

        return res;
    }

    private BigDecimal totalPorTipo(List<Movimiento> lista, String tipo, BigDecimal total) {

        BigDecimal suma = lista.stream()
                .filter(m -> tipo.equalsIgnoreCase(m.getTipo()))
                .map(Movimiento::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (total.compareTo(BigDecimal.ZERO) == 0)
            return BigDecimal.ZERO;

        return suma.multiply(BigDecimal.valueOf(100))
                .divide(total, 2, BigDecimal.ROUND_HALF_UP);
    }

    @GetMapping("/pendientes")
    public List<Movimiento> pendientes() {

        return service.listar(null).stream()
                .filter(m -> "PENDIENTE".equalsIgnoreCase(m.getEstado()))
                .toList();
    }

    @GetMapping("/por-mes")
    public Map<String, BigDecimal> porMes() {

        List<Movimiento> lista = service.listar(null);

        return lista.stream()
                .filter(m -> m.getFecha() != null)
                .collect(Collectors.groupingBy(
                        m -> m.getFecha().getYear() + "-" + m.getFecha().getMonthValue(),
                        Collectors.mapping(
                                Movimiento::getMonto,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));
    }

    @GetMapping("/top-egresos")
    public List<Movimiento> topEgresos() {

        return service.listar(null).stream()
                .filter(m -> "EGRESO".equalsIgnoreCase(m.getTipo())
                        || "PAGO".equalsIgnoreCase(m.getTipo()))
                .sorted((a, b) -> b.getMonto().compareTo(a.getMonto()))
                .limit(5)
                .toList();
    }
}