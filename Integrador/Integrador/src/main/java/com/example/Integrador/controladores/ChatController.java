package com.example.Integrador.controladores;


import org.springframework.web.bind.annotation.*;

import com.example.Integrador.dto.ChatPeticion;
import com.example.Integrador.dto.ChatRespuesta;
import com.example.Integrador.servicios.ChatService;



@RestController
@RequestMapping("/api/chat")  
@CrossOrigin("*") 
public class ChatController {



    private final ChatService chatService;


    public ChatController(ChatService chatService) { 
        this.chatService = chatService;    
    }

    @PostMapping
    public ChatRespuesta chat(@RequestBody ChatPeticion request) {  
      
        String respuesta = chatService.responder(request.getMessage());

        return new ChatRespuesta(respuesta);
   
    }
}