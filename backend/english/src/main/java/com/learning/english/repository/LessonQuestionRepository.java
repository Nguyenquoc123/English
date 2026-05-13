package com.learning.english.repository;

import com.learning.english.entity.LessonQuestion;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LessonQuestionRepository extends JpaRepository<LessonQuestion, Long> {

	boolean existsByLesson_LessonIdAndQuestion_QuestionId(
            Long lessonId,
            Long questionId
    );

	Long countByLessonLessonId(Long lessonId);

	@Query("""
			    SELECT DISTINCT lq
			    FROM LessonQuestion lq
			    JOIN FETCH lq.lesson l
			    JOIN FETCH l.course c
			    JOIN FETCH lq.question q
			    LEFT JOIN FETCH q.options o
			    WHERE l.lessonId = :lessonId
			      AND l.status = 'Published'
			      AND c.status = 'Published'
			      AND q.questionType = :practiceType
			      AND q.status = 'Published'
			    ORDER BY lq.lessonQuestionId ASC
			""")
	List<LessonQuestion> findStudentQuestionsByLessonIdAndPracticeType(@Param("lessonId") Long lessonId,
			@Param("practiceType") String practiceType);
}