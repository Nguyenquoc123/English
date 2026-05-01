package com.learning.english.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonUpdateRequest {
	private Long lessonId;
    private String title;
    private String description;
    private String status;
}