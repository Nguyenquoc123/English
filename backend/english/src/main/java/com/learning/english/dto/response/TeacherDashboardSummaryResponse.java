package com.learning.english.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDashboardSummaryResponse {

    private Long totalCourses;

    private Long totalStudents;

    private BigDecimal availableRevenue;

    private BigDecimal periodRevenue;

    private BigDecimal totalRevenue;

    private Long pendingCourses;

    private Long rejectedCourses;

    private Long pendingWithdrawals;
}