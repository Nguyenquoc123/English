package com.learning.english.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherExamQuestionResponse {

    private Long examQuestionId;

    private Long questionId;

    private Integer questionOrder;

    private BigDecimal point;

    private String questionType;

    private String content;

    private String mediaUrl;

    private String status;

    private String explanation;
}