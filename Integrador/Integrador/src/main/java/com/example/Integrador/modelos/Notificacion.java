package com.example.Integrador.modelos;


/* 
@Getter
@Setter
@Entity
@Table(name = "notificaciones")
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==============================
    // RELACIÓN CON USUARIO
    // ==============================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // ==============================
    // CONTENIDO DE LA NOTIFICACIÓN
    // ==============================
    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(nullable = false, length = 500)
    private String mensaje;

    @Column(nullable = false, length = 50)
    private String tipo;

    // ==============================
    // ESTADO
    // ==============================
    @Column(nullable = false)
    private Boolean leida = false;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;
NO SIRVEEE
    // ==============================
    // ORIGEN DE LA NOTIFICACIÓN
    // (solo uno puede ser usado según el caso)
    // ==============================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visita_id")
    private VisitaTecnica visita;

    // ==============================
    // AUTO FECHA (BUENA PRÁCTICA)
    // ==============================
    @PrePersist
    public void prePersist() {
        this.fechaCreacion = LocalDateTime.now();
        if (this.leida == null) {
            this.leida = false;
        }
    }
}*/