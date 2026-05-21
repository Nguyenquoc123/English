package com.learning.english.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PracticeAnswerRequest {

    private Long questionId;

    
    private Long selectedOptionId;

    
    private String answerText;
}
