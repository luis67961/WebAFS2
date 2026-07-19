package com.example.Integrador.controladores;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Integrador.dto.VisitaTecnicaDTO;
import com.example.Integrador.modelos.VisitaTecnica;
import com.example.Integrador.repositorios.VisitaTecnicaRepository;

@RestController
@RequestMapping("/api/visitas")
public class VisitaTecnicaController {

    @Autowired
    private VisitaTecnicaRepository repo;

    // CREAR VISITA
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody VisitaTecnicaDTO dto) {

        List<String> estadosActivos = List.of("PENDIENTE", "PROGRAMADA");

        boolean existe = repo.existsByUsuarioTelefonoAndEstadoIn(
                dto.getUsuarioTelefono(),
                estadosActivos);

        if (existe) {
            return ResponseEntity
                    .badRequest()
                    .body("Ya tienes una solicitud activa. Espera a que sea finalizada.");
        }

        VisitaTecnica v = new VisitaTecnica();
        v.setUsuario(dto.getUsuario());
        v.setUsuarioTelefono(dto.getUsuarioTelefono());
        v.setEstado("PENDIENTE");
        v.setFechaSolicitud(LocalDateTime.now());

        repo.save(v);

        return ResponseEntity.ok("OK");
    }

    // LISTAR
    @GetMapping
    public List<VisitaTecnica> listar() {
        return repo.findAll();
    }

    @PutMapping("/{id}/programar")
    public Map<String, Object> programar(
            @PathVariable Long id,
            @RequestBody Map<String, String> data) {

        VisitaTecnica v = repo.findById(id).orElseThrow();

        String fecha = data.get("fecha");
        String especialista = data.get("especialista");
        String motivo = data.get("motivo");
        String direccion = data.get("direccion");

        if (fecha == null || fecha.isEmpty()) {
            return Map.of("error", "Fecha obligatoria");
        }

        v.setFechaProgramada(
                java.time.LocalDateTime.of(
                        java.time.LocalDate.parse(fecha),
                        java.time.LocalTime.of(9, 0)));

        v.setEspecialista(especialista);
        v.setMotivo(motivo != null ? motivo : "Sin motivo");
        v.setDireccion(direccion != null ? direccion : "No registrada");
        v.setEstado("PROGRAMADA");
        v.setFechaActualizacion(java.time.LocalDateTime.now());

        if (v.getFechaCreacion() == null) {
            v.setFechaCreacion(java.time.LocalDateTime.now());
        }

        repo.save(v);

        Map<String, Object> response = new HashMap<>();

        response.put("id", v.getId());
        response.put("usuario", v.getUsuario());
        response.put("telefono", v.getUsuarioTelefono());
        response.put("especialista", v.getEspecialista());
        response.put("motivo", v.getMotivo());
        response.put("direccion", v.getDireccion());
        response.put("estado", v.getEstado());
        response.put("fechaSolicitud", v.getFechaSolicitud());
        response.put("fechaProgramada", v.getFechaProgramada());
        response.put("fechaCreacion", v.getFechaCreacion());
        response.put("fechaActualizacion", v.getFechaActualizacion());

        return response;
    }
    // finalizar visita

    @PutMapping("/{id}/finalizar")
    public String finalizar(@PathVariable Long id) {

        VisitaTecnica v = repo.findById(id).orElseThrow();

        v.setEstado("FINALIZADA");

        repo.save(v);

        return "OK";
    }

    @GetMapping("/buscar")
    public List<VisitaTecnica> buscar(@RequestParam String q) {
        return repo.buscarPorUsuarioOID(q);
    }

    @DeleteMapping("/{id}")
    public String eliminar(@PathVariable Long id) {

        repo.deleteById(id);

        return "ELIMINADO";
    }

    // reportes sobre las visitas tecnicas:
    @GetMapping("/reportes")
    public Map<String, Object> reporteVisitas() {

        Map<String, Object> r = new HashMap<>();

        LocalDateTime inicioSemana = LocalDateTime.now()
                .minusDays(LocalDateTime.now().getDayOfWeek().getValue() - 1)
                .withHour(0)
                .withMinute(0)
                .withSecond(0);

        r.put("estaSemana",
                repo.visitasSemana(inicioSemana));

        r.put("esteMes",
                repo.visitasMes(
                        LocalDateTime.now().getYear(),
                        LocalDateTime.now().getMonthValue()));

        r.put("pendientes",
                repo.countByEstado("PENDIENTE"));

        r.put("programadas",
                repo.countByEstado("PROGRAMADA"));

        r.put("reprogramadas",
                repo.countByEstado("REPROGRAMADA"));

        r.put("finalizadas",
                repo.countByEstado("FINALIZADA"));

        r.put("especialistas",
                repo.rankingEspecialistas());

        return r;
    }

 
}
