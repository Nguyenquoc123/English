package com.learning.english.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {
    private long totalUsers;
    private long totalStudents;
    private long totalTeachers;
    private long totalCourses;
    private long pendingTeachers;
    private long pendingCourses;
    private long pendingWithdrawals;
    private BigDecimal totalRevenue;
}
