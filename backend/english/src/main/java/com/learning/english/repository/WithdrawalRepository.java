package com.learning.english.repository;

import com.learning.english.entity.Withdrawal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long> {

    List<Withdrawal> findByStatusOrderByRequestedAtDesc(String status);

    List<Withdrawal> findAllByOrderByRequestedAtDesc();

    long countByStatus(String status);

    @Query("SELECT SUM(w.amount) FROM Withdrawal w WHERE w.status = 'PAID'")
    java.math.BigDecimal sumPaidAmount();
}
