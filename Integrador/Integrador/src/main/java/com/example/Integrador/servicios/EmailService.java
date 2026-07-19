package com.example.Integrador.servicios;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // OTP
    public void sendCode(String to, String code) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Código de acceso admin");
        message.setText("Tu código es: " + code);

        mailSender.send(message);
    }

    // envia el codigo

    public void sendContactMessage(String nombre, String correo, String telefono, String mensaje) {

        SimpleMailMessage mail = new SimpleMailMessage();

        mail.setTo("empresa@gmail.com");

        mail.setReplyTo(correo);

        mail.setSubject("Nuevo contacto web - " + nombre);

        mail.setText(
                "Nombre: " + nombre + "\n" +
                        "Correo: " + correo + "\n" +
                        "Teléfono: " + telefono + "\n\n" +
                        mensaje);

        mailSender.send(mail);
    }

    // ENVIAR CORREO (pedidos)

    public void enviarCorreo(String destino, String asunto, String mensaje) {

        try {
            SimpleMailMessage email = new SimpleMailMessage();

            email.setTo(destino);
            email.setSubject(asunto);
            email.setText(mensaje);
            email.setFrom("david08af@gmail.com");

            mailSender.send(email);

            System.out.println("Correo enviado a: " + destino);

        } catch (Exception e) {
            System.out.println("Error al enviar correo: " + e.getMessage());
        }
    }

    public void enviarOTP(String destino, String codigo) {

        SimpleMailMessage mensaje = new SimpleMailMessage();

        mensaje.setFrom("david08af@gmail.com");

        mensaje.setTo(destino);

        mensaje.setSubject("Código OTP - Eliminación de Administrador");

        mensaje.setText(
                "Hola.\n\n" +
                        "Se solicitó la eliminación de un administrador.\n\n" +
                        "Tu código OTP es: " + codigo + "\n\n" +
                        "Este código es válido por unos minutos.\n\n" +
                        "Si no realizaste esta solicitud, ignora este mensaje.");

        mailSender.send(mensaje);

    }

    public void enviarRespuestaConsulta(
            String nombre,
            String correoDestino,
            String consulta,
            String respuesta) {

        SimpleMailMessage mensaje = new SimpleMailMessage();

        mensaje.setFrom("david08af@gmail.com");

        mensaje.setTo(correoDestino);

        mensaje.setSubject("Animal Feed Solutions | Respuesta a su consulta");

        mensaje.setText(

                "========================================\n" +
                        "        ANIMAL FEED SOLUTIONS\n" +
                        "========================================\n\n" +

                        "Estimado/a " + nombre + ",\n\n" +

                        "Gracias por comunicarse con Animal Feed Solutions.\n" +
                        "Hemos revisado su consulta y nuestro equipo le brinda la siguiente respuesta:\n\n" +

                        "----------------------------------------\n" +
                        " SU CONSULTA\n" +
                        "----------------------------------------\n\n" +

                        consulta + "\n\n" +

                        "----------------------------------------\n" +
                        " RESPUESTA DE NUESTRO EQUIPO\n" +
                        "----------------------------------------\n\n" +

                        respuesta + "\n\n" +

                        "----------------------------------------\n\n" +

                        "Si necesita más información o tiene alguna otra consulta,\n" +
                        "nuestro equipo estará encantado de ayudarlo.\n\n" +

                        "Atentamente,\n\n" +

                        "Equipo de Atención al Cliente\n" +
                        "Animal Feed Solutions\n\n" +

                        "========================================\n" +
                        "  Alimentando el futuro con calidad\n" +
                        "========================================"

        );

        mailSender.send(mensaje);

    }

}