package com.learning.english.service;

import com.learning.english.repository.RefundRequestRepository;
import com.learning.english.repository.TeacherEarningRepository;
import com.learning.english.entity.TeacherEarning;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TeacherEarningReleaseScheduler {

    @Autowired
    TeacherEarningRepository teacherEarningRepository;

    @Autowired
    RefundRequestRepository refundRequestRepository;

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void releaseHeldEarnings() {
        LocalDateTime now = LocalDateTime.now();
        List<TeacherEarning> releasable = teacherEarningRepository
                .findByStatusAndHoldReleaseAtLessThanEqual("HOLD", now);

        for (TeacherEarning earning : releasable) {
            Long transactionId = earning.getTransaction() != null
                    ? earning.getTransaction().getTransactionId()
                    : null;
            if (transactionId != null && refundRequestRepository.existsByTransactionTransactionIdAndStatusIn(
                    transactionId, List.of("PENDING"))) {
                continue;
            }
            earning.setStatus("AVAILABLE");
            teacherEarningRepository.save(earning);
        }
    }
}
