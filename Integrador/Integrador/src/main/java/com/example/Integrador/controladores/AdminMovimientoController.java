package com.example.Integrador.controladores;

import com.example.Integrador.modelos.Movimiento;
import com.example.Integrador.servicios.MovimientoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/movimientos")
@CrossOrigin("*")
public class AdminMovimientoController {

    @Autowired
    private MovimientoService movimintoService;

    @GetMapping
    public List<Movimiento> listar(
            @RequestParam(required = false) String tipo) {

        return movimintoService.listar(tipo);
    }

    public AdminMovimientoController(MovimientoService movimintoService) {
        this.movimintoService = movimintoService;
    }

    // REGISTRO PERO E (JSON) POR SI ACASO

    @PostMapping
    public Movimiento guardar(@RequestBody Movimiento movimiento) {
        return movimintoService.guardar(movimiento);
    }

    // UPDATE

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Movimiento upload(
            @RequestParam("tipo") String tipo,
            @RequestParam("destino") String destino,
            @RequestParam("referencia") String referencia,
            @RequestParam(value = "monto", required = false) Double monto,
            @RequestParam(value = "concepto", required = false) String concepto,
            @RequestParam("metodo") String metodo,
            @RequestParam("fecha") String fecha,
            @RequestParam("estado") String estado,
            @RequestParam("descripcion") String descripcion,
            @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {

        Movimiento m = new Movimiento();

        m.setTipo(tipo != null ? tipo.trim().toUpperCase() : null);
        m.setDestino(destino);
        m.setReferencia(referencia);
        m.setMetodo(metodo);
        m.setEstado(estado);
        m.setDescripcion(descripcion);
        m.setConcepto(concepto);

        m.setMonto(monto != null ? BigDecimal.valueOf(monto) : BigDecimal.ZERO);
        m.setFecha((fecha != null && !fecha.isEmpty()) ? LocalDate.parse(fecha) : null);

        // IMAGEN
        if (file != null && !file.isEmpty()) {

            String nombre = UUID.randomUUID() + "_" + file.getOriginalFilename();

            String uploadDir = System.getProperty("user.dir") + "/uploads";

            File carpeta = new File(uploadDir);
            if (!carpeta.exists()) {
                carpeta.mkdirs();
            }

            File destinoArchivo = new File(uploadDir + "/" + nombre);
            file.transferTo(destinoArchivo);

            m.setEvidenciaUrl(nombre);
        }

        return movimintoService.guardar(m);
    }

    // LISTAR TODOS

    // BUSCAR POR ID

    @GetMapping("/{id}")
    public Optional<Movimiento> buscarPorId(@PathVariable Long id) {
        return movimintoService.buscarPorId(id);
    }

    // ACTUALIZAR

    @PutMapping("/{id}")
    public Movimiento actualizar(
            @PathVariable Long id,
            @RequestBody Movimiento movimiento) {
        return movimintoService.actualizar(id, movimiento);
    }

    @PutMapping(value = "/upload/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Movimiento actualizarConImagen(
            @PathVariable Long id,
            @RequestParam("tipo") String tipo,
            @RequestParam("destino") String destino,
            @RequestParam("referencia") String referencia,
            @RequestParam(value = "concepto", required = false) String concepto,

            @RequestParam(value = "monto", required = false) Double monto,
            @RequestParam("metodo") String metodo,
            @RequestParam(value = "fecha", required = false) String fecha,
            @RequestParam("estado") String estado,
            @RequestParam("descripcion") String descripcion,
            @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {

        Movimiento m = movimintoService.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Movimiento no encontrado"));

        m.setTipo(tipo);
        m.setDestino(destino);
        m.setReferencia(referencia);
        m.setMetodo(metodo);
        m.setEstado(estado);
        m.setDescripcion(descripcion);
        m.setConcepto(concepto != null ? concepto.trim() : null); 

        if (monto != null) {
            m.setMonto(BigDecimal.valueOf(monto));
        }

        if (fecha != null && !fecha.isBlank()) {
            m.setFecha(LocalDate.parse(fecha));
        }

        // IMAGEN
        if (file != null && !file.isEmpty()) {

            String nombre = UUID.randomUUID() + "_" + file.getOriginalFilename();

            String uploadDir = System.getProperty("user.dir") + "/uploads";

            File carpeta = new File(uploadDir);
            if (!carpeta.exists()) {
                carpeta.mkdirs();
            }

            File destinoArchivo = new File(uploadDir + "/" + nombre);
            file.transferTo(destinoArchivo);

            m.setEvidenciaUrl(nombre);
        }

        return movimintoService.guardar(m);
    }

    // ELIMINAR
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        movimintoService.eliminar(id);
    }

    // FILTROS
    @GetMapping("/filtrar")
    public List<Movimiento> filtrar(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) String metodo,
            @RequestParam(required = false) String destino) {

        return movimintoService.filtrar(tipo, fecha, metodo, destino);
    }
}