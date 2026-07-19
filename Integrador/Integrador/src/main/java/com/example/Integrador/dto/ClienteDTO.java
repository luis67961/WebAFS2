package com.example.Integrador.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.example.Integrador.modelos.Cliente;
import com.example.Integrador.modelos.Pedido;

public class ClienteDTO {

    public String nombreCompleto;
    public String dni;
    public String nivel;
    public LocalDate ultimaCompra;
    public Double totalGastado;
    public int totalCompras;
    public String telefono;
    public Long id;

    public ClienteDTO(Cliente c, List<Pedido> pedidos) {

        if (pedidos == null) {
            pedidos = List.of();
        }

        List<Pedido> entregados = pedidos.stream()
                .filter(p -> "ENTREGADO".equalsIgnoreCase(p.getEstado()))
                .toList();

        String nombres = c.getUsuario() != null ? c.getUsuario().getNombres() : "";
        String apellidos = c.getUsuario() != null ? c.getUsuario().getApellidos() : "";

        this.nombreCompleto = (nombres + " " + apellidos).trim();

        this.dni = c.getDni();
        this.id = c.getId();
        this.telefono = c.getTelefono();

        this.totalGastado = entregados.stream()
                .mapToDouble(Pedido::getTotal)
                .sum();

        this.ultimaCompra = entregados.stream()
                .map(Pedido::getFechaPedido)
                .filter(f -> f != null)
                .max(LocalDateTime::compareTo)
                .map(LocalDateTime::toLocalDate)
                .orElse(null);

        this.totalCompras = entregados.size();

        this.nivel =
                totalCompras >= 10 ? "comprador frecuente"
                : totalCompras >= 4 ? "comprador regular"
                : totalCompras >= 1 ? "primera compra"
                : "sin compras";
    }
}