package com.learning.english.repository;

import com.learning.english.entity.QuestionOption;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface QuestionOptionRepository extends JpaRepository<QuestionOption, Long> {
	List<QuestionOption> findByQuestion_QuestionId(Long questionId);
}