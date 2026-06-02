package com.learning.english.dto.response;



import java.math.BigDecimal;

public interface TeacherDashboardCourseProjection {

    Long getCourseId();

    String getTitle();

    String getThumbnailUrl();

    String getCourseType();

    BigDecimal getPrice();

    String getStatus();

    Long getTotalStudents();

    BigDecimal getTotalRevenue();

    Double getAverageRating();

    Long getTotalReviews();
}