package com.learning.english.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonRequest {

    private Long courseId;

    private String title;

    private String description;
    
    private boolean isFreePreview;

    private String status;
}
