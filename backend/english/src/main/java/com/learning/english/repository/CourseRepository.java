package com.learning.english.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long>{
	List<Course> findAllByStatusNot(String status);
	
	List<Course> findByTeacher_UserIdAndStatusNot(Long teacherId, String status);
}
