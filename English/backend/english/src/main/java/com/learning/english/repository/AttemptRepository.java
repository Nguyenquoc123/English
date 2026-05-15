package com.learning.english.repository;

import com.learning.english.entity.Attempt;

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
			    WHERE a.attemptId = :attemptId
			""")
	Optional<Attempt> findPracticeResultByAttemptId(@Param("attemptId") Long attemptId);

	Long countByUserUserIdAndExamExamIdAndAttemptType(Long userId, Long examId, String attemptType);
}