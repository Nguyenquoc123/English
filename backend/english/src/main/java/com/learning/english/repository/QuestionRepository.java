package com.learning.english.repository;

import com.learning.english.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findAllByLessonLessonId(Long lessonId);

    List<Question> findAllByCourseCourseId(Long courseId);

    List<Question> findAllByLessonLessonIdAndQuestionType(Long lessonId, String questionType);
}