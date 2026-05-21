package com.learning.english.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAdminResponse {

    private Long examId;

    private String title;

    private String description;

    private Integer durationMinutes;

    private Integer maxAttempts;

    private String status;

    private Long courseId;

    private String courseTitle;

    private String createdByUsername;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
