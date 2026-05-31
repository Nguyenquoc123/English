package com.learning.english.repository;

import com.learning.english.entity.RefundAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefundAuditLogRepository extends JpaRepository<RefundAuditLog, Long> {

    List<RefundAuditLog> findByRefundRequestRefundRequestIdOrderByCreatedAtDesc(Long refundRequestId);
}
