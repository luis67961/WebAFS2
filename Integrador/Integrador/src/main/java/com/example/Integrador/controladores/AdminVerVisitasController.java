package com.example.Integrador.controladores;

import com.example.Integrador.modelos.EventoVisita;
import com.example.Integrador.modelos.Usuario;
import com.example.Integrador.repositorios.EventoVisitaRepository;
import com.example.Integrador.repositorios.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/analytics")
public class AdminVerVisitasController {

    @Autowired
    private EventoVisitaRepository eventoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // TOTAL VISITAS

    @GetMapping("/total-visitas")
    public long totalVisitas() {
        return eventoRepository.count();
    }

    // REGISTRAR VISITA

    @PostMapping("/registrar")
    public void registrarVisita(@RequestBody Map<String, String> body) {

        EventoVisita ev = new EventoVisita();

        ev.setPagina(body.get("pagina"));
        ev.setSesionId(body.get("sesionId"));
        ev.setFecha(LocalDateTime.now());

        String usuarioId = body.get("usuarioId");

        if (usuarioId != null &&
                !usuarioId.isBlank() &&
                !usuarioId.equals("null") &&
                !usuarioId.equals("undefined")) {

            usuarioRepository.findById(Long.parseLong(usuarioId))
                    .ifPresent(ev::setUsuario);

        } else {
            ev.setUsuario(null);
        }

        eventoRepository.save(ev);
    }

    // USUARIOS ACTIVOS

    @GetMapping("/activos")
    public long usuariosActivos() {

        LocalDateTime hace1Min = LocalDateTime.now().minusMinutes(1);

        return eventoRepository.countActivos(LocalDateTime.now().minusMinutes(1));

    }

    // lista de activos
    @GetMapping("/activos-lista")
    public List<Map<String, Object>> usuariosActivosLista() {

        LocalDateTime desde = LocalDateTime.now().minusMinutes(1);

        List<Usuario> usuarios = eventoRepository.usuariosActivos(desde);

        return usuarios.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("nombre", u.getNombres());
            map.put("dni", u.getDni());
            map.put("whatsapp", u.getWhatsapp());
            return map;
        }).toList();
    }
    // VISITAS POR PAGINA

    @GetMapping("/por-pagina")
    public List<Map<String, Object>> visitasPorPagina() {

        return eventoRepository.findAll().stream()
                .filter(e -> e.getPagina() != null)
                .collect(Collectors.groupingBy(EventoVisita::getPagina))
                .entrySet()
                .stream()
                .map(entry -> {

                    Map<String, Object> map = new HashMap<>();

                    map.put("pagina", entry.getKey());
                    map.put("visitas", entry.getValue().size());

                    long logueados = entry.getValue().stream()
                            .filter(e -> e.getUsuario() != null)
                            .count();

                    long anonimos = entry.getValue().size() - logueados;

                    map.put("logueados", logueados);
                    map.put("anonimos", anonimos);

                    return map;
                })
                .collect(Collectors.toList());
    }
}