package com.example.Integrador.modelos;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "ventas_manuales")
public class VentaManual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String dni;

    @Column(name = "nombre_cliente")
    private String nombreCliente;

    private LocalDateTime fecha;

    private Double total;

    private String estado;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
private List<VentaManualItem> items = new ArrayList<>();
}