package com.example.Integrador.controladores;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Integrador.configuracion.SessionListener;
import com.example.Integrador.modelos.Administrador;
import com.example.Integrador.repositorios.AdministradorRepository;
import com.example.Integrador.servicios.EmailService;
import com.example.Integrador.servicios.OTPservice;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AutenticacionController {

        @Autowired
        private AdministradorRepository administradorRepository;
        @Autowired
        private OTPservice otpService;

        @Autowired
        private EmailService emailService;

        private String normalizeEmail(String email) {
                return email == null ? "" : email.trim().toLowerCase();
        }

        @PostMapping("/send-code")
        public ResponseEntity<?> sendCode(
                        @RequestBody Map<String, String> body) {

                String email = normalizeEmail(body.get("email"));

                if (email.isBlank()) {

                        return ResponseEntity.badRequest().body(
                                        Map.of(
                                                        "ok", false,
                                                        "message", "Correo requerido"));

                }

                Administrador admin = administradorRepository.findByCorreo(email);

                if (admin == null) {

                        return ResponseEntity.status(403).body(
                                        Map.of(
                                                        "ok", false,
                                                        "message", "Administrador no encontrado"));

                }

                String code = otpService.generateCode(email);

                emailService.sendCode(email, code);

                return ResponseEntity.ok(
                                Map.of(
                                                "ok", true,
                                                "message", "Código enviado al correo registrado"));

        }

        @PostMapping("/verify-admin")
        public ResponseEntity<?> verify(
                        @RequestBody Map<String, String> body,
                        HttpSession session) {

                String email = normalizeEmail(body.get("email"));

                String pass = body.get("password");

                String code = body.get("code");

                Administrador admin = administradorRepository.findByCorreo(email);

                if (admin == null) {

                        return ResponseEntity.ok(
                                        Map.of(
                                                        "ok", false,
                                                        "message", "Administrador no encontrado"));

                }

                // VALIDAR CONTRASEÑA REGISTRADA

                if (!admin.getPassword().equals(pass)) {

                        return ResponseEntity.ok(
                                        Map.of(
                                                        "ok", false,
                                                        "message", "Contraseña incorrecta"));

                }

                // VALIDAR OTP

                if (!otpService.validateCode(email, code)) {

                        return ResponseEntity.ok(
                                        Map.of(
                                                        "ok", false,
                                                        "message", "Código OTP incorrecto"));

                }

                session.setAttribute("user", admin.getCorreo());

                session.setAttribute("nombre", admin.getNombre());

                session.setAttribute("role", "ADMIN");

                // Registrar administrador conectado
                SessionListener.agregarUsuario(
                                admin.getCorreo());

                return ResponseEntity.ok(
                                Map.of(
                                                "ok", true,
                                                "message", "Bienvenido administrador"));

        }

        // CERRAR SESION

        @PostMapping("/logout")
        public ResponseEntity<?> cerrarSesion(HttpSession session) {

                String correo = (String) session.getAttribute("user");

                if (correo != null) {

                        SessionListener.quitarUsuario(correo);

                }

                session.invalidate();

                return ResponseEntity.ok(
                                Map.of(
                                                "ok", true,
                                                "message", "Sesión cerrada correctamente"));

        }

        @GetMapping("/usuario")
        public ResponseEntity<?> obtenerUsuario(HttpSession session) {

                String nombre = (String) session.getAttribute("nombre");

                String correo = (String) session.getAttribute("user");

                if (nombre == null || correo == null) {

                        return ResponseEntity.status(401).body(
                                        Map.of(
                                                        "ok", false,
                                                        "message", "Sesión no iniciada"));

                }

                return ResponseEntity.ok(
                                Map.of(
                                                "ok", true,
                                                "nombre", nombre,
                                                "correo", correo));

        }
}