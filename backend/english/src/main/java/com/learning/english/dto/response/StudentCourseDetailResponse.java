package com.learning.english.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentCourseDetailResponse {

    private Long courseId;

    private String title;

    private String shortDescription;

    private String description;

    private String thumbnailUrl;

    private Long levelId;

    private String levelName;

    private String accessType;

    private String courseType;

    private BigDecimal price;

    private BigDecimal originalPrice;

    private String status;

    private Long teacherId;

    private String teacherName;

    private String teacherAvatarUrl;

    private String teacherBio;

    private Long teacherCourseCount;

    private Long lessonCount;

    private Long studentCount;

    private Double rating;

    private Long reviewCount;

    private Boolean isEnrolled;
}