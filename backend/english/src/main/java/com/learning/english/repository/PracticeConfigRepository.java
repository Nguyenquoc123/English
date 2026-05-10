package com.learning.english.repository;

import com.learning.english.entity.LessonPracticeConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface PracticeConfigRepository extends JpaRepository<LessonPracticeConfig, Long> {

    boolean existsByLesson_LessonIdAndPracticeType(
            Long lessonId,
            String practiceType
    );
}