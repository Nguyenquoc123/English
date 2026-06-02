package com.learning.english.dto.request;

import lombok.Data;

@Data
public class CreateQuestionAiRequest {

   
    private String questionType;

   
    private String prompt;

    private Integer questionLimit;

    private Long levelId;
}