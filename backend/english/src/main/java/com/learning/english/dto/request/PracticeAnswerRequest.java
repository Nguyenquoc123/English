package com.learning.english.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PracticeAnswerRequest {

    private Long questionId;

    /*
        Dùng cho:
        MULTIPLE_CHOICE
        LISTENING_CHOICE
    */
    private Long selectedOptionId;

    /*
        Dùng cho:
        LISTENING_FILL_BLANK
        ARRANGE_SENTENCE
        WRITING_SHORT
    */
    private String answerText;
}