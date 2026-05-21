package com.learning.english.dto.response;



import lombok.Data;

import java.util.List;

@Data
public class GeminiResponse {

    private List<Candidate> candidates;
    private UsageMetadata usageMetadata;
    private String modelVersion;
    private String responseId;

    @Data
    public static class Candidate {
        private Content content;
        private String finishReason;
        private Integer index;
    }

    @Data
    public static class Content {
        private List<Part> parts;
        private String role;
    }

    @Data
    public static class Part {
        private String text;
    }

    @Data
    public static class UsageMetadata {
        private Integer promptTokenCount;
        private Integer candidatesTokenCount;
        private Integer totalTokenCount;
    }
}