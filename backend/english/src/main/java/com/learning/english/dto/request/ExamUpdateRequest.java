package com.learning.english.dto.request;

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
public class ExamUpdateRequest {

    private Long courseId;
    private Long examId;
    private String title;
    private String description;
    private Integer durationMinutes;
    private String status;
    private boolean isFreePreview;
}
