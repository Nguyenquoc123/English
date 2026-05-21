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
public class LessonListResponse {

    private Long courseItemId;

    private Long id;

    private String title;

    private String description;

    private String type;
    
    private String status;

    private Integer itemOrder;

    private LocalDateTime createdAt;
}