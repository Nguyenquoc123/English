package com.learning.english.dto.request;
import java.math.BigDecimal;
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
public class QuestionRequest {

    private Long lessonId;

    private String questionType;

    private String content;

    private String mediaUrl;

    private String correctText;

    private String explanation;

    private BigDecimal defaultPoint;

    private String status;

    private String sourceType;

    private List<QuestionOptionRequest> options;
}