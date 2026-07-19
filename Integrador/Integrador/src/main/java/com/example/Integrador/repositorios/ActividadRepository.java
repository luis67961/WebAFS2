package com.example.Integrador.repositorios;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Integrador.modelos.Actividad;


public interface ActividadRepository extends JpaRepository<Actividad, Long>{

        List<Actividad> findAllByOrderByFechaDesc();

}