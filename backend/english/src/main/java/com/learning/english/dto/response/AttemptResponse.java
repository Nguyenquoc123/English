package com.learning.english.dto.response;



import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptResponse {

    private Long attemptId;

    private Long userId;

    private String attemptType;

    private Long lessonId;
    private String lessonTitle;

    private String practiceType;

    private Long examId;
    private String examTitle;

    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;

    private BigDecimal score;

    private Integer totalCorrect;
    private Integer totalQuestions;

    private Integer durationSeconds;

    private String resultStatus;

    private LocalDateTime createdAt;
}