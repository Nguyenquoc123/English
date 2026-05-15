package com.learning.english.dto.response;

import java.time.LocalDateTime;

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
public class LessonVideoResponse {

    private Long videoId;

    private String title;

    private String videoUrl;

    private String duration;

    private String thumbnailUrl;

    private String status;

    private LocalDateTime createdAt;
}