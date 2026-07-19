package com.example.Integrador.dto;


import java.util.List;

public class VentaManualDTO {

    public String dni;
    public String nombreCliente;
    public List<ItemVentaDTO> productos;

    public static class ItemVentaDTO {
        public Long productoId;
        public double kilos;
        public double precio;
    }
}