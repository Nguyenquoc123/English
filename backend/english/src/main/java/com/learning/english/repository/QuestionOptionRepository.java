package com.learning.english.repository;

import com.learning.english.entity.QuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface QuestionOptionRepository extends JpaRepository<QuestionOption, Long> {
	
}