package com.learning.english.repository;

import com.learning.english.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
	@Query("""
			    SELECT DISTINCT q
			    FROM LessonQuestion lq
			    JOIN lq.question q
			    LEFT JOIN FETCH q.options qo
			    WHERE lq.lesson.lessonId = :lessonId
			      AND q.status <> 'Deleted'
			    ORDER BY q.questionId ASC
			""")
	List<Question> findQuestionsByLessonId(@Param("lessonId") Long lessonId);

	@Query("""
			    SELECT DISTINCT q
			    FROM Question q
			    LEFT JOIN FETCH q.options o
			    WHERE q.createdBy.username = :username
			      AND q.questionType = :questionType
			      AND q.status <> 'Deleted'
			    ORDER BY q.createdAt DESC
			""")
	List<Question> findMyQuestionBankByType(@Param("username") String username,
			@Param("questionType") String questionType);

	@Query("""
			    SELECT DISTINCT q
			    FROM Question q
			    LEFT JOIN FETCH q.options o
			    WHERE q.createdBy.username = :username
			      AND q.questionType = :questionType
			      AND q.questionId IN :questionIds
			      AND q.status <> 'Deleted'
			""")
	List<Question> findMyQuestionsByIdsAndType(@Param("username") String username,
			@Param("questionType") String questionType, @Param("questionIds") List<Long> questionIds);

	@Query("""
			    SELECT DISTINCT q
			    FROM LessonQuestion lq
			    JOIN lq.lesson l
			    JOIN lq.question q
			    LEFT JOIN FETCH q.options o
			    WHERE l.lessonId = :lessonId
			      AND q.questionType = :practiceType
			      AND q.status = 'Published'
			      AND l.status = 'Published'
			      AND l.course.status = 'Published'
			""")
	List<Question> findPublishedPracticeQuestionsByLessonAndType(@Param("lessonId") Long lessonId,
			@Param("practiceType") String practiceType);
}