package com.learning.english.repository;

import com.learning.english.dto.response.TeacherChartPointProjection;
import com.learning.english.entity.TeacherEarning;

import jakarta.persistence.LockModeType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
			    SELECT COALESCE(SUM(te.withdrawableAmount), 0)
			    FROM TeacherEarning te
			    WHERE te.teacher.userId = :teacherId
			      AND te.status = 'AVAILABLE'
			""")
	BigDecimal sumAvailableAmountByTeacherId(@Param("teacherId") Long teacherId);

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

	@Query("""
			SELECT COALESCE(SUM(te.netAmount), 0)
			FROM TeacherEarning te
			WHERE te.teacher.userId = :teacherId
			  AND te.status = 'AVAILABLE'
			""")
	BigDecimal sumAvailableRevenue(@Param("teacherId") Long teacherId);

	@Query("""
			SELECT COALESCE(SUM(te.netAmount), 0)
			FROM TeacherEarning te
			WHERE te.teacher.userId = :teacherId
			""")
	BigDecimal sumTotalRevenue(@Param("teacherId") Long teacherId);

	@Query("""
			SELECT COALESCE(SUM(te.netAmount), 0)
			FROM TeacherEarning te
			WHERE te.teacher.userId = :teacherId
			  AND te.createdAt >= :startDate
			  AND te.createdAt < :endDate
			""")
	BigDecimal sumPeriodRevenue(@Param("teacherId") Long teacherId, @Param("startDate") LocalDateTime startDate,
			@Param("endDate") LocalDateTime endDate);

	@Query(value = """
			SELECT
			    CONVERT(VARCHAR(10), te.createdAt, 23) AS label,
			    SUM(te.netAmount) AS value
			FROM teacher_earnings te
			WHERE te.teacherId = :teacherId
			  AND te.createdAt >= :startDate
			  AND te.createdAt < :endDate
			GROUP BY CONVERT(VARCHAR(10), te.createdAt, 23)
			ORDER BY label
			""", nativeQuery = true)
	List<TeacherChartPointProjection> getRevenueDailyChart(@Param("teacherId") Long teacherId,
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

	@Query(value = """
			SELECT
			    FORMAT(te.createdAt, 'yyyy-MM') AS label,
			    SUM(te.netAmount) AS value
			FROM teacher_earnings te
			WHERE te.teacherId = :teacherId
			  AND te.createdAt >= :startDate
			  AND te.createdAt < :endDate
			GROUP BY FORMAT(te.createdAt, 'yyyy-MM')
			ORDER BY label
			""", nativeQuery = true)
	List<TeacherChartPointProjection> getRevenueMonthlyChart(@Param("teacherId") Long teacherId,
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

	@Query("""
			    SELECT COALESCE(SUM(e.withdrawableAmount), 0)
			    FROM TeacherEarning e
			    WHERE e.teacher.userId = :teacherId
			      AND e.status = 'AVAILABLE'
			      AND e.withdrawableAmount > 0
			""")
	BigDecimal getAvailableAmountByTeacherId(@Param("teacherId") Long teacherId);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("""
			    SELECT e
			    FROM TeacherEarning e
			    WHERE e.teacher.userId = :teacherId
			      AND e.status = 'AVAILABLE'
			      AND e.withdrawableAmount > 0
			    ORDER BY e.createdAt ASC
			""")
	List<TeacherEarning> findAvailableEarningsForWithdraw(@Param("teacherId") Long teacherId);

	@Query("""
			    SELECT COALESCE(SUM(e.netAmount), 0)
			    FROM TeacherEarning e
			    WHERE e.teacher.userId = :teacherId
			""")
	BigDecimal getTotalAmountByTeacherId(@Param("teacherId") Long teacherId);
}