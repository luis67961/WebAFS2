package com.example.Integrador.repositorios;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Integrador.modelos.Pedido;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {


    // traer Ultimos pedidos
    List<Pedido> findTop20ByOrderByIdDesc();

    //   por cliente
    List<Pedido> findByClienteId(Long clienteId);


    Optional<Pedido> findTopByEstadoOrderByFechaPedidoDesc(String estado);
}