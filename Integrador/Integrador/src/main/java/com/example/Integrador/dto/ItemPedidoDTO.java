package com.example.Integrador.dto;

import com.example.Integrador.modelos.ItemPedido;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemPedidoDTO {

    private String producto;
    private int cantidad;
    private double precioUnitario;
    private double subtotal;

    public ItemPedidoDTO() {
    }

    public ItemPedidoDTO(ItemPedido i) {
        this.producto = i.getProducto().getNombre();
        this.cantidad = i.getCantidad();
        this.precioUnitario = i.getPrecioUnitario();
        this.subtotal = i.getCantidad() * i.getPrecioUnitario();
    }

   
}