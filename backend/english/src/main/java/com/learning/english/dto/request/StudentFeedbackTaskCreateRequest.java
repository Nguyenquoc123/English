package com.learning.english.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentFeedbackTaskCreateRequest {
    private String title;
    private String content;
}
