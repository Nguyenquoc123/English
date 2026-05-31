package com.learning.english.repository;

import com.learning.english.dto.response.TeacherChartPointProjection;
import com.learning.english.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

	@Query("""
			SELECT e FROM Enrollment e
			JOIN FETCH e.course c
			LEFT JOIN FETCH c.level
			LEFT JOIN FETCH c.teacher
			WHERE e.user.userId = :userId AND e.hasCourseAccess = true
			ORDER BY e.createdAt DESC
			""")
	List<Enrollment> findPurchasedByUserId(@Param("userId") Long userId);

	boolean existsByUserUserIdAndCourseCourseIdAndHasCourseAccessTrue(Long userId, Long courseId);

	

	Optional<Enrollment> findByUserUserIdAndCourseCourseId(Long userId, Long courseId);

	List<Enrollment> findByCourseTransactionItem_Transaction_TransactionId(Long transactionId);

	Long countByCourseCourseIdAndHasCourseAccessTrue(Long courseId);

	@Query("""
            SELECT COUNT(e)
            FROM Enrollment e
            WHERE e.course.teacher.userId = :teacherId
              AND e.hasCourseAccess = true
            """)
    long countStudentsByTeacherId(@Param("teacherId") Long teacherId);

	@Query("""
            SELECT COUNT(e)
            FROM Enrollment e
            WHERE e.course.teacher.userId = :teacherId
              AND e.hasCourseAccess = true
            """)
    long countTeacherTotalStudents(@Param("teacherId") Long teacherId);

    @Query("""
            SELECT COUNT(e)
            FROM Enrollment e
            WHERE e.course.teacher.userId = :teacherId
              AND e.hasCourseAccess = true
              AND e.createdAt >= :startDate
              AND e.createdAt < :endDate
            """)
    long countTeacherPeriodStudents(
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
                        FORMAT(e.createdAt, 'yyyy-MM') AS label,
                        CAST(COUNT(e.enrollmentId) AS DECIMAL(18,2)) AS value
                    FROM enrollments e
                    JOIN courses c ON c.courseId = e.courseId
                    WHERE c.teacherId = :teacherId
                      AND e.hasCourseAccess = 1
                      AND e.createdAt >= :startDate
                      AND e.createdAt < :endDate
                    GROUP BY FORMAT(e.createdAt, 'yyyy-MM')
                    ORDER BY label
                    """,
            nativeQuery = true
    )
    List<TeacherChartPointProjection> getStudentMonthlyChart(
            @Param("teacherId") Long teacherId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

}