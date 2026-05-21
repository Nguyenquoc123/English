package com.learning.english.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherExamDetailResponse {

    private Long examId;

    private Long courseId;

    private String courseTitle;

    private String title;

    private String description;

    private Integer durationMinutes;

    private Integer maxAttempts;

    private Long questionCount;

    private BigDecimal totalPoint;

    private String status;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}