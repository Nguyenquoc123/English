package com.learning.english.repository;

import com.learning.english.entity.Exam;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
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
                e.maxAttempts AS maxAttempts,
                COUNT(DISTINCT eq.examQuestionId) AS questionCount,
                COALESCE(SUM(eq.point), 0) AS totalPoint,
                e.status AS status,
                e.startTime AS startTime,
                e.endTime AS endTime,
                e.createdAt AS createdAt
            FROM Exam e
            JOIN e.course c
            LEFT JOIN ExamQuestion eq
                ON eq.exam.examId = e.examId
                AND eq.question.status = 'Published'
            WHERE c.status = 'Published'
              AND e.status <> 'Deleted'
              AND (:courseId IS NULL OR c.courseId = :courseId)
              AND (:status IS NULL OR e.status = :status)
              AND (
                    :keyword IS NULL
                    OR LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            GROUP BY
                e.examId, c.courseId, c.title, e.title, e.description,
                e.durationMinutes, e.maxAttempts, e.status,
                e.startTime, e.endTime, e.createdAt
            ORDER BY e.createdAt DESC
            """)
    List<Object[]> findStudentExamList(@Param("courseId") Long courseId, @Param("keyword") String keyword,
            @Param("status") String status);

    @Query("""
            SELECT
                e.examId AS examId,
                c.courseId AS courseId,
                c.title AS courseTitle,
                e.title AS title,
                e.description AS description,
                e.durationMinutes AS durationMinutes,
                COUNT(DISTINCT eq.examQuestionId) AS questionCount,
                e.status AS status,
                e.startTime AS startTime,
                e.endTime AS endTime,
                e.createdAt AS createdAt
            FROM Exam e
            JOIN e.course c
            LEFT JOIN ExamQuestion eq
                ON eq.exam.examId = e.examId
                AND eq.question.status = 'Published'
            WHERE c.status <> 'Deleted'
              AND (:teacherId IS NULL OR c.teacher.userId = :teacherId)
              AND e.status <> 'Deleted'
              AND (:courseId IS NULL OR c.courseId = :courseId)
              AND (:status IS NULL OR e.status = :status)
              AND (
                    :keyword IS NULL
                    OR LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            GROUP BY
                e.examId, c.courseId, c.title, e.title, e.description,
                e.durationMinutes, e.status, e.startTime, e.endTime, e.createdAt
            ORDER BY e.createdAt DESC
            """)
    List<Object[]> findExamListByTeacher(@Param("teacherId") Long teacherId, @Param("courseId") Long courseId,
            @Param("keyword") String keyword, @Param("status") String status);
}