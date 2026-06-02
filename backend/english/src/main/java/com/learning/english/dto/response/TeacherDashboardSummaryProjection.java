package com.learning.english.dto.response;



import java.math.BigDecimal;

public interface TeacherDashboardSummaryProjection {

    Long getTotalCourses();

    Long getTotalStudents();

    BigDecimal getAvailableRevenue();

    BigDecimal getPeriodRevenue();

    BigDecimal getTotalRevenue();

    Long getPendingCourses();

    Long getRejectedCourses();

    Long getPendingWithdrawals();
}