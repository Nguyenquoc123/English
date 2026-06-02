package com.learning.english.dto.response;



import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface TeacherCourseDashboardProjection {

    Long getCourseId();

    String getTitle();

    String getThumbnailUrl();

    String getCourseType();

    BigDecimal getPrice();

    String getStatus();

    LocalDateTime getCreatedAt();

    Long getTotalStudents();

    BigDecimal getTotalRevenue();

    Double getAverageRating();

    Long getTotalReviews();
}