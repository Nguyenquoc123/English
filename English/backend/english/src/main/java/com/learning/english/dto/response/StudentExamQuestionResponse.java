package com.learning.english.dto.response;

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
public class StudentExamQuestionResponse {

    private Long examId;

    private Long courseId;

    private String courseTitle;

    private String title;

    private String description;

    private Integer durationMinutes;

    private Integer maxAttempts;

    private Integer questionCount;

    private Long totalPoint;

    private List<PracticeQuestionResponse> questions;
}