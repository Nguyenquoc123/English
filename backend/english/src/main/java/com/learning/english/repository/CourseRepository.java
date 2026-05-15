package com.learning.english.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.Course;

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
			            OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
			            OR LOWER(c.teacher.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
			            OR LOWER(c.teacher.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
			      )
			""")
	Page<Course> searchCourses(@Param("username") String username, @Param("status") String status,
			@Param("keyword") String keyword, @Param("levelId") Long levelId, Pageable pageable);
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
                    OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
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
                c.courseid AS courseId,
                c.title AS title,
                c.description AS description,
                c.thumbnailurl AS thumbnailUrl,
                l.levelname AS levelName,
                c.coursetype AS accessType,
                c.price AS price,
                c.examprice AS practicePrice,
                c.status AS status,
                ISNULL(lessonStats.lessonCount, 0) AS lessonCount,
                ISNULL(enrollmentStats.studentCount, 0) AS studentCount,
                ISNULL(examStats.examCount, 0) AS examCount,
                ISNULL(reviewStats.rating, 0) AS rating,
                ISNULL(revenueStats.revenue, 0) AS revenue,
                c.createdat AS createdAt,
                c.updatedat AS updatedAt,
                c.submittedat AS submittedAt,
                c.reviewedat AS approvedAt,
                c.rejectreason AS rejectReason,
                u.fullname AS teacherName,
                l.levelId AS levelId
            FROM courses c
            LEFT JOIN levels l ON c.levelid = l.levelid
            LEFT JOIN users u ON c.teacherid = u.userid
            LEFT JOIN (
                SELECT courseid, COUNT(*) AS lessonCount
                FROM lessons WHERE status <> 'Deleted' GROUP BY courseid
            ) lessonStats ON c.courseid = lessonStats.courseid
            LEFT JOIN (
                SELECT courseid, COUNT(*) AS studentCount
                FROM enrollments WHERE hascourseaccess = 1 GROUP BY courseid
            ) enrollmentStats ON c.courseid = enrollmentStats.courseid
            LEFT JOIN (
                SELECT courseid, COUNT(*) AS examCount
                FROM exams WHERE status <> 'Deleted' GROUP BY courseid
            ) examStats ON c.courseid = examStats.courseid
            LEFT JOIN (
                SELECT courseid, AVG(CAST(rating AS FLOAT)) AS rating
                FROM course_reviews GROUP BY courseid
            ) reviewStats ON c.courseid = reviewStats.courseid
            LEFT JOIN (
                SELECT targetId, SUM(amount) AS revenue
                FROM transactions WHERE status = 'Paid' AND targetId IS NOT NULL GROUP BY targetId
            ) revenueStats ON c.courseid = revenueStats.targetId
            WHERE c.courseid = :courseId AND c.status <> 'Deleted'
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
}
