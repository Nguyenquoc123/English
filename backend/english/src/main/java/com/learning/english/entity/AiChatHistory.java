package com.learning.english.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
@Entity
@Table(name = "ai_chat_history")
public class AiChatHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chatId")
    private Long chatId;

    @Column(name = "userId", nullable = false)
    private Long userId;

    @Column(name = "userMessage", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String userMessage;

    @Column(name = "aiResponse", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String aiResponse;

    @Column(name = "createdAt", nullable = false)
    private LocalDateTime createdAt;
}
