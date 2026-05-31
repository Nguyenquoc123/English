package com.learning.english.repository;

import com.learning.english.entity.StudentBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentBankAccountRepository extends JpaRepository<StudentBankAccount, Long> {

    List<StudentBankAccount> findByStudentUserIdOrderByIsDefaultDescCreatedAtDesc(Long studentId);

    Optional<StudentBankAccount> findByStudentBankAccountIdAndStudentUserId(Long accountId, Long studentId);

    Optional<StudentBankAccount> findByStudentUserIdAndIsDefaultTrue(Long studentId);

    boolean existsByStudentUserIdAndAccountNumber(Long studentId, String accountNumber);

    boolean existsByStudentUserIdAndAccountNumberAndStudentBankAccountIdNot(
            Long studentId,
            String accountNumber,
            Long excludeId
    );

    long countByStudentUserId(Long studentId);
}
