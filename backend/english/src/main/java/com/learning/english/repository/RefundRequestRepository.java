package com.learning.english.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.learning.english.entity.RefundRequestEntity;

public interface RefundRequestRepository extends JpaRepository<RefundRequestEntity, Long> {
	
	List<RefundRequestEntity> findByStudent_UserIdOrderByCreatedAtDesc(Long studentId);

    @Query("""
            SELECT DISTINCT r FROM RefundRequestEntity r
            LEFT JOIN FETCH r.student
            LEFT JOIN FETCH r.transactionItem ti
            LEFT JOIN FETCH ti.transaction
            LEFT JOIN FETCH ti.course
            LEFT JOIN FETCH r.course
            
            LEFT JOIN FETCH r.reviewedBy
            
            ORDER BY r.createdAt DESC
            """)
    List<RefundRequestEntity> findAllRefunds();
    
    @Query("""
            SELECT DISTINCT r FROM RefundRequestEntity r
            LEFT JOIN FETCH r.student
            LEFT JOIN FETCH r.transactionItem ti
            LEFT JOIN FETCH ti.transaction
            LEFT JOIN FETCH ti.course
            LEFT JOIN FETCH r.course

            LEFT JOIN FETCH r.reviewedBy
            Where r.status = 'PENDING'
            ORDER BY r.createdAt DESC
            """)
    List<RefundRequestEntity> findRefundPending();

    List<RefundRequestEntity> findByStatusOrderByCreatedAtDesc(String status);

    @Query("""
            SELECT r FROM RefundRequestEntity r
            WHERE UPPER(r.status) = UPPER(:status)
            ORDER BY r.createdAt DESC
            """)
    List<RefundRequestEntity> findAllByStatusIgnoreCase(@Param("status") String status);

    long countByStatus(String status);

    Optional<RefundRequestEntity> findFirstByStudentUserIdAndCourseCourseIdOrderByCreatedAtDesc(
            Long studentId,
            Long courseId
    );

    boolean existsByStudentUserIdAndCourseCourseIdAndStatusIn(
            Long studentId,
            Long courseId,
            Collection<String> statuses
    );

    boolean existsByTransactionItemTransactionItemIdAndStatusIn(
            Long transactionItemId,
            Collection<String> statuses
    );

    Optional<RefundRequestEntity> findFirstByTransactionItemTransactionItemIdAndStatusOrderByCreatedAtDesc(
            Long transactionItemId,
            String status
    );

    Optional<RefundRequestEntity> findFirstByTransactionItemTransactionItemIdOrderByCreatedAtDesc(
            Long transactionItemId
    );
}