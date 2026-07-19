package com.example.Integrador.controladores;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.Integrador.modelos.AlertaAdmin;
import com.example.Integrador.repositorios.AlertaRepository;

@RestController
@RequestMapping("/alertas")
public class AlertaControllerAdmin {


    @Autowired
    private AlertaRepository alertaRepository;

    // OBTENER TODAS LAS ALERTAS
    
    @GetMapping
    public List<AlertaAdmin> listarAlertas() {
        return alertaRepository.findAllByOrderByFechaDesc();
    }

    
    // MARCAR COMO LEIDA
    
    @PutMapping("/{id}/leer")
    public void marcarComoLeida(@PathVariable Long id) {

        AlertaAdmin alerta = alertaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alerta no encontrada"));

        alerta.setLeida(true);
        alertaRepository.save(alerta);
    }

    
    // ELIMINAR ALERTA 
    
    @DeleteMapping("/{id}")
    public void eliminarAlerta(@PathVariable Long id) {
        alertaRepository.deleteById(id);
    }

    
    // LIMPIAR TODAS 
    
    @DeleteMapping("/limpiar")
    public void eliminarTodas() {
        alertaRepository.deleteAll();
    }
}