package com.learning.english.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PracticeConfigResponse {

    private Long configId;

    private Long lessonId;

    private String practiceType;

    private Boolean isEnabled;

    private Long questionCount;
}