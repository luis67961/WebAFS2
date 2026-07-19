package com.example.Integrador.controladores;


import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import com.example.Integrador.modelos.Contacto;
import com.example.Integrador.repositorios.ContactoRepository;


@Controller
public class ContactoController {


    @Autowired
    private ContactoRepository contactoRepository;



  @PostMapping("/contacto")
@ResponseBody
public boolean enviarContacto(

        @RequestParam String nombre,
        @RequestParam String correo,
        @RequestParam(required = false) String telefono,
        @RequestParam String mensaje

) {


    Contacto contacto = new Contacto();


    contacto.setNombre(nombre);

    contacto.setCorreo(correo);

    contacto.setTelefono(telefono);

    contacto.setMensaje(mensaje);


    contacto.setFechaCreacion(LocalDateTime.now());

    contacto.setEstado("PENDIENTE");

    contacto.setRespuesta(null);

    contacto.setFechaRespuesta(null);



    contactoRepository.save(contacto);



    return true;

}

}