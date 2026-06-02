package com.learning.english.service;

import com.learning.english.entity.RefundAuditLog;
import com.learning.english.entity.RefundRequestEntity;
import com.learning.english.entity.User;
import com.learning.english.repository.RefundAuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class RefundAuditService {

    @Autowired
    RefundAuditLogRepository refundAuditLogRepository;

//    @Transactional
//    public void log(
//            String action,
//            RefundRequestEntity refundRequest,
//            User actor,
//            String oldStatus,
//            String newStatus,
//            String note
//    ) {
//        if (refundRequest == null || actor == null) {
//            return;
//        }
//        String roleName = actor.getRole() != null ? actor.getRole().getRoleName() : "unknown";
//        RefundAuditLog auditLog = RefundAuditLog.builder()
//                .refundRequest(refundRequest)
//                .transactionId(refundRequest.getTransaction().getTransactionId())
//                .action(action)
//                .actor(actor)
//                .actorRole(roleName)
//                .oldStatus(oldStatus)
//                .newStatus(newStatus)
//                .note(note)
//                .createdAt(LocalDateTime.now())
//                .build();
//        refundAuditLogRepository.save(auditLog);
//    }
}
