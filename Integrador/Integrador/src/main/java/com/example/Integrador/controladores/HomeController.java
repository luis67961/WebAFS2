package com.example.Integrador.controladores;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import com.example.Integrador.modelos.Usuario;
import org.springframework.ui.Model;

import jakarta.servlet.http.HttpSession;



@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "index";
    }

    @GetMapping("/login")
    public String adminLogin() {
        return "login";
    }

    @GetMapping("/tienda")
    public String tienda() {
        return "tienda";
    }


    @GetMapping("/miCuenta")
    public String miCuenta(HttpSession session, Model model) {

        Usuario usuario = (Usuario) session.getAttribute("usuario");

        model.addAttribute("usuario", usuario);

        return "miCuenta";
    }

}