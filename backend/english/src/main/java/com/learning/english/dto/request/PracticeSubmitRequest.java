package com.learning.english.dto.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PracticeSubmitRequest {

    private Long lessonId;

    private String practiceType;

    private List<PracticeAnswerRequest> answers;
}