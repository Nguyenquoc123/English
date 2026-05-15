package com.learning.english.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PracticeQuestionOptionResponse {

    private Long optionId;

    private String optionText;
}