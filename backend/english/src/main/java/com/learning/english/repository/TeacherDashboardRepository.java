package com.learning.english.repository;


import com.learning.english.dto.response.TeacherChartPointProjection;
import com.learning.english.dto.response.TeacherDashboardCourseProjection;
import com.learning.english.dto.response.TeacherDashboardSummaryProjection;
import com.learning.english.entity.Course;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TeacherDashboardRepository extends JpaRepository<Course, Long> {

    @Query(
            value = """
                    SELECT
                        CAST((
                            SELECT COUNT(*)
                            FROM courses c
                            WHERE c.teacherId = :teacherId
                        ) AS BIGINT) AS totalCourses,

                        CAST((
                            SELECT COUNT(e.userId)
                            FROM enrollments e
                            JOIN courses c ON c.courseId = e.courseId
                            WHERE c.teacherId = :teacherId
                              AND e.hasCourseAccess = 1
                        ) AS BIGINT) AS totalStudents,

                        ISNULL((
                            SELECT SUM(te.withdrawableamount)
                            FROM teacher_earnings te
                            WHERE te.teacherId = :teacherId
                              AND te.status = 'AVAILABLE'
                        ), 0) AS availableRevenue,

                        ISNULL((
                            SELECT SUM(te.netAmount)
                            FROM teacher_earnings te
                            WHERE te.teacherId = :teacherId
                              AND te.createdAt >= :startDate
                              AND te.createdAt < :endDate
                        ), 0) AS periodRevenue,

                        ISNULL((
                            SELECT SUM(te.netAmount)
                            FROM teacher_earnings te
                            WHERE te.teacherId = :teacherId
                        ), 0) AS totalRevenue,

                        CAST((
                            SELECT COUNT(*)
                            FROM courses c
                            WHERE c.teacherId = :teacherId
                              AND c.status = 'PENDING'
                        ) AS BIGINT) AS pendingCourses,

                        CAST((
                            SELECT COUNT(*)
                            FROM courses c
                            WHERE c.teacherId = :teacherId
                              AND c.status = 'REJECTED'
                        ) AS BIGINT) AS rejectedCourses,

                        CAST((
                            SELECT COUNT(*)
                            FROM withdrawals w
                            WHERE w.teacherId = :teacherId
                              AND w.status = 'PENDING'
                        ) AS BIGINT) AS pendingWithdrawals
                    """,
            nativeQuery = true
    )
    TeacherDashboardSummaryProjection getTeacherDashboardSummary(
            @Param("teacherId") Long teacherId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query(
            value = """
                    SELECT
                        CONVERT(VARCHAR(10), te.createdAt, 23) AS label,
                        CAST(ISNULL(SUM(te.netAmount), 0) AS DECIMAL(18,2)) AS value
                    FROM teacher_earnings te
                    WHERE te.teacherId = :teacherId
                      AND te.createdAt >= :startDate
                      AND te.createdAt < :endDate
                    GROUP BY CONVERT(VARCHAR(10), te.createdAt, 23)
                    ORDER BY label
                    """,
            nativeQuery = true
    )
    List<TeacherChartPointProjection> getRevenueDailyChart(
            @Param("teacherId") Long teacherId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query(
            value = """
                    SELECT
                        CONVERT(VARCHAR(10), e.createdAt, 23) AS label,
                        CAST(COUNT(e.enrollmentId) AS DECIMAL(18,2)) AS value
                    FROM enrollments e
                    JOIN courses c ON c.courseId = e.courseId
                    WHERE c.teacherId = :teacherId
                      AND e.hasCourseAccess = 1
                      AND e.createdAt >= :startDate
                      AND e.createdAt < :endDate
                    GROUP BY CONVERT(VARCHAR(10), e.createdAt, 23)
                    ORDER BY label
                    """,
            nativeQuery = true
    )
    List<TeacherChartPointProjection> getStudentDailyChart(
            @Param("teacherId") Long teacherId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query(
            value = """
                    SELECT
                        CONCAT(N'Tháng ', MONTH(te.createdAt)) AS label,
                        CAST(ISNULL(SUM(te.netAmount), 0) AS DECIMAL(18,2)) AS value
                    FROM teacher_earnings te
                    WHERE te.teacherId = :teacherId
                      AND te.createdAt >= :startDate
                      AND te.createdAt < :endDate
                    GROUP BY MONTH(te.createdAt)
                    ORDER BY MONTH(te.createdAt)
                    """,
            nativeQuery = true
    )
    List<TeacherChartPointProjection> getRevenueMonthlyChart(
            @Param("teacherId") Long teacherId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query(
            value = """
                    SELECT
                        CONCAT(N'Tháng ', MONTH(e.createdAt)) AS label,
                        CAST(COUNT(e.enrollmentId) AS DECIMAL(18,2)) AS value
                    FROM enrollments e
                    JOIN courses c ON c.courseId = e.courseId
                    WHERE c.teacherId = :teacherId
                      AND e.hasCourseAccess = 1
                      AND e.createdAt >= :startDate
                      AND e.createdAt < :endDate
                    GROUP BY MONTH(e.createdAt)
                    ORDER BY MONTH(e.createdAt)
                    """,
            nativeQuery = true
    )
    List<TeacherChartPointProjection> getStudentMonthlyChart(
            @Param("teacherId") Long teacherId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query(
            value = """
                    SELECT
                        c.courseId AS courseId,
                        c.title AS title,
                        c.thumbnailUrl AS thumbnailUrl,
                        c.courseType AS courseType,
                        c.price AS price,
                        c.status AS status,

                        ISNULL(en.totalStudents, 0) AS totalStudents,
                        ISNULL(er.totalRevenue, 0) AS totalRevenue,
                        ISNULL(rv.averageRating, 0) AS averageRating,
                        ISNULL(rv.totalReviews, 0) AS totalReviews

                    FROM courses c

                    LEFT JOIN (
                        SELECT
                            e.courseId,
                            COUNT(e.enrollmentId) AS totalStudents
                        FROM enrollments e
                        WHERE e.hasCourseAccess = 1
                        GROUP BY e.courseId
                    ) en ON en.courseId = c.courseId

                    LEFT JOIN (
                        SELECT
                            te.courseId,
                            SUM(te.netAmount) AS totalRevenue
                        FROM teacher_earnings te
                        WHERE te.teacherId = :teacherId
                          AND te.createdAt >= :startDate
                          AND te.createdAt < :endDate
                        GROUP BY te.courseId
                    ) er ON er.courseId = c.courseId

                    LEFT JOIN (
                        SELECT
                            cr.courseId,
                            AVG(CAST(cr.rating AS FLOAT)) AS averageRating,
                            COUNT(cr.reviewId) AS totalReviews
                        FROM course_reviews cr
                        GROUP BY cr.courseId
                    ) rv ON rv.courseId = c.courseId

                    WHERE c.teacherId = :teacherId

                    ORDER BY ISNULL(er.totalRevenue, 0) DESC, c.createdAt DESC
                    """,
            nativeQuery = true
    )
    List<TeacherDashboardCourseProjection> findTeacherDashboardCourses(
            @Param("teacherId") Long teacherId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );
}