package com.learning.english.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.learning.english.dto.response.TeacherCourseDashboardProjection;
import com.learning.english.dto.response.TeacherDashboardCourseResponse;
import com.learning.english.entity.Course;
import com.learning.english.entity.CourseReview;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

	

	List<Course> findAllByStatusNot(String status);

	@EntityGraph(attributePaths = { "teacher", "level" })
	@Query("""
			    SELECT c
			    FROM Course c
			    WHERE c.status <> 'Deleted'
			      AND (:username IS NULL OR c.teacher.username = :username)
			""")
	List<Course> dsKhoaHocCuaTeacher(@Param("username") String username);

	@EntityGraph(attributePaths = { "teacher", "level" })
	@Query("""
			    SELECT c
			    FROM Course c
			    WHERE c.status <> 'Deleted'
			      AND (:username IS NULL OR c.teacher.username = :username)
			      AND (:status IS NULL OR c.status = :status)
			      AND (:levelId IS NULL OR c.level.levelId = :levelId)
			      AND (
			            :keyword IS NULL
			            OR LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
			            OR LOWER(c.teacher.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
			            OR LOWER(c.teacher.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
			      )
			""")
	Page<Course> searchCourses(@Param("username") String username, @Param("status") String status,
			@Param("keyword") String keyword, @Param("levelId") Long levelId, Pageable pageable);
	
	
	
	@EntityGraph(attributePaths = { "teacher", "level" })
	@Query("""
	        SELECT DISTINCT c
	        FROM Course c
	        JOIN Enrollment e ON e.course = c
	        WHERE c.status = 'Published'
	          AND e.hasCourseAccess = true
	          AND e.user.username = :username
	          AND (:levelId IS NULL OR c.level.levelId = :levelId)
	          AND (
	                :keyword IS NULL
	                OR :keyword = ''
	                OR LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
	                OR LOWER(c.teacher.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
	                OR LOWER(c.teacher.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
	          )
	        """)
	Page<Course> dsKhoaHocDaMua(
	        @Param("username") String username,
	        @Param("keyword") String keyword,
	        @Param("levelId") Long levelId,
	        Pageable pageable
	);

	boolean existsByCourseIdAndTeacherUserId(Long courseId, Long userId);

	@Query("""
			SELECT c
			FROM Course c
			LEFT JOIN FETCH c.teacher t
			LEFT JOIN FETCH c.level l
			WHERE c.status <> 'Deleted'
			  AND (:username IS NULL OR t.username = :username)
			  AND (:status IS NULL OR c.status = :status)
			  AND (
			        :keyword IS NULL
			        OR LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
			        OR LOWER(t.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
			        OR LOWER(t.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
			  )
			  AND (:levelId IS NULL OR l.levelId = :levelId)
			ORDER BY c.createdAt DESC
			""")
	List<Course> searchCourses(@Param("username") String username, @Param("status") String status,
			@Param("keyword") String keyword, @Param("levelId") Long levelId);

	List<Course> findByTeacher_UserIdAndStatusNot(Long teacherId, String status);

	@Query(value = """
			SELECT
			    c.courseId AS courseId,
			    c.title AS title,
			    c.description AS description,
			    c.thumbnailUrl AS thumbnailUrl,
			    l.levelName AS levelName,
			    c.courseType AS accessType,
			    c.price AS price,
			    c.status AS status,
			    ISNULL(lessonStats.lessonCount, 0) AS lessonCount,
			    ISNULL(enrollmentStats.studentCount, 0) AS studentCount,
			    ISNULL(reviewStats.rating, 0) AS rating,
			    ISNULL(revenueStats.revenue, 0) AS revenue,
			    c.createdAt AS createdAt,
			    c.updatedAt AS updatedAt,
			    c.submittedAt AS submittedAt,
			    c.reviewedAt AS approvedAt,
			    c.rejectReason AS rejectReason,
			    u.fullName AS teacherName,
			    l.levelId AS levelId,
			    c.shortDescription
			FROM courses c
			LEFT JOIN levels l
			    ON c.levelId = l.levelId
			LEFT JOIN users u
			    ON c.teacherId = u.userId
			LEFT JOIN (
			    SELECT
			        courseId,
			        COUNT(*) AS lessonCount
			    FROM lessons
			    WHERE status <> 'HIDDEN'
			    GROUP BY courseId
			) lessonStats
			    ON c.courseId = lessonStats.courseId
			LEFT JOIN (
			    SELECT
			        courseId,
			        COUNT(*) AS studentCount
			    FROM enrollments
			    WHERE hasCourseAccess = 1
			    GROUP BY courseId
			) enrollmentStats
			    ON c.courseId = enrollmentStats.courseId
			LEFT JOIN (
			    SELECT
			        courseId,
			        AVG(CAST(rating AS FLOAT)) AS rating
			    FROM course_reviews
			    GROUP BY courseId
			) reviewStats
			    ON c.courseId = reviewStats.courseId
			LEFT JOIN (
			    SELECT
			        ti.courseId,
			        SUM(ti.price) AS revenue
			    FROM transaction_items ti
			    INNER JOIN transactions t
			        ON ti.transactionId = t.transactionId
			    WHERE t.status = 'SUCCESS'
			    GROUP BY ti.courseId
			) revenueStats
			    ON c.courseId = revenueStats.courseId
			WHERE c.courseId = :courseId
			  AND c.status <> 'HIDDEN'
			""", nativeQuery = true)
	List<Object[]> chiTietKhoaHoc(@Param("courseId") Long courseId);

	@Query("""
			SELECT c FROM Course c
			JOIN FETCH c.teacher t
			WHERE c.courseId = :courseId
			  AND t.username = :username
			  AND c.status <> 'Deleted'
			""")
	Optional<Course> findCourseOfTeacher(@Param("courseId") Long courseId, @Param("username") String username);

	@Query("""
			SELECT c FROM Course c
			LEFT JOIN FETCH c.teacher t
			LEFT JOIN FETCH c.level l
			WHERE c.courseId = :courseId AND c.status <> 'Deleted'
			""")
	Optional<Course> findCourseForAdminReview(@Param("courseId") Long courseId);

	@Query("""
			SELECT c FROM Course c
			LEFT JOIN FETCH c.teacher t
			LEFT JOIN FETCH c.level l
			WHERE c.courseId = :courseId AND c.status = 'Published'
			""")
	Optional<Course> findPublishedCourseDetail(@Param("courseId") Long courseId);

	@Query("""
			SELECT COUNT(c) FROM Course c
			WHERE c.teacher.userId = :teacherId AND c.status = 'Published'
			""")
	Long countPublishedCourseByTeacher(@Param("teacherId") Long teacherId);

	Optional<Course> findByCourseIdAndStatus(Long courseId, String status);

	long countByStatus(String status);

	List<Course> findByStatusOrderByCreatedAtDesc(String status);

	List<Course> findAllByOrderByCreatedAtDesc();
	
	
	@Query("""
            SELECT c
            FROM Course c
            LEFT JOIN FETCH c.level l
            WHERE c.status IN ('APPROVED', 'PUBLISHED')
            ORDER BY c.createdAt DESC
            """)
    List<Course> findPublishedOrApprovedCourses(Pageable pageable);

    @Query("""
            SELECT c
            FROM Course c
            LEFT JOIN FETCH c.level l
            WHERE c.status IN ('APPROVED', 'PUBLISHED')
              AND (:budgetMax IS NULL OR c.price <= :budgetMax)
              AND (
                    :keyword IS NULL
                    OR LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(c.shortDescription) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            ORDER BY c.createdAt DESC
            """)
    List<Course> findCandidateCourses(
            @Param("budgetMax") BigDecimal budgetMax,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query("""
            SELECT c
            FROM Course c
            LEFT JOIN FETCH c.level l
            WHERE c.courseId IN :courseIds
            """)
    List<Course> findByCourseIdInWithLevel(@Param("courseIds") Collection<Long> courseIds);
    
    long countByTeacher_UserId(Long teacherId);

    long countByTeacher_UserIdAndStatus(Long teacherId, String status);

    @Query("""
            SELECT c
            FROM Course c
            LEFT JOIN FETCH c.level l
            WHERE c.teacher.userId = :teacherId
            ORDER BY c.createdAt DESC
            """)
    List<Course> findRecentCoursesByTeacherId(
            @Param("teacherId") Long teacherId,
            Pageable pageable
    );
    
    
    @Query("""
            SELECT c
            FROM Course c
            WHERE c.status IN ('PUBLISHED', 'APPROVED')
            ORDER BY c.createdAt DESC
            """)
    List<Course> findPublishedOrApprovedCoursesOrderByNewest(Pageable pageable);

    @Query("""
            SELECT c
            FROM Course c
            WHERE c.status IN ('PUBLISHED', 'APPROVED')
              AND (
                    LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                 OR LOWER(c.shortDescription) LIKE LOWER(CONCAT('%', :keyword, '%'))
                 OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                 OR LOWER(c.courseType) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            ORDER BY c.createdAt DESC
            """)
    List<Course> searchPublishedOrApprovedCourses(
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query("""
            SELECT c
            FROM Course c
            WHERE c.status IN ('PUBLISHED', 'APPROVED')
              AND (
                    UPPER(c.courseType) = 'FREE'
                 OR c.price = 0
              )
            ORDER BY c.createdAt DESC
            """)
    List<Course> findFreePublishedOrApprovedCourses(Pageable pageable);

    @Query("""
            SELECT c
            FROM Course c
            WHERE c.status IN ('PUBLISHED', 'APPROVED')
              AND c.price IS NOT NULL
              AND c.price <= :budgetMax
            ORDER BY c.price ASC
            """)
    List<Course> findPublishedOrApprovedCoursesByBudget(
            @Param("budgetMax") BigDecimal budgetMax,
            Pageable pageable
    );

    @Query("""
            SELECT c
            FROM Course c
            WHERE c.status IN ('PUBLISHED', 'APPROVED')
            ORDER BY c.price ASC
            """)
    List<Course> findPublishedOrApprovedCoursesOrderByPriceAsc(Pageable pageable);
    
    
    long countByTeacherUserId(Long teacherId);

    long countByTeacherUserIdAndStatus(Long teacherId, String status);

    @Query(
            value = """
                    SELECT
                        c.courseId AS courseId,
                        c.title AS title,
                        c.thumbnailUrl AS thumbnailUrl,
                        c.courseType AS courseType,
                        c.price AS price,
                        c.status AS status,
                        c.createdAt AS createdAt,

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
                          AND e.createdAt >= :startDate
                          AND e.createdAt < :endDate
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
    List<TeacherCourseDashboardProjection> findTeacherDashboardCourses(
            @Param("teacherId") Long teacherId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );
}
