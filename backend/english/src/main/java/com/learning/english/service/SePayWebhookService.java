package com.learning.english.service;

import com.learning.english.dto.request.SePayWebhookRequest;
import com.learning.english.entity.Course;
import com.learning.english.entity.Enrollment;
import com.learning.english.entity.TeacherEarning;
import com.learning.english.entity.Transaction;
import com.learning.english.entity.TransactionItem;
import com.learning.english.entity.User;
import com.learning.english.repository.EnrollmentRepository;
import com.learning.english.repository.TeacherEarningRepository;
import com.learning.english.repository.TransactionItemRepository;
import com.learning.english.repository.TransactionRepository;

import jakarta.transaction.Transactional;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class SePayWebhookService {

    private final TransactionRepository transactionRepository;
    private final TransactionItemRepository transactionItemRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final TeacherEarningRepository teacherEarningRepository;

    @Transactional
    public void xuLyThanhToanSePay(SePayWebhookRequest request) {
        if (request.getTransferType() == null
                || !"in".equalsIgnoreCase(request.getTransferType())) {
            return;
        }

        Long transactionId = extractTransactionId(request);

        if (transactionId == null) {
            return;
        }

        Transaction transaction = transactionRepository
                .findById(transactionId)
                .orElse(null);

        if (transaction == null) {
            return;
        }

        if (!"PENDING".equalsIgnoreCase(transaction.getStatus())) {
            return;
        }

        BigDecimal paidAmount = BigDecimal.valueOf(
                request.getTransferAmount() != null ? request.getTransferAmount() : 0
        );

        if (paidAmount.compareTo(transaction.getTotalAmount()) < 0) {
            transaction.setStatus("FAILED");
            transaction.setUpdatedAt(LocalDateTime.now());
            transactionRepository.save(transaction);
            return;
        }

        List<TransactionItem> items =
                transactionItemRepository.findByTransactionTransactionId(transactionId);

        if (items.isEmpty()) {
            transaction.setStatus("FAILED");
            transaction.setUpdatedAt(LocalDateTime.now());
            transactionRepository.save(transaction);
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        transaction.setStatus("SUCCESS");
        transaction.setPaidAt(now);
        transaction.setUpdatedAt(now);

        Transaction savedTransaction = transactionRepository.save(transaction);

        for (TransactionItem item : items) {
            taoHoacCapNhatEnrollment(savedTransaction, item, now);
            taoDoanhThuGiaoVien(savedTransaction, item, now);
        }
    }

    private void taoHoacCapNhatEnrollment(
            Transaction transaction,
            TransactionItem item,
            LocalDateTime now
    ) {
        User student = transaction.getUser();
        Course course = item.getCourse();

        Enrollment enrollment = enrollmentRepository
                .findByUserUserIdAndCourseCourseId(
                        student.getUserId(),
                        course.getCourseId()
                )
                .orElse(null);

        if (enrollment == null) {
            enrollment = Enrollment.builder()
                    .user(student)
                    .course(course)
                    .hasCourseAccess(true)
                    .courseTransactionItem(item)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
        } else {
            enrollment.setHasCourseAccess(true);
            enrollment.setCourseTransactionItem(item);
            enrollment.setUpdatedAt(now);
        }

        enrollmentRepository.save(enrollment);
    }

    private void taoDoanhThuGiaoVien(
            Transaction transaction,
            TransactionItem item,
            LocalDateTime now
    ) {
        if (teacherEarningRepository.existsByTransactionItemTransactionItemId(
                item.getTransactionItemId()
        )) {
            return;
        }

        User teacher = item.getTeacher();

        if (teacher == null) {
            return;
        }

        BigDecimal grossAmount = item.getPrice() == null
                ? BigDecimal.ZERO
                : item.getPrice();

        BigDecimal platformFeeRate = new BigDecimal("0.20");

        BigDecimal platformFee = grossAmount.multiply(platformFeeRate);
        BigDecimal netAmount = grossAmount.subtract(platformFee);

        TeacherEarning earning = TeacherEarning.builder()
                .teacher(teacher)
                .course(item.getCourse())
                .transaction(transaction)
                .transactionItem(item)
                .grossAmount(grossAmount)
                .platformFee(platformFee)
                .netAmount(netAmount)
                .status("AVAILABLE")
                .createdAt(now)
                .build();

        teacherEarningRepository.save(earning);
    }

    private Long extractTransactionId(SePayWebhookRequest request) {
        Long idFromCode = extractIdFromText(request.getCode());

        if (idFromCode != null) {
            return idFromCode;
        }

        Long idFromContent = extractIdFromText(request.getContent());

        if (idFromContent != null) {
            return idFromContent;
        }

        return extractIdFromText(request.getDescription());
    }

    private Long extractIdFromText(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }

        Pattern pattern = Pattern.compile("SEVQR(\\d+)");
        Matcher matcher = pattern.matcher(text.toUpperCase());

        if (!matcher.find()) {
            return null;
        }

        try {
            return Long.parseLong(matcher.group(1));
        } catch (Exception e) {
            return null;
        }
    }
}
