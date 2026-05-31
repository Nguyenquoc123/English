package com.learning.english.repository;

import com.learning.english.entity.CourseReview;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseReviewRepository extends JpaRepository<CourseReview, Long> {

    
    List<CourseReview> findAllByOrderByCreatedAtDesc();

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
    
    @Query("""
            SELECT COUNT(r)
            FROM CourseReview r
            WHERE r.course.teacher.userId = :teacherId
            """)
    long countReviewsByTeacherId(@Param("teacherId") Long teacherId);

    @Query("""
            SELECT COALESCE(AVG(r.rating), 0)
            FROM CourseReview r
            WHERE r.course.teacher.userId = :teacherId
            """)
    Double getAverageRatingByTeacherId(@Param("teacherId") Long teacherId);
    
    @Query("""
            SELECT COALESCE(AVG(cr.rating), 0)
            FROM CourseReview cr
            WHERE cr.course.teacher.userId = :teacherId
            """)
    Double getTeacherAverageRating(@Param("teacherId") Long teacherId);

    @Query("""
            SELECT COUNT(cr)
            FROM CourseReview cr
            WHERE cr.course.teacher.userId = :teacherId
            """)
    long countTeacherReviews(@Param("teacherId") Long teacherId);
}
