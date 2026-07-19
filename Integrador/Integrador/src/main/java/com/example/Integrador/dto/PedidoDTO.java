package com.example.Integrador.dto;

import com.example.Integrador.modelos.Pedido;

import java.time.LocalDateTime;
import java.util.List;

public class PedidoDTO {

    public Long id;
    public String dni;
    public String telefono;
    public Double total;
    public String estado;
    public String nombreCliente;
    public LocalDateTime fechaPedido;
    public List<ItemPedidoDTO> items;

    public PedidoDTO(Pedido p) {

        this.id = p.getId();
        this.dni = p.getDni();
        this.telefono = p.getTelefono();
        this.total = p.getTotal();
        this.estado = p.getEstado();

        this.fechaPedido = (p.getFechaPedido() != null)
                ? p.getFechaPedido()
                : LocalDateTime.now();

        this.nombreCliente = (p.getCliente() != null && p.getCliente().getUsuario() != null)
                ? p.getCliente().getUsuario().getNombres()
                : "Sin nombre";

        this.items = (p.getItems() != null)
                ? p.getItems().stream().map(ItemPedidoDTO::new).toList()
                : List.of();
    }
}