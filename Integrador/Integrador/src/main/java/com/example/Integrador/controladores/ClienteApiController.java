package com.example.Integrador.controladores;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.Integrador.dto.ClienteDTO;
import com.example.Integrador.servicios.ClienteService;

@RestController
@RequestMapping("/api/clientes")
public class ClienteApiController {

    @Autowired
    private ClienteService clienteService;

    @GetMapping
    public List<ClienteDTO> listarClientes() {
        return clienteService.listarClientes();
    }

  @GetMapping("/buscar")
public List<ClienteDTO> buscarClientes(
        @RequestParam(required = false) String desde,
        @RequestParam(required = false) String hasta
) {

    
    if (desde == null || hasta == null) {
        throw new IllegalArgumentException("Debes enviar ambas fechas: desde y hasta");
    }

    LocalDate fechaDesde = LocalDate.parse(desde);
    LocalDate fechaHasta = LocalDate.parse(hasta);

    List<ClienteDTO> clientes = clienteService.listarClientes();

    return clientes.stream()
            .filter(c -> c.ultimaCompra != null)
            .filter(c -> {
                LocalDate fecha = c.ultimaCompra;

                return !fecha.isBefore(fechaDesde) &&
                       !fecha.isAfter(fechaHasta);
            })
            .toList();
}
}