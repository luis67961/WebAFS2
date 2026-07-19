package com.example.Integrador.repositorios;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Integrador.modelos.Producto;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    List<Producto> findByCategoria(String categoria);

    List<Producto> findByNombreContainingIgnoreCaseOrCategoriaContainingIgnoreCase(
            String nombre, String categoria);
}