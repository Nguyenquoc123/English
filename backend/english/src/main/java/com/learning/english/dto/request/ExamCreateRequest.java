package com.learning.english.dto.request;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamCreateRequest {

    private Long courseId;

    private String title;

    private String description;

    private Integer durationMinutes;
    
    private boolean isFreePreview;

    private String status;
}