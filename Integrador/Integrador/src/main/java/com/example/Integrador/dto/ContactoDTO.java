package com.example.Integrador.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContactoDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 100)
    private String nombre;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Correo inválido")
    private String correo;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(
        regexp = "^\\d{9}$",
        message = "El teléfono debe tener 9 dígitos"
    )
    private String telefono;

    @NotBlank(message = "El mensaje es obligatorio")
    @Size(min = 10, max = 500)
    private String mensaje;
}