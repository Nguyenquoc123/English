package com.learning.english.repository;

import com.learning.english.entity.CourseReview;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseReviewRepository extends JpaRepository<CourseReview, Long> {

    @Query("""
        SELECT r
        FROM CourseReview r
        JOIN FETCH r.user u
        WHERE r.course.courseId = :courseId
        ORDER BY r.createdAt DESC
    """)
    List<CourseReview> findReviewsByCourseId(
            @Param("courseId") Long courseId
    );

    Optional<CourseReview> findByCourseCourseIdAndUserUserId(
            Long courseId,
            Long userId
    );

    @Query("""
        SELECT COALESCE(AVG(r.rating), 0)
        FROM CourseReview r
        WHERE r.course.courseId = :courseId
    """)
    Double avgRatingByCourseId(
            @Param("courseId") Long courseId
    );

    @Query("""
        SELECT COUNT(r)
        FROM CourseReview r
        WHERE r.course.courseId = :courseId
    """)
    Long countReviewsByCourseId(
            @Param("courseId") Long courseId
    );
}