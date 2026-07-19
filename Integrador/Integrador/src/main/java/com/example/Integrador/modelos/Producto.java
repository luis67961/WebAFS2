package com.example.Integrador.modelos;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    @Column(nullable = false)
    private Double precio;

    @Column(nullable = false)
    private Integer stock;

    @Column(length = 500)
    private String imagen;

    //SI ALGO FALLA BORRAR:
    @Column(nullable = true)
    private Double costoProduccion;



    
    @Column(nullable = false, length = 50)
    private String categoria;

    @Column(length = 50)
    private String peso;

    @Column(length = 20)
    private String proteina;
}