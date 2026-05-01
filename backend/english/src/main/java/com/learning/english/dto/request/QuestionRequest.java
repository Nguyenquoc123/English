package com.learning.english.dto.request;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionRequest {

    private Long lessonId;

    private Long courseId;

    private String questionType;

    private String content;

    private String mediaUrl;
    
    private Integer mediaFileIndex;

    private String correctText;

    private String explanation;

    private BigDecimal defaultPoint;

    private String status;

    private String sourceType;

    private List<QuestionOptionRequest> options;
}