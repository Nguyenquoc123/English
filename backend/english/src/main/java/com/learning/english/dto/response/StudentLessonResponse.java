package com.learning.english.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentLessonResponse {

    private Long lessonId;

    private Long courseId;

    private String title;

    private String description;

    private Integer lessonOrder;

    private Boolean isLocked;
}