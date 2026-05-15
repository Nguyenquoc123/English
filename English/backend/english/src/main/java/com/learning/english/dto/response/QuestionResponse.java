package com.learning.english.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionResponse {

    private Long questionId;

    private Long createdById;

    private String questionType;

    private String content;

    private String mediaUrl;

    private String correctText;

    private String explanation;

    private BigDecimal defaultPoint;

    private String status;

    private String sourceType;

    private Long optionCount;

    private List<QuestionOptionResponse> options;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}