package com.learning.english.dto.response;

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
public class LessonQuestionResponse {

    private Long questionId;

    private String questionType;

    private String content;

    private Long optionCount;

    private String status;
}