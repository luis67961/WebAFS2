package com.example.Integrador.controladores;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.Integrador.modelos.Pedido;
import com.example.Integrador.repositorios.PedidoRepository;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoApiController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @GetMapping("/cliente/{id}/entregados")
    public List<Pedido> pedidosEntregados(@PathVariable Long id) {
        return pedidoRepository.findByClienteId(id)
                .stream()
                .filter(p -> "ENTREGADO".equalsIgnoreCase(p.getEstado()))
                .toList();
    }



    
}