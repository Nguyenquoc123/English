package com.learning.english.dto.response;


import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiChatMessageResponse {

    private Long chatId;

    private String role; // user | ai

    private String content;

    private LocalDateTime createdAt;
}