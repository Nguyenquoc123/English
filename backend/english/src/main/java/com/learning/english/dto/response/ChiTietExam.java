package com.learning.english.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
public class ChiTietExam {

    private Long examId;

    private String examType;

    private String examName;

    private Integer durationMinutes;

    private Long questionCount;

    private Long attemptCount;

    private BigDecimal bestScore;

    private LocalDateTime lastSubmittedAt;
}
