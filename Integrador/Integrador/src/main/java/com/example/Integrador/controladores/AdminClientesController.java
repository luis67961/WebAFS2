
package com.example.Integrador.controladores;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.Integrador.dto.ClienteDTO;
import com.example.Integrador.servicios.ClienteService;

@RestController
@RequestMapping("/api/reportes/clientes")
public class AdminClientesController {

        @Autowired
        private ClienteService clienteService;

        // REPORTE GERENCIAL CLIENTES
        @GetMapping
        public Map<String, Object> reporteClientes() {

                List<ClienteDTO> clientes = clienteService.listarClientes();

                LocalDate hoy = LocalDate.now();

                int totalClientes = clientes.size();

                // SEGMENTACION
                

                List<ClienteDTO> activos = clientes.stream()
                                .filter(c -> c.ultimaCompra != null)
                                .filter(c -> c.ultimaCompra.isAfter(hoy.minusDays(30)))
                                .toList();

                List<ClienteDTO> inactivos = clientes.stream()
                                .filter(c -> c.ultimaCompra == null ||
                                                c.ultimaCompra.isBefore(hoy.minusDays(60)))
                                .toList();

                List<ClienteDTO> nuevos = clientes.stream()
                                .filter(c -> c.ultimaCompra != null)
                                .filter(c -> c.ultimaCompra.isAfter(hoy.minusDays(30)))
                                .toList();

                
                // TOP CLIENTES
                
                List<ClienteDTO> topClientes = clientes.stream()
                                .sorted(Comparator.comparingDouble(c -> -c.totalGastado))
                                .limit(5)
                                .toList();

                
                // ALERTAS GERENCIALES
                
                List<String> alertas = new ArrayList<>();

                double porcentajeInactivos = totalClientes == 0 ? 0
                                : (inactivos.size() * 100.0 / totalClientes);

                if (porcentajeInactivos > 30) {
                        alertas.add("⚠ Alto nivel de clientes inactivos (" +
                                        String.format("%.1f", porcentajeInactivos) + "%)");
                }

                if (nuevos.size() < 5) {
                        alertas.add("⚠ Baja captación de nuevos clientes este mes");
                }

                if (topClientes.isEmpty()) {
                        alertas.add("⚠ No hay clientes con compras registradas");
                }

                
                // REPORTE FINAL
                
                Map<String, Object> reporte = new HashMap<>();

                reporte.put("totalClientes", totalClientes);
                reporte.put("clientesActivos", activos.size());
                reporte.put("clientesInactivos", inactivos.size());
                reporte.put("clientesNuevos", nuevos.size());

                reporte.put("porcentajeInactivos", porcentajeInactivos);

                reporte.put("topClientes", topClientes);
                reporte.put("alertas", alertas);

                return reporte;
        }

        
        // REPORTE POR FECHAS
        
        @GetMapping("/filtrar")
        public List<ClienteDTO> filtrarClientes(
                        @RequestParam String desde,
                        @RequestParam String hasta) {

                LocalDate fechaDesde = LocalDate.parse(desde);
                LocalDate fechaHasta = LocalDate.parse(hasta);

                return clienteService.listarClientes().stream()
                                .filter(c -> c.ultimaCompra != null)
                                .filter(c -> !c.ultimaCompra.isBefore(fechaDesde)
                                                && !c.ultimaCompra.isAfter(fechaHasta))
                                .toList();
        }
}