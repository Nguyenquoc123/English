package com.learning.english.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.Lesson;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long>{
	List<Lesson> findByCourse_CourseId(Long courseId);
	
	List<Lesson> findByCourse_CourseIdAndStatus(Long courseId, String status);
	
	
}
