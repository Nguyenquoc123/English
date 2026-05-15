package com.learning.english.dto.request;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamQuestionAttachRequest {

    private Long examId;

    private String questionType;

    private List<Long> questionIds;

    private BigDecimal point;
}