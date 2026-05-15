package com.learning.english.repository;

import com.learning.english.entity.Vocabulary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {

	List<Vocabulary> findAllByLessonLessonIdOrderByDisplayOrderAsc(Long lessonId);

	@Query("""
			    SELECT MAX(v.displayOrder)
			    FROM Vocabulary v
			    WHERE v.lesson.lessonId = :lessonId
			""")
	Integer findMaxDisplayOrderByLessonId(@Param("lessonId") Long lessonId);

	List<Vocabulary> findByLesson_LessonIdOrderByVocabularyIdAsc(Long lessonId);
	
	Long countByLessonLessonId(Long lessonId);
}