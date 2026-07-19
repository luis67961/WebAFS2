package com.example.Integrador.configuracion;

import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.sql.Connection;

@RestController
@RequestMapping("/db")
public class Conexion {

    //LINK:   http://localhost:8080/db/check
    private final DataSource dataSource;

    public Conexion(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/check")
    public String verificarConexion() {
        try (Connection conn = dataSource.getConnection()) {
            return "CONEXIÓN EXITOSA A: " + conn.getCatalog();
        } catch (Exception e) {
            return "ERROR DE CONEXIÓN: " + e.getMessage();
        }
    }
}