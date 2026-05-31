package com.learning.english.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionAIResponse {

    private Long personalPracticeId;
    private Long userId;
    private String title;
    private Integer questionLimit;
    private String type;
    private String status;
    private LocalDateTime createdAt;

//    private List<QuestionResponse> questions;
}