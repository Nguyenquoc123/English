package com.learning.english.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentFeedbackTaskResponse {
    private Long feedbackTaskId;
    private Long studentId;
    private String studentUsername;
    private String studentFullName;
    private String title;
    private String content;
    private String status;
    private String adminNote;
    private String reviewedByUsername;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
