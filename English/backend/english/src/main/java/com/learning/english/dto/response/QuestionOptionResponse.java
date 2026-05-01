package com.learning.english.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionOptionResponse {

    private Long optionId;

    private String optionText;

    private Boolean isCorrect;

}