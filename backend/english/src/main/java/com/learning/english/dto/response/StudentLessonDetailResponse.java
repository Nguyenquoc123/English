package com.learning.english.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentLessonDetailResponse {

    private Long lessonId;

    private Long courseId;

    private String courseTitle;

    private String title;

    private String description;

    private Integer lessonOrder;
}