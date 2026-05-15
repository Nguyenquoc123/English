package com.learning.english.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoRequest {

    private Long lessonId;

    private String title;

    private String videoUrl;

    private Integer durationSeconds;

    private String thumbnailUrl;

    private Integer displayOrder;
}