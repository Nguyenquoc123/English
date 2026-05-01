package com.learning.english.repository;

import com.learning.english.entity.Vocabulary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {

    List<Vocabulary> findAllByLessonLessonIdOrderByDisplayOrderAsc(Long lessonId);
}