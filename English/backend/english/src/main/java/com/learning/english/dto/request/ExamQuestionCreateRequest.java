package com.learning.english.dto.request;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamQuestionCreateRequest {

    private Long examId;

    private String questionType;

    private String content;

    private String correctText;

    private String explanation;

    private BigDecimal defaultPoint;

    private BigDecimal point;

    private String status;

    private String sourceType;

    private List<QuestionOptionRequest> options;
}