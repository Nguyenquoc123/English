package com.learning.english.repository;

import com.learning.english.entity.TeacherEarning;

import jakarta.persistence.LockModeType;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TeacherEarningRepository extends JpaRepository<TeacherEarning, Long> {

    boolean existsByTransactionTransactionId(Long transactionId);

    boolean existsByTransactionItemTransactionItemId(Long transactionItemId);

    List<TeacherEarning> findByTransactionTransactionId(Long transactionId);

    @Query("""
        SELECT COALESCE(SUM(te.netAmount), 0)
        FROM TeacherEarning te
        WHERE te.teacher.userId = :teacherId
    """)
    BigDecimal sumTotalRevenueByTeacherId(@Param("teacherId") Long teacherId);

    @Query("""
        SELECT COALESCE(SUM(te.netAmount), 0)
        FROM TeacherEarning te
        WHERE te.teacher.userId = :teacherId
          AND te.status = 'AVAILABLE'
    """)
    BigDecimal sumAvailableRevenueByTeacherId(@Param("teacherId") Long teacherId);

    @Query("""
        SELECT te
        FROM TeacherEarning te
        JOIN FETCH te.course c
        WHERE te.teacher.userId = :teacherId
        ORDER BY te.createdAt DESC
    """)
    List<TeacherEarning> findRecentEarningsByTeacherId(
            @Param("teacherId") Long teacherId,
            Pageable pageable
    );

    @Query("""
        SELECT te
        FROM TeacherEarning te
        JOIN FETCH te.course c
        JOIN FETCH te.transaction t
        JOIN FETCH te.transactionItem ti
        WHERE te.teacher.userId = :teacherId
        ORDER BY te.createdAt DESC
    """)
    List<TeacherEarning> findEarningsByTeacherId(@Param("teacherId") Long teacherId);

    @Query("""
        SELECT COALESCE(SUM(te.netAmount), 0)
        FROM TeacherEarning te
        WHERE te.teacher.userId = :teacherId
          AND te.status = 'AVAILABLE'
    """)
    BigDecimal sumAvailableAmountByTeacherId(@Param("teacherId") Long teacherId);

    @Query("""
        SELECT COALESCE(SUM(te.netAmount), 0)
        FROM TeacherEarning te
        WHERE te.teacher.userId = :teacherId
          AND te.status = 'PENDING'
    """)
    BigDecimal sumPendingAmountByTeacherId(@Param("teacherId") Long teacherId);

    @Query("""
        SELECT COALESCE(SUM(te.netAmount), 0)
        FROM TeacherEarning te
        WHERE te.teacher.userId = :teacherId
    """)
    BigDecimal sumTotalAmountByTeacherId(@Param("teacherId") Long teacherId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT te
        FROM TeacherEarning te
        JOIN FETCH te.teacher t
        JOIN FETCH te.course c
        WHERE te.status = 'AVAILABLE'
        ORDER BY t.userId ASC, te.createdAt ASC
    """)
    List<TeacherEarning> findAvailableEarningsForMonthlyWithdrawal();
}