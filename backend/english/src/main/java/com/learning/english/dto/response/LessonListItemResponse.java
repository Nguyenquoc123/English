package com.learning.english.dto.response;

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
public class LessonListItemResponse {

    private Long lessonId;

    private Integer lessonOrder;

    private String title;

    private String description;

    private String status;

    private Long videoCount;

    private Long vocabularyCount;

    private Long grammarCount;

    private Long practiceCount;

    private LocalDateTime createdAt;
}