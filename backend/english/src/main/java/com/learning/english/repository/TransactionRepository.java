package com.learning.english.repository;

import com.learning.english.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findFirstByUserUserIdAndTargetTypeAndTargetIdAndStatusOrderByCreatedAtDesc(
            Long userId,
            String targetType,
            Long targetId,
            String status
    );
    
    Optional<Transaction> findByTransactionIdAndTargetType(
            Long transactionId,
            String targetType
    );
}