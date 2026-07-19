package com.example.Integrador.controladores;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdminController {

    @GetMapping("/admin")
    public String adminHome() {
        return "admin";
    }

    @GetMapping("/pedidosAdmin")
    public String verPedidos() {
        return "pedidosAdmin";
    }

    @GetMapping("/productos")
    public String verproductos() {
        return "productos";
    }

    @GetMapping("/clientes")
    public String verclientes() {
        return "clientes";
    }

    @GetMapping("/visitaTecnica")
    public String visitaTecnica() {
        return "visitaTecnica";
    }

    @GetMapping("/reportes")
    public String VerReportes() {
        return "reportes";
    }

    @GetMapping("/pagos")
    public String verPagos() {
        return "pagos";
    }

    @GetMapping("/Accesos")
    public String Accesos() {
        return "Accesos";
    }

    @GetMapping("/ConsultasAdmin")
    public String ConsultasAdmin() {
        return "ConsultasAdmin";
    }
}