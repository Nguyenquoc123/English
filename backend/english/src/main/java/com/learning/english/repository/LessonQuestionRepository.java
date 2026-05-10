package com.learning.english.repository;

import com.learning.english.entity.LessonQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonQuestionRepository extends JpaRepository<LessonQuestion, Long> {

	boolean existsByLesson_LessonIdAndQuestion_QuestionId(
            Long lessonId,
            Long questionId
    );
	
	Long countByLessonLessonId(Long lessonId);
}