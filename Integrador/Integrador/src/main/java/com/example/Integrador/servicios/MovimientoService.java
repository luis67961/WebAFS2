package com.example.Integrador.servicios;

import com.example.Integrador.modelos.Movimiento;
import com.example.Integrador.repositorios.MovimientoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class MovimientoService {

    private final MovimientoRepository repository;

    public MovimientoService(MovimientoRepository repository) {
        this.repository = repository;
    }

    // GUARDAR MOVIMIENTO

    public Movimiento guardar(Movimiento movimiento) {
        return repository.save(movimiento);
    }

    // LISTAR
    public List<Movimiento> listar(String tipo) {

        if (tipo != null && !tipo.isBlank()) {
            return repository.findByTipoIgnoreCase(tipo.trim().toUpperCase());
        }

        return repository.findAll();
    }
    // BUSCAR POR ID

    public Optional<Movimiento> buscarPorId(Long id) {
        return repository.findById(id);
    }

    // ELIMINAR

    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    // ACTUALIZAR

    public Movimiento actualizar(Long id, Movimiento nuevo) {

        Movimiento existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movimiento no encontrado"));

        existente.setTipo(nuevo.getTipo());
        existente.setDestino(nuevo.getDestino());
        existente.setConcepto(nuevo.getConcepto());
        existente.setMonto(nuevo.getMonto());
        existente.setMetodo(nuevo.getMetodo());
        existente.setFecha(nuevo.getFecha());
        existente.setEstado(nuevo.getEstado());
        existente.setReferencia(nuevo.getReferencia());
        existente.setDescripcion(nuevo.getDescripcion());
        existente.setEvidenciaUrl(nuevo.getEvidenciaUrl());

        return repository.save(existente);
    }

    // FILTRO PRINCIPAL

    public List<Movimiento> filtrar(String tipo, LocalDate fecha, String metodo, String destino) {

        if (tipo != null && fecha != null && metodo != null) {
            return repository.findByTipoAndMetodo(tipo, metodo);
        }

        if (tipo != null) {
            return repository.findByTipo(tipo);
        }

        if (fecha != null) {
            return repository.findByFecha(fecha);
        }

        if (metodo != null) {
            return repository.findByMetodo(metodo);
        }

        if (destino != null && !destino.isEmpty()) {
            return repository.findByDestinoContainingIgnoreCase(destino);
        }

        return repository.findAll();
    }
}