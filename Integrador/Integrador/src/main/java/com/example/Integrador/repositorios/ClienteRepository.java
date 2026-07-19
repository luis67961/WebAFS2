package com.example.Integrador.repositorios;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.Integrador.modelos.Cliente;
import com.example.Integrador.modelos.Usuario;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    @Query("""
                SELECT DISTINCT c
                FROM Cliente c
                JOIN c.pedidos p
                WHERE p.estado IN ('ENTREGADO','APROBADO')
            """)
    List<Cliente> clientesConCompras();

    Optional<Cliente> findByUsuarioId(Long usuarioId);

    Cliente findByUsuario(Usuario usuario);
}