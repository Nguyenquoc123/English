package com.learning.english.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherDashboardResponse {
    private long totalCourses;
    private long publishedCourses;
    private long totalStudents;
    private long totalQuestions;
    private BigDecimal totalRevenue;
    private BigDecimal availableRevenue;
    private long pendingCourses;
    private long rejectedCourses;
    private long pendingWithdrawals;
    private long totalLessons;
    private long totalExams;
    private long totalReviews;
    private double averageRating;
    private List<CourseResponse> recentCourses;
    private List<TeacherEarningItemResponse> recentEarnings;
}
