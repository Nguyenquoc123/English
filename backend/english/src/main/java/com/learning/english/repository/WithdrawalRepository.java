package com.learning.english.repository;

import com.learning.english.entity.Withdrawal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long> {

    List<Withdrawal> findByStatusOrderByRequestedAtDesc(String status);

    @Query("""
            SELECT w FROM Withdrawal w
            JOIN FETCH w.teacher
            JOIN FETCH w.bankAccount
            WHERE w.status = :status
            ORDER BY w.requestedAt DESC
            """)
    List<Withdrawal> findByStatusWithDetailsOrderByRequestedAtDesc(@Param("status") String status);

    @Query("""
            SELECT w FROM Withdrawal w
            JOIN FETCH w.teacher
            JOIN FETCH w.bankAccount
            ORDER BY w.requestedAt DESC
            """)
    List<Withdrawal> findAllWithDetailsOrderByRequestedAtDesc();

    List<Withdrawal> findAllByOrderByRequestedAtDesc();

    long countByStatus(String status);

    @Query("SELECT SUM(w.amount) FROM Withdrawal w WHERE w.status = 'PAID'")
    java.math.BigDecimal sumPaidAmount();
    
    long countByTeacher_UserIdAndStatus(Long teacherId, String status);

    List<Withdrawal> findByTeacher_UserIdOrderByRequestedAtDesc(Long teacherId);

    @Query("""
            SELECT COALESCE(SUM(w.amount), 0)
            FROM Withdrawal w
            WHERE w.teacher.userId = :teacherId
              AND w.status = 'PENDING'
            """)
    BigDecimal sumPendingAmountByTeacherId(@Param("teacherId") Long teacherId);
}
