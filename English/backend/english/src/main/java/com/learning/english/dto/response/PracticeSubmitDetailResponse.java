package com.learning.english.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PracticeSubmitDetailResponse {

    private Long attemptDetailId;

    private Long questionId;

    private String questionType;

    private String content;

    private Long selectedOptionId;

    private String selectedOptionText;

    private String answerText;

    private Boolean isCorrect;

    private BigDecimal earnedPoint;

    private String correctAnswer;

    private String explanation;
}