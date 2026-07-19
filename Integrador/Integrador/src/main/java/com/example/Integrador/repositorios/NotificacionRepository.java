package com.example.Integrador.repositorios;
/* 
import com.example.Integrador.modelos.Notificacion;
import com.example.Integrador.modelos.Usuario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    // NOTIFICACIONES POR USUARIO
    List<Notificacion> findByUsuarioOrderByFechaCreacionDesc(Usuario usuario);

    
    long countByUsuarioAndLeidaFalse(Usuario usuario);

    
    
    List<Notificacion> findByUsuarioAndLeidaFalseOrderByFechaCreacionDesc(Usuario usuario);

    List<Notificacion> findTop10ByUsuarioOrderByFechaCreacionDesc(Usuario usuario);
}*/