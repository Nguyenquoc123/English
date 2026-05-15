package com.learning.english.dto.response;

import java.time.LocalDateTime;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarResponse {

    private Long grammarId;

    private Long lessonId;

    private String title;

    private String contentHtml;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}