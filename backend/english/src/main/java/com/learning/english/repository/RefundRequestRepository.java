package com.learning.english.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.RefundRequestEntity;

@Repository
public interface RefundRequestRepository extends JpaRepository<RefundRequestEntity, Long> {

    @Query("""
            SELECT DISTINCT r FROM RefundRequestEntity r
            LEFT JOIN FETCH r.student
            LEFT JOIN FETCH r.transaction
            LEFT JOIN FETCH r.course
            LEFT JOIN FETCH r.studentBankAccount
            WHERE r.status = :status
            ORDER BY r.createdAt DESC
            """)
    List<RefundRequestEntity> findByStatusWithDetails(@Param("status") String status);

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

    Optional<RefundRequestEntity> findFirstByTransactionTransactionIdOrderByCreatedAtDesc(Long transactionId);

    Optional<RefundRequestEntity> findFirstByTransactionTransactionIdAndStatusOrderByCreatedAtDesc(
            Long transactionId,
            String status
    );

    boolean existsByTransactionTransactionIdAndStatusIn(Long transactionId, Collection<String> statuses);

    boolean existsByStudentUserIdAndCourseCourseIdAndStatusIn(
            Long studentId,
            Long courseId,
            Collection<String> statuses
    );
}
