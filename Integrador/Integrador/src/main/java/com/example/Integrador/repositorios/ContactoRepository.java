package com.example.Integrador.repositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Integrador.modelos.Contacto;


@Repository
public interface ContactoRepository extends JpaRepository<Contacto, Integer> {

}