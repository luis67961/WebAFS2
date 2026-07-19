package com.example.Integrador.configuracion;


import java.util.HashSet;
import java.util.Set;

import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;


@Component
public class SessionListener implements HttpSessionListener {


    private static final Set<String> usuariosOnline = new HashSet<>();


    public static Set<String> getUsuariosOnline(){

        return usuariosOnline;

    }



    public static void agregarUsuario(String correo){

        usuariosOnline.add(correo);

    }



    public static void quitarUsuario(String correo){

        usuariosOnline.remove(correo);

    }



    @Override
    public void sessionDestroyed(HttpSessionEvent se) {


        String correo = 
            (String) se.getSession()
            .getAttribute("correo");


        if(correo != null){

            quitarUsuario(correo);

        }

    }

}