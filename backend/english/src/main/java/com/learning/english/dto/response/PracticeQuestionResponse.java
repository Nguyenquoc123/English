package com.learning.english.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PracticeQuestionResponse {

    private Long questionId;

    private String questionType;

    private String content;

    private String mediaUrl;

    /*
        Dùng cho ARRANGE_SENTENCE.
        Không trả correctText trực tiếp để tránh học viên xem đáp án.
    */
    private List<String> words;

    private BigDecimal defaultPoint;

    private List<PracticeQuestionOptionResponse> options;
}