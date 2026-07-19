package com.example.Integrador.servicios;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.stereotype.Service;


@Service
public class OTPservice {


    private final Map<String, String> codes = new HashMap<>();



    //====================================
    // GENERAR CODIGO OTP
    //====================================

    public String generateCode(String email) {


        String code = String.valueOf(
                100000 + new Random().nextInt(900000)
        );


        codes.put(email, code);


        return code;

    }




    //====================================
    // VALIDAR CODIGO
    //====================================

    public boolean validateCode(String email, String code) {


        String storedCode = codes.get(email);


        return storedCode != null 
                && storedCode.equals(code);

    }





    //====================================
    // ELIMINAR OTP USADO
    //====================================

    public void removeCode(String email){

        codes.remove(email);

    }


}