package com.learning.english.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonVocabularyResponse {

    private Long vocabularyId;

    private String word;

    private String pronunciation;

    private String meaning;

    private String exampleSentence;

    private String audioUrl;
}