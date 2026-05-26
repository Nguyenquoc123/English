package com.learning.english.repository;

import com.learning.english.entity.Attempt;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AttemptRepository extends JpaRepository<Attempt, Long> {
	@Query("""
			    SELECT a
			    FROM Attempt a
			    JOIN FETCH a.user u
			    LEFT JOIN FETCH a.lesson l
			    LEFT JOIN FETCH a.exam e
			    WHERE a.attemptId = :attemptId
			""")
	Optional<Attempt> findPracticeResultByAttemptId(@Param("attemptId") Long attemptId);

	Long countByUserUserIdAndExamExamIdAndAttemptType(Long userId, Long examId, String attemptType);

	Long countByExamExamIdAndUserUserId(Long examId, Long userId);

	boolean existsByUserUserIdAndExamExamId(Long userId, Long examId);
	
	List<Attempt> findByUser_UserIdAndLesson_LessonIdAndPracticeTypeOrderByStartedAtDesc(Long userId, Long lessonId, String practiceType);
	
	List<Attempt> findByUser_UserIdAndExam_ExamIdOrderByStartedAtDesc(Long userId, Long examId);
}