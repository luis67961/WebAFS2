package com.example.Integrador.servicios;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Integrador.dto.ClienteDTO;
import com.example.Integrador.modelos.Cliente;
import com.example.Integrador.repositorios.ClienteRepository;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    public List<ClienteDTO> listarClientes() {

        List<Cliente> clientes = clienteRepository.clientesConCompras();

        return clientes.stream()
                .map(c -> new ClienteDTO(c, clienteRepository.findByUsuarioId(c.getUsuario().getId())
                        .map(cli -> cli.getPedidos())
                        .orElse(List.of())))
                .toList();
    }
}