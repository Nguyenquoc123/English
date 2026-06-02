package com.learning.english.dto.response;

import java.time.LocalDateTime;
import java.util.List;

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
public class AiCourseRecommendationHistoryResponse {

    private Long chatId;

    private String role; // user | ai

    private String content;

    private List<RecommendedCourseResponse> courses;

    private LocalDateTime createdAt;
}