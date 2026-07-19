package com.example.Integrador.repositorios;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Integrador.modelos.Administrador;


public interface AdministradorRepository extends JpaRepository<Administrador, Long>{


    boolean existsByCorreo(String correo);
        Administrador findByCorreo(String correo);



    // BUSCAR POR NOMBRE O CORREO
    List<Administrador> findByNombreContainingIgnoreCaseOrCorreoContainingIgnoreCase(
            String nombre,
            String correo
    );

}