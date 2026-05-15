package com.learning.english.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarRequest {

    private Long lessonId;

    private String title;

    private String contentHtml;
}