package com.learning.english.repository;

import com.learning.english.entity.TeacherBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeacherBankAccountRepository extends JpaRepository<TeacherBankAccount, Long> {

    List<TeacherBankAccount> findByTeacherUserIdOrderByIsDefaultDescCreatedAtDesc(Long teacherId);

    Optional<TeacherBankAccount> findByBankAccountIdAndTeacherUserId(Long accountId, Long teacherId);

    Optional<TeacherBankAccount> findByTeacherUserIdAndIsDefaultTrue(Long teacherId);

    boolean existsByTeacherUserIdAndAccountNumber(Long teacherId, String accountNumber);

    boolean existsByTeacherUserIdAndAccountNumberAndBankAccountIdNot(
            Long teacherId,
            String accountNumber,
            Long excludeId
    );

    long countByTeacherUserId(Long teacherId);
}
