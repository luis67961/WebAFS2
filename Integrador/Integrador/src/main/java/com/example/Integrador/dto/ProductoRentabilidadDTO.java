package com.example.Integrador.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductoRentabilidadDTO {

    private Long productoId;
    private String nombre;

    private int kilosVendidos;
    private double ventas;
    private double costoTotal;
    private double utilidad;

    private double margen;
    private double precioPromedio;
    private double costoPromedio;
    private double utilidadPorKilo;

    public ProductoRentabilidadDTO() {
    }

    public ProductoRentabilidadDTO(Long id, String nombre) {
        this.productoId = id;
        this.nombre = nombre;
    }

    public void sumar(int kilos, double ventas, double costo) {
        this.kilosVendidos += kilos;
        this.ventas += ventas;
        this.costoTotal += costo;
    }

    public void calcular() {

        this.utilidad = ventas - costoTotal;

        this.margen = ventas == 0 ? 0 : (utilidad / ventas) * 100;

        this.precioPromedio = kilosVendidos == 0 ? 0 : ventas / kilosVendidos;

        this.costoPromedio = kilosVendidos == 0 ? 0 : costoTotal / kilosVendidos;

        this.utilidadPorKilo = kilosVendidos == 0 ? 0 : utilidad / kilosVendidos;
    }
}