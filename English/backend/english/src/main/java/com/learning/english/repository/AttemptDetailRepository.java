package com.learning.english.repository;

import com.learning.english.entity.AttemptDetail;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AttemptDetailRepository extends JpaRepository<AttemptDetail, Long> {
	@Query("""
			    SELECT DISTINCT ad
			    FROM AttemptDetail ad
			    JOIN FETCH ad.attempt a
			    JOIN FETCH ad.question q
			    LEFT JOIN FETCH ad.selectedOption so
			    LEFT JOIN FETCH q.options qo
			    WHERE a.attemptId = :attemptId
			    ORDER BY ad.attemptDetailId ASC
			""")
	List<AttemptDetail> findPracticeResultDetailsByAttemptId(@Param("attemptId") Long attemptId);
}