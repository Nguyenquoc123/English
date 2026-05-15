package com.learning.english.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionBankItemResponse {

    private Long questionId;

    private String questionType;

    private String content;

    private String correctText;

    private BigDecimal defaultPoint;

    private String status;

    private Long optionCount;
}