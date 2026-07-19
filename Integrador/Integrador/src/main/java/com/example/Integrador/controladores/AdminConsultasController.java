package com.example.Integrador.controladores;


import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import com.example.Integrador.modelos.Contacto;
import com.example.Integrador.repositorios.ContactoRepository;
import com.example.Integrador.servicios.EmailService;

@Controller
@RequestMapping("/admin")
public class AdminConsultasController {

    @Autowired
    private ContactoRepository contactoRepository;

    @Autowired
    private EmailService emailService;

    
    // LISTAR TODAS LAS CONSULTAS

    @GetMapping("/consultas")
    @ResponseBody
    public List<Contacto> listarConsultas() {

        return contactoRepository.findAll();

    }

    // OBTENER UNA CONSULTA
    @GetMapping("/consulta/{id}")
    @ResponseBody
    public Contacto obtenerConsulta(@PathVariable Integer id) {

        return contactoRepository.findById(id).orElse(null);

    }

    // RESPONDER CONSULTA
    @PutMapping("/consulta/{id}/responder")
    @ResponseBody
    public Contacto responderConsulta(
            @PathVariable Integer id,
            @RequestBody Contacto datos) {

        Contacto contacto = contactoRepository.findById(id).orElse(null);

        if (contacto == null) {
            return null;
        }

        // Guardar respuesta
        contacto.setRespuesta(datos.getRespuesta());

        // Fecha de respuesta
        contacto.setFechaRespuesta(LocalDateTime.now());

        // Cambiar estado
        contacto.setEstado("RESPONDIDO");

        contactoRepository.save(contacto);

        // Enviar correo
        emailService.enviarRespuestaConsulta(
                contacto.getNombre(),
                contacto.getCorreo(),
                contacto.getMensaje(),
                contacto.getRespuesta());

        return contacto;
    }

    // ELIMINAR CONSULTA
    @DeleteMapping("/consulta/{id}")
    @ResponseBody
    public boolean eliminarConsulta(@PathVariable Integer id) {

        if (!contactoRepository.existsById(id)) {
            return false;
        }

        contactoRepository.deleteById(id);

        return true;

    }

}