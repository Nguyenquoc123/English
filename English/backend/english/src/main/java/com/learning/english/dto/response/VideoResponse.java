package com.learning.english.dto.response;

import java.time.LocalDateTime;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoResponse {

    private Long videoId;

    private Long lessonId;

    private String title;

    private String videoUrl;

    private Integer durationSeconds;

    private String thumbnailUrl;

    private Integer displayOrder;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}