package com.learning.english.dto.request;

import lombok.Data;

@Data
public class CreatePersonalPracticeAiRequest {

   
    private String title;

   
    private String type;

    private Integer questionLimit;

    private String description;
}