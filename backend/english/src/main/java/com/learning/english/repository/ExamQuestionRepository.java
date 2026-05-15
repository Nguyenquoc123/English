package com.learning.english.repository;

import com.learning.english.entity.ExamQuestion;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, Long> {

	@Query("""
			    SELECT COALESCE(MAX(eq.questionOrder), 0)
			    FROM ExamQuestion eq
			    WHERE eq.exam.examId = :examId
			""")
	Integer findMaxQuestionOrderByExamId(@Param("examId") Long examId);

	boolean existsByExamExamIdAndQuestionQuestionId(Long examId, Long questionId);

	@Query("""
			    SELECT eq
			    FROM ExamQuestion eq
			    JOIN FETCH eq.exam e
			    JOIN FETCH e.course c
			    JOIN FETCH eq.question q
			    WHERE eq.examQuestionId = :examQuestionId
			      AND e.examId = :examId
			      AND c.teacher.userId = :teacherId
			      AND e.status <> 'Deleted'
			      AND c.status <> 'Deleted'
			""")
	Optional<ExamQuestion> findExamQuestionForTeacherAction(@Param("examId") Long examId,
			@Param("examQuestionId") Long examQuestionId, @Param("teacherId") Long teacherId);

	@Query("""
			    SELECT
			        eq.examQuestionId,
			        q.questionId,
			        eq.questionOrder,
			        eq.point,
			        q.questionType,
			        q.content,
			        q.mediaUrl,
			        q.status,
			        q.explanation
			    FROM ExamQuestion eq
			    JOIN eq.exam e
			    JOIN e.course c
			    JOIN eq.question q
			    WHERE e.examId = :examId
			      AND c.teacher.userId = :teacherId
			      AND e.status <> 'Deleted'
			      AND c.status <> 'Deleted'
			      AND q.status <> 'Deleted'
			    ORDER BY eq.questionOrder ASC, eq.examQuestionId ASC
			""")
	List<Object[]> findTeacherExamQuestions(@Param("examId") Long examId, @Param("teacherId") Long teacherId);

	@Query("""
			    SELECT eq
			    FROM ExamQuestion eq
			    JOIN FETCH eq.question q
			    LEFT JOIN FETCH q.options
			    WHERE eq.exam.examId = :examId
			      AND q.status = 'Published'
			    ORDER BY eq.questionOrder ASC
			""")
	List<ExamQuestion> findStudentQuestionsByExamId(@Param("examId") Long examId);
	
	
}