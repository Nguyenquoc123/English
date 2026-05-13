package com.learning.english.repository;

import com.learning.english.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

	boolean existsByUserUserIdAndCourseCourseIdAndHasCourseAccessTrue(Long userId, Long courseId);

	boolean existsByUserUserIdAndCourseCourseIdAndHasExamAccessTrue(Long userId, Long courseId);

	Optional<Enrollment> findByUserUserIdAndCourseCourseId(Long userId, Long courseId);

	Long countByCourseCourseIdAndHasCourseAccessTrue(Long courseId);

	Long countByCourseCourseIdAndHasExamAccessTrue(Long courseId);

	

}