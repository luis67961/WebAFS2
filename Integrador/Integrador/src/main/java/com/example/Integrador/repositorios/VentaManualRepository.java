package com.example.Integrador.repositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.Integrador.modelos.VentaManual;

public interface VentaManualRepository extends JpaRepository<VentaManual, Long> {
}