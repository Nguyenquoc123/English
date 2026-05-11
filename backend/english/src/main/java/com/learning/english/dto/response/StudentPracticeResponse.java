package com.learning.english.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentPracticeResponse {

    private Long lessonId;

    private String lessonTitle;

    private String practiceType;

    private List<PracticeQuestionResponse> questions;
}