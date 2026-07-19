package com.example.Integrador.controladores;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.Integrador.configuracion.SessionListener;
import com.example.Integrador.modelos.Actividad;
import com.example.Integrador.modelos.Administrador;
import com.example.Integrador.repositorios.ActividadRepository;
import com.example.Integrador.repositorios.AdministradorRepository;
import com.example.Integrador.servicios.EmailService;
import com.example.Integrador.servicios.OTPservice;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/administradores")
public class AdministradorController {

    @Autowired
    private ActividadRepository actividadRepository;
    @Autowired
    private AdministradorRepository repository;
    @Autowired
    EmailService emailService;

    @Autowired
    private OTPservice otpService;

    // LISTAR

    @GetMapping
    public List<Administrador> listar() {
        return repository.findAll();
    }

    // AGREGAR

    @PostMapping
    public String agregar(@RequestBody Administrador admin) {

        if (repository.existsByCorreo(admin.getCorreo())) {
            return "Ya existe un administrador con ese correo.";
        }

        admin.setFechaRegistro(LocalDateTime.now());

        repository.save(admin);
        Actividad actividad = new Actividad();

        actividad.setDescripcion(
                admin.getNombre() + " fue registrado como administrador");

        actividad.setTipo("CREAR");

        actividad.setFecha(LocalDateTime.now());

        actividadRepository.save(actividad);

        return "Administrador registrado correctamente.";
    }

    // ACTUALIZAR

    @PutMapping("/{id}")
    public String actualizar(@PathVariable Long id,
            @RequestBody Administrador datos) {

        Administrador admin = repository.findById(id)
                .orElse(null);

        if (admin == null) {
            return "Administrador no encontrado.";
        }

        admin.setNombre(datos.getNombre());
        admin.setCorreo(datos.getCorreo());
        admin.setPassword(datos.getPassword());

        repository.save(admin);

        Actividad actividad = new Actividad();

        actividad.setDescripcion(
                admin.getNombre() + " actualizó un administrador");

        actividad.setTipo("ACTUALIZAR");

        actividad.setFecha(LocalDateTime.now());

        actividadRepository.save(actividad);

        return "Administrador actualizado.";
    }

    // ELIMINAR

    @DeleteMapping("/{id}")
    public String eliminar(@PathVariable Long id) {

        Administrador admin = repository.findById(id)
                .orElse(null);

        if (admin == null) {
            return "Administrador no encontrado.";
        }

        Actividad actividad = new Actividad();

        actividad.setDescripcion(
                admin.getNombre() + " eliminó un administrador");

        actividad.setTipo("ELIMINAR");

        actividad.setFecha(LocalDateTime.now());

        actividadRepository.save(actividad);

        repository.delete(admin);

        return "Administrador eliminado.";
    }

    // BUSCAR

    @GetMapping("/buscar")
    public List<Administrador> buscar(@RequestParam String texto) {

        return repository
                .findByNombreContainingIgnoreCaseOrCorreoContainingIgnoreCase(
                        texto,
                        texto);
    }

    @PostMapping("/enviar-otp")
    public String enviarOTP(@RequestBody Map<String, String> datos) {

        String correo = datos.get("correo");

        Administrador admin = repository.findByCorreo(correo);

        if (admin == null) {

            return "No existe un administrador con ese correo.";

        }

        String codigo = otpService.generateCode(correo);

        emailService.enviarOTP(correo, codigo);

        return "Código OTP enviado al correo.";

    }

    @PostMapping("/eliminar-confirmado")
    public String eliminarConfirmado(
            @RequestBody Map<String, String> datos) {

        String correo = datos.get("correo");
        String otp = datos.get("otp");

        if (correo == null || otp == null ||
                correo.isBlank() || otp.isBlank()) {

            return "Correo y código OTP son obligatorios.";

        }

        correo = correo.trim().toLowerCase();

        Administrador admin = repository.findByCorreo(correo);

        if (admin == null) {

            return "Administrador no encontrado.";

        }

        if (!otpService.validateCode(correo, otp)) {

            return "Código OTP incorrecto.";

        }

        // Registrar actividad antes de eliminar
        Actividad actividad = new Actividad();

        actividad.setDescripcion(
                admin.getNombre() + " eliminó un administrador");

        actividad.setTipo("ELIMINAR");

        actividad.setFecha(LocalDateTime.now());

        actividadRepository.save(actividad);

        // Eliminar administrador
        repository.delete(admin);

        otpService.removeCode(correo);

        return "Administrador eliminado correctamente.";

    }

    @GetMapping("/admin")
    public String admin(HttpSession session) {

        String role = (String) session.getAttribute("role");

        if (role == null || !role.equals("ADMIN")) {

            return "redirect:/login";

        }

        return "admin";

    }

    @GetMapping("/historial")
    public List<Actividad> historial() {

        return actividadRepository.findAllByOrderByFechaDesc();

    }

    @GetMapping("/conectados")
    public List<Map<String, Object>> administradoresEstado() {

        List<Administrador> admins = repository.findAll();

        return admins.stream().map(admin -> {

            Map<String, Object> datos = new HashMap<>();

            datos.put(
                    "nombre",
                    admin.getNombre());

            datos.put(
                    "correo",
                    admin.getCorreo());

            boolean online = SessionListener
                    .getUsuariosOnline()
                    .contains(
                            admin.getCorreo().trim().toLowerCase());

            datos.put(
                    "estado",
                    online ? "ONLINE" : "OFFLINE");

            return datos;

        }).toList();

    }
}