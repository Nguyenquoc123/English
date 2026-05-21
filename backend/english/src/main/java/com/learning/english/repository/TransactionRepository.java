package com.learning.english.repository;

import com.learning.english.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
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

    
    List<Transaction> findAllByOrderByCreatedAtDesc();

    
    @org.springframework.data.jpa.repository.Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.status = 'SUCCESS'")
    java.math.BigDecimal sumSuccessAmount();
    
    
    boolean existsByTransactionIdAndTargetTypeAndStatus(
            Long transactionId,
            String targetType,
            String status
    );
}
