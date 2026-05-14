package com.learning.english.dto.response;

import java.time.LocalDateTime;
import java.util.List;

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
public class StudentLessonDetailResponse {

    private Long lessonId;

    private Long courseId;

    private String courseTitle;

    private String title;

    private String description;

    private Integer lessonOrder;

    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<LessonVideoResponse> videos;

    private List<LessonVocabularyResponse> vocabularies;

    private List<LessonGrammarResponse> grammars;

    private List<LessonQuestionResponse> questions;
}