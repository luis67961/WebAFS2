package com.example.Integrador.controladores;






/*  NO SIRVEEEEEEEEEEEEEEEEEEEEEEEEE
import com.example.Integrador.modelos.Notificacion;
import com.example.Integrador.modelos.Usuario;
import com.example.Integrador.repositorios.NotificacionRepository;
import com.example.Integrador.repositorios.UsuarioRepository;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/notificaciones")
@CrossOrigin(origins = "*")
public class NotificacionUsuarioController {

    @Autowired
    private NotificacionRepository notificacionRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // =========================
    // OBTENER NOTIFICACIONES
    // =========================
  @GetMapping("/api/notificaciones/me")
@ResponseBody
public List<Notificacion> misNotificaciones(HttpSession session) {

    Usuario usuario = (Usuario) session.getAttribute("usuario");

    if (usuario == null) {
        return List.of(); // o error
    }

    return notificacionRepository.findByUsuarioId(usuario.getId());
}
    // =========================
    // CONTAR NO LEÍDAS
    // =========================
    @GetMapping("/no-leidas")
    public Map<String, Object> contarNoLeidas(HttpSession session) {

        Usuario u = (Usuario) session.getAttribute("usuario");

        if (u == null) {
            return Map.of("total", 0);
        }

        long total = notificacionRepository.countByUsuarioAndLeidaFalse(u);

        return Map.of("total", total);
    }

    // =========================
    // MARCAR UNA COMO LEÍDA
    // =========================
    @PutMapping("/leer/{id}")
    public Map<String, Object> marcarLeida(@PathVariable Long id, HttpSession session) {

        Usuario u = (Usuario) session.getAttribute("usuario");

        if (u == null) {
            return Map.of("ok", false, "error", "NO_SESSION");
        }

        Optional<Notificacion> notif = notificacionRepository.findById(id);

        if (notif.isEmpty()) {
            return Map.of("ok", false, "error", "NOT_FOUND");
        }

        Notificacion n = notif.get();

        // seguridad: solo su dueño puede marcarla
        if (!n.getUsuario().getId().equals(u.getId())) {
            return Map.of("ok", false, "error", "NO_AUTORIZADO");
        }

        n.setLeida(true);
        notificacionRepository.save(n);

        return Map.of("ok", true);
    }

    // =========================
    // ELIMINAR NOTIFICACIÓN
    // =========================
    @DeleteMapping("/{id}")
    public Map<String, Object> eliminar(@PathVariable Long id, HttpSession session) {

        Usuario u = (Usuario) session.getAttribute("usuario");

        if (u == null) {
            return Map.of("ok", false, "error", "NO_SESSION");
        }

        Optional<Notificacion> notif = notificacionRepository.findById(id);

        if (notif.isEmpty()) {
            return Map.of("ok", false, "error", "NOT_FOUND");
        }

        Notificacion n = notif.get();

        // seguridad básica
        if (!n.getUsuario().getId().equals(u.getId())) {
            return Map.of("ok", false, "error", "NO_AUTORIZADO");
        }

        notificacionRepository.delete(n);

        return Map.of("ok", true);
    }

    // =========================
    // ÚLTIMAS 10
    // =========================
    @GetMapping("/ultimas")
    public List<Notificacion> ultimas(HttpSession session) {

        Usuario u = (Usuario) session.getAttribute("usuario");

        if (u == null) {
            return new ArrayList<>();
        }

        return notificacionRepository.findByUsuarioOrderByFechaCreacionDesc(u)
                .stream()
                .limit(10)
                .toList();
    }
}*/