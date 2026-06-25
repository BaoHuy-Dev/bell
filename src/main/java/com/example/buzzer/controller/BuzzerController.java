package com.example.buzzer.controller;

import com.example.buzzer.model.BuzzRequest;
import com.example.buzzer.model.BuzzerState;
import com.example.buzzer.service.BuzzerService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class BuzzerController {

    private final BuzzerService buzzerService;
    private final SimpMessagingTemplate messagingTemplate;

    public BuzzerController(BuzzerService buzzerService, SimpMessagingTemplate messagingTemplate) {
        this.buzzerService = buzzerService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/buzz")
    public void handleBuzz(BuzzRequest request) {
        boolean won = buzzerService.buzz(request.getPlayerName());
        if (won) {
            broadcastState();
        }
    }

    @MessageMapping("/reset")
    public void handleReset() {
        buzzerService.reset();
        broadcastState();
    }
    
    @MessageMapping("/state")
    public void handleStateRequest() {
        // Send state back to the requester or broadcast to sync
        broadcastState();
    }

    private void broadcastState() {
        BuzzerState state = buzzerService.getState();
        messagingTemplate.convertAndSend("/topic/buzzer", state);
    }
}
