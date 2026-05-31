package com.learning.english.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.TransactionItem;

@Repository
public interface TransactionItemRepository extends JpaRepository<TransactionItem, Long>{
	List<TransactionItem> findByTransactionTransactionId(Long transactionId);

	List<TransactionItem> findByTransactionUserUserIdAndCourseCourseIdOrderByCreatedAtDesc(Long userId, Long courseId);
}
