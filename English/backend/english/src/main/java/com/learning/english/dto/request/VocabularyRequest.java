package com.learning.english.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyRequest {

    private Long lessonId;

    private String word;

    private String pronunciation;

    private String meaning;

    private String exampleSentence;

    private String audioUrl;

    private String imageUrl;

    private Integer audioFileIndex;

    private Integer imageFileIndex;

    private Integer displayOrder;
}