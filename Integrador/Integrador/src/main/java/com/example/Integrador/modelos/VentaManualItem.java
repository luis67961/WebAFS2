package com.example.Integrador.modelos;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "venta_manual_item")
public class VentaManualItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productoId;
    private String nombreProducto;

    private int kilos;

    private double precio;
    private double subtotal;

    @ManyToOne
    @JoinColumn(name = "venta_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private VentaManual venta;
}