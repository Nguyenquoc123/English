package com.learning.english.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoProgressResponse {

    private Boolean videoCompleted;

    private Boolean lessonCompleted;

    private Boolean shouldReloadLessons;
}