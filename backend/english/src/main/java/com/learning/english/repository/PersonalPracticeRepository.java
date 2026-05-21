package com.learning.english.repository;

import com.learning.english.entity.PersonalPractice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PersonalPracticeRepository extends JpaRepository<PersonalPractice, Long> {

	List<PersonalPractice> findByUser_UserIdAndStatusOrderByCreatedAtDesc(
	        Long userId,
	        String status
	);
	

	@Query("""
	        SELECT p
	        FROM PersonalPractice p
	        WHERE p.user.userId = :userId
	          AND (
	                :keyword IS NULL
	                OR :keyword = ''
	                OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
	              )
	          AND (
	                :type IS NULL
	                OR :type = ''
	                OR p.type = :type
	              )
	        ORDER BY p.createdAt DESC
	    """)
	    List<PersonalPractice> findPersonalPractices(
	            @Param("userId") Long userId,
	            @Param("keyword") String keyword,
	            @Param("type") String type
	    );
}