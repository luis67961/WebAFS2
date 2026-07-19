package com.example.Integrador.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RentabilidadDashboardDTO {

    private double totalVentas;
    private double totalCosto;
    private double utilidadTotal;
    private double margenTotal;

    private int kilosVendidos;
    private int cantidadVentas;

    private List<ProductoRentabilidadDTO> productos;

    private ProductoRentabilidadDTO mejorProducto;
    private ProductoRentabilidadDTO peorProducto;

    private List<String> alertas;
}