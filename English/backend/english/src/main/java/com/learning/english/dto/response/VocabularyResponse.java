package com.learning.english.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyResponse {

    private Long vocabularyId;

    private Long lessonId;

    private String word;

    private String pronunciation;

    private String meaning;

    private String exampleSentence;

    private String audioUrl;

    private String imageUrl;

    private Integer displayOrder;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}