package com.example.Integrador.repositorios;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Integrador.modelos.AlertaAdmin;


import java.util.List;



public interface AlertaRepository extends JpaRepository<AlertaAdmin, Long> {

    List<AlertaAdmin> findAllByOrderByFechaDesc();
}