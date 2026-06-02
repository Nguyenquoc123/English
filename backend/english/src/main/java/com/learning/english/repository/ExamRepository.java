package com.learning.english.repository;

import com.learning.english.dto.response.ChiTietExam;
import com.learning.english.entity.Exam;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExamRepository extends JpaRepository<Exam, Long> {

    List<Exam> findAllByOrderByCreatedAtDesc();

    List<Exam> findByStatusOrderByCreatedAtDesc(String status);

    long countByStatus(String status);

    @Query("""
        SELECT
            e.examId AS examId,
            c.courseId AS courseId,
            c.title AS courseTitle,
            e.title AS title,
            e.description AS description,
            e.durationMinutes AS durationMinutes,
            COUNT(DISTINCT eq.examQuestionId) AS questionCount,
            COALESCE(SUM(eq.point), 0) AS totalPoint,
            e.status AS status,
            e.createdAt AS createdAt,
            e.updatedAt AS updatedAt
        FROM Exam e
        JOIN e.course c
        LEFT JOIN ExamQuestion eq
            ON eq.exam.examId = e.examId
            AND eq.question.status = 'PUBLISHED'
        WHERE c.status <> 'HIDDEN'
          AND e.status <> 'HIDDEN'
          AND (:teacherId IS NULL OR c.teacher.userId = :teacherId)
          AND (:courseId IS NULL OR c.courseId = :courseId)
          AND (:status IS NULL OR e.status = :status)
          AND (
                :keyword IS NULL
                OR LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
        GROUP BY
            e.examId,
            c.courseId,
            c.title,
            e.title,
            e.description,
            e.durationMinutes,
            e.status,
            e.createdAt,
            e.updatedAt
        ORDER BY e.createdAt DESC
        """)
    List<Object[]> findExamListByTeacher(
            @Param("teacherId") Long teacherId,
            @Param("courseId") Long courseId,
            @Param("keyword") String keyword,
            @Param("status") String status
    );

    @Query("""
    	    SELECT
    	        e.examId AS examId,
    	        c.courseId AS courseId,
    	        c.title AS courseTitle,
    	        e.title AS title,
    	        e.description AS description,
    	        e.durationMinutes AS durationMinutes,
    	        COUNT(DISTINCT eq.examQuestionId) AS questionCount,
    	        COALESCE(SUM(eq.point), 0) AS totalPoint,
    	        e.status AS status,
    	        e.createdAt AS createdAt,
    	        e.updatedAt AS updatedAt,
    	        ci.isFreePreview AS isFreePreview
    	    FROM Exam e
    	    JOIN e.course c
    	    JOIN CourseItem ci
    	        ON ci.exam.examId = e.examId
    	        AND ci.itemType = 'EXAM'
    	    LEFT JOIN ExamQuestion eq
    	        ON eq.exam.examId = e.examId
    	        AND eq.question.status = 'PUBLISHED'
    	    WHERE e.examId = :examId
    	      AND c.status <> 'HIDDEN'
    	      AND e.status <> 'HIDDEN'
    	      AND (:teacherId IS NULL OR c.teacher.userId = :teacherId)
    	    GROUP BY
    	        e.examId,
    	        c.courseId,
    	        c.title,
    	        e.title,
    	        e.description,
    	        e.durationMinutes,
    	        e.status,
    	        e.createdAt,
    	        e.updatedAt,
    	        ci.isFreePreview
    	    """)
    	List<Object[]> findExamDetailByTeacher(
    	        @Param("examId") Long examId,
    	        @Param("teacherId") Long teacherId
    	);

    @Query("""
        SELECT e
        FROM Exam e
        JOIN FETCH e.course c
        WHERE e.examId = :examId
          AND c.teacher.userId = :teacherId
          AND e.status <> 'HIDDEN'
          AND c.status <> 'HIDDEN'
        """)
    Optional<Exam> findExamForTeacherAction(
            @Param("examId") Long examId,
            @Param("teacherId") Long teacherId
    );

    @Query("""
        SELECT COUNT(e) > 0
        FROM Exam e
        JOIN e.course c
        WHERE e.examId = :examId
          AND c.teacher.userId = :teacherId
          AND e.status <> 'HIDDEN'
          AND c.status <> 'HIDDEN'
        """)
    boolean existsExamOfTeacher(
            @Param("examId") Long examId,
            @Param("teacherId") Long teacherId
    );

    @Query("""
        SELECT e
        FROM Exam e
        JOIN FETCH e.course c
        WHERE e.examId = :examId
          AND e.status = 'Published'
          AND c.status = 'Published'
        """)
    Optional<Exam> findPublishedExamForStudent(@Param("examId") Long examId);
    
    @Query("""
            SELECT new com.learning.english.dto.response.ChiTietExam(
                e.examId,
                'EXAM',
                e.title,
                e.durationMinutes,
                COUNT(DISTINCT eq.examQuestionId),
                COUNT(DISTINCT a.attemptId),
                MAX(a.score),
                MAX(a.submittedAt),
                c.courseId
            )
            FROM Exam e
            JOIN e.course c
            LEFT JOIN ExamQuestion eq
                ON eq.exam.examId = e.examId
                AND eq.question.status = 'PUBLISHED'
            LEFT JOIN Attempt a
                ON a.exam.examId = e.examId
                AND a.user.userId = :userId
                AND a.attemptType = 'EXAM'
            WHERE e.examId = :examId
              AND e.status = 'PUBLISHED'
            GROUP BY
                e.examId,
                e.title,
                c.courseId,
                e.durationMinutes
        """)
        Optional<ChiTietExam> findChiTietExamByIdAndUserId(
                @Param("examId") Long examId,
                @Param("userId") Long userId
        );

    @Query("""
        SELECT
            e.examId AS examId,
            c.courseId AS courseId,
            c.title AS courseTitle,
            e.title AS title,
            e.description AS description,
            e.durationMinutes AS durationMinutes,
            COUNT(DISTINCT eq.examQuestionId) AS questionCount,
            COALESCE(SUM(eq.point), 0) AS totalPoint,
            e.status AS status,
            e.createdAt AS createdAt,
            e.updatedAt AS updatedAt
        FROM Exam e
        JOIN e.course c
        LEFT JOIN ExamQuestion eq
            ON eq.exam.examId = e.examId
            AND eq.question.status = 'PUBLISHED'
        WHERE c.status = 'PUBLISHED'
          AND e.status <> 'HIDDEN'
          AND (:courseId IS NULL OR c.courseId = :courseId)
          AND (:status IS NULL OR e.status = :status)
          AND (
                :keyword IS NULL
                OR LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
        GROUP BY
            e.examId,
            c.courseId,
            c.title,
            e.title,
            e.description,
            e.durationMinutes,
            e.status,
            e.createdAt,
            e.updatedAt
        ORDER BY e.createdAt DESC
        """)
    List<Object[]> findStudentExamList(
            @Param("courseId") Long courseId,
            @Param("keyword") String keyword,
            @Param("status") String status
    );
    
    
    @Query("""
            SELECT COUNT(e)
            FROM Exam e
            WHERE e.course.teacher.userId = :teacherId
            """)
    long countExamsByTeacherId(@Param("teacherId") Long teacherId);
}
