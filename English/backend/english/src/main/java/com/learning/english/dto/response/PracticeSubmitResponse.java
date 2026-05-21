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
public class PracticeSubmitResponse {

    private Long attemptId;

    private Long lessonId;

    private String lessonTitle;

    private String practiceType;

    private BigDecimal score;

    private Integer totalCorrect;

    private Integer totalQuestions;

    private String resultStatus;

    private LocalDateTime submittedAt;

    private List<PracticeSubmitDetailResponse> details;
}