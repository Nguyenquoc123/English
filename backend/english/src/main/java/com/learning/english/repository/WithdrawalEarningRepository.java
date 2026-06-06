package com.learning.english.repository;

import com.learning.english.entity.WithdrawalEarning;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WithdrawalEarningRepository extends JpaRepository<WithdrawalEarning, Long> {

    List<WithdrawalEarning> findByWithdrawal_WithdrawalId(Long withdrawalId);
}