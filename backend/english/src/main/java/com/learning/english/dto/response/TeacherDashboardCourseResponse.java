package com.learning.english.dto.response;



import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDashboardCourseResponse {

    private Long courseId;

    private String title;

    private String thumbnailUrl;

    private String courseType;

    private BigDecimal price;

    private String status;

    private Long totalStudents;

    private BigDecimal totalRevenue;

    private Double averageRating;

    private Long totalReviews;
}