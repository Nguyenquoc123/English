package com.learning.english.dto.response;

import java.math.BigDecimal;
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
public class CourseDetailResponse {

    private Long courseId;

    private String title;

    private String description;

    private String thumbnailUrl;

    private String levelName;

    private String accessType;

    private BigDecimal price;

    private BigDecimal practicePrice;

    private String status;

    private Long lessonCount;

    private Long studentCount;

    private Long examCount;

    private Double rating;

    private BigDecimal revenue;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime submittedAt;

    private LocalDateTime approvedAt;

    private String rejectReason;

    private String teacherName;
    
    private Long levelId;

}