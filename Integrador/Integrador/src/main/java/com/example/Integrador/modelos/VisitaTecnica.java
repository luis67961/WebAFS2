package com.example.Integrador.modelos;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "visitas_tecnicas")
@Getter
@Setter
public class VisitaTecnica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String especialista;

    private String usuario;

    private String usuarioTelefono;

    private LocalDateTime fechaSolicitud;

    private LocalDateTime fechaProgramada;

    private String direccion;
    
    @Column(columnDefinition = "TEXT")
    private String motivo;

    private String estado;

    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}