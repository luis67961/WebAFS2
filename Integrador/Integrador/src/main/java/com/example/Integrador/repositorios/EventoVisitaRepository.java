package com.example.Integrador.repositorios;

import com.example.Integrador.modelos.EventoVisita;
import com.example.Integrador.modelos.Usuario;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EventoVisitaRepository extends JpaRepository<EventoVisita, Long> {

    // usuariossssssssssssssssssss activos
    @Query("""
            SELECT COUNT(DISTINCT e.usuario.id)
            FROM EventoVisita e
            WHERE e.fecha > :desde
            AND e.usuario IS NOT NULL
            """)
    long countActivos(@Param("desde") LocalDateTime desde);

    // lista de usuarios activos
    @Query("""
            SELECT DISTINCT e.usuario
            FROM EventoVisita e
            WHERE e.usuario IS NOT NULL
            AND e.fecha > :desde
            """)
    List<Usuario> usuariosActivos(@Param("desde") LocalDateTime desde);

}