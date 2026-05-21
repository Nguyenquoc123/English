package com.learning.english.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiChatResponse {

    private Long chatId;
    private Long userId;
    private String userMessage;
    private String aiResponse;
    private LocalDateTime createdAt;
}