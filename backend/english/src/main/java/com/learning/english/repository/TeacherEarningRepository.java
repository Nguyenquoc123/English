package com.learning.english.repository;

import com.learning.english.entity.TeacherEarning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface TeacherEarningRepository extends JpaRepository<TeacherEarning, Long> {

    boolean existsByTransactionTransactionId(Long transactionId);
}