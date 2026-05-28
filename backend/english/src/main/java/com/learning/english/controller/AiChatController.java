package com.learning.english.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.learning.english.dto.request.AIChatRequest;
import com.learning.english.dto.response.CourseRecommendationResponse;
import com.learning.english.service.AiChatService;
import com.learning.english.service.AiCourseRecommendationService;

@RestController
@RequestMapping("/chatbot")
public class AiChatController {

    @Autowired
    AiChatService aiChatService;
    
    @Autowired
    AiCourseRecommendationService aiCourseRecommendationService;

    @PostMapping("/ask")
    public Map<String, String> ask(@RequestBody AIChatRequest request) {
        String answer = aiChatService.askQuestion(request.getUserMessage());

        return Map.of("aiResponse", answer);
    }
    
    @PostMapping("/recommend-courses")
    public ResponseEntity<CourseRecommendationResponse> recommendCourses(
            @RequestBody AIChatRequest request
    ) {
        CourseRecommendationResponse response =
                aiCourseRecommendationService.recommendCourses(request.getUserMessage());

        return ResponseEntity.ok(response);
    }
}