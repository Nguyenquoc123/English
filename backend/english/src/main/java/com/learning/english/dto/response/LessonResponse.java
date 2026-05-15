package com.learning.english.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonResponse {

    private Long lessonId;

    private Long levelId;
    private String levelName;

    private Long courseId;
    private String courseTitle;

    private String title;
    private String description;
    private String lessonType;
    private Integer lessonOrder;
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}