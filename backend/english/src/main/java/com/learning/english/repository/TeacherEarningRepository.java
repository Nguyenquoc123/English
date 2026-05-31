package com.learning.english.repository;

import com.learning.english.entity.TeacherEarning;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
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

    List<TeacherEarning> findByTeacher_UserIdAndStatusOrderByCreatedAtAsc(
            Long teacherId,
            String status
    );

    @Query("""
            SELECT COALESCE(SUM(te.netAmount), 0)
            FROM TeacherEarning te
            WHERE te.teacher.userId = :teacherId
              AND te.status = 'HOLD'
            """)
    BigDecimal sumHeldRevenueByTeacherId(@Param("teacherId") Long teacherId);

    List<TeacherEarning> findByStatusAndHoldReleaseAtLessThanEqual(String status, LocalDateTime releaseTime);

    boolean existsByTransactionTransactionIdAndStatus(Long transactionId, String status);
}
