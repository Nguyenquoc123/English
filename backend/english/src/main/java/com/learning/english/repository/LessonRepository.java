package com.example.backend.repository;

import com.example.backend.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findAllByCourseCourseIdOrderByLessonOrderAsc(Long courseId);

    List<Lesson> findAllByCourseCourseIdAndStatusOrderByLessonOrderAsc(Long courseId, String status);

    List<Lesson> findByLessonTypeOrderByCreatedAtDesc(String lessonType);
}