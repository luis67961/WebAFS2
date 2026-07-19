package com.example.Integrador.repositorios;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Integrador.modelos.Carrito;
import com.example.Integrador.modelos.Usuario;

@Repository
public interface CarritoRepository extends JpaRepository<Carrito, Long> {

    Carrito findByUsuario(Usuario usuario);

}