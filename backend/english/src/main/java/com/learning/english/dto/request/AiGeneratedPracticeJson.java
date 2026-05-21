package com.learning.english.dto.request;



import lombok.Data;

import java.util.List;

@Data
public class AiGeneratedPracticeJson {

    private List<AiQuestion> questions;

    @Data
    public static class AiQuestion {
        private String questionType;
        private String content;
        private String correctText;
        private String explanation;
        private List<AiOption> options;
    }

    @Data
    public static class AiOption {
        private String optionText;
        private Boolean isCorrect;
    }
}