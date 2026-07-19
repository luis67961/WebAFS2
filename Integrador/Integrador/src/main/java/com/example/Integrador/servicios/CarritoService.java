package com.example.Integrador.servicios;

import java.util.Map;

import com.example.Integrador.modelos.Usuario;


public interface CarritoService {

    Map<String, Object> agregarProducto(Long productoId, Usuario usuario);

    Map<String, Object> verCarrito(Usuario usuario);

    Map<String, Object> actualizarCantidad(Long productoId, Long cantidad, Usuario usuario);

    Map<String, Object> eliminarProducto(Long productoId, Usuario usuario);
}