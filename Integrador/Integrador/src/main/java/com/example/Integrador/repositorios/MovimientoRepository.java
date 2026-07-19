package com.example.Integrador.repositorios;

import com.example.Integrador.modelos.Movimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {

    List<Movimiento> findByTipo(String tipo);

    List<Movimiento> findByFecha(LocalDate fecha);
        List<Movimiento> findByTipoIgnoreCase(String tipo);


    List<Movimiento> findByMetodo(String metodo);

    List<Movimiento> findByDestinoContainingIgnoreCase(String destino);

    List<Movimiento> findByTipoAndMetodo(String tipo, String metodo);
}