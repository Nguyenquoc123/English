package com.learning.english.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.learning.english.dto.request.AIChatRequest;
import com.learning.english.service.AiChatService;

@RestController
@RequestMapping("/chatbot")
public class AiChatController {

    @Autowired
    AiChatService aiChatService;

    @PostMapping("/ask")
    public Map<String, String> ask(@RequestBody AIChatRequest request) {
        String answer = aiChatService.askQuestion(request.getUserMessage());

        return Map.of("aiResponse", answer);
    }
}