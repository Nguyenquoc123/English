package com.learning.english.service;

import com.learning.english.dto.request.SePayWebhookRequest;
import com.learning.english.entity.*;
import com.learning.english.repository.CourseRepository;
import com.learning.english.repository.EnrollmentRepository;
import com.learning.english.repository.TeacherEarningRepository;
import com.learning.english.repository.TransactionRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SePayWebhookService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private TeacherEarningRepository teacherEarningRepository;

    @Transactional
    public void xuLyThanhToanSePay(SePayWebhookRequest request) {
        if (request.getTransferType() == null
                || !"in".equalsIgnoreCase(request.getTransferType())) {
            return;
        }

        Long transactionId = extractCourseTransactionId(request);

        System.out.println("Mã giao dịch: " + transactionId);
        if (transactionId == null) {
            return;
        }

        Transaction transaction = transactionRepository
                .findByTransactionIdAndTargetType(transactionId, "COURSE")
                .orElse(null);

        if (transaction == null) {
            return;
        }

        /*
            Chống xử lý trùng:
            Nếu webhook gửi lại mà transaction đã SUCCESS rồi thì bỏ qua.
        */
        if (!"PENDING".equals(transaction.getStatus())) {
            return;
        }

        BigDecimal paidAmount = BigDecimal.valueOf(
                request.getTransferAmount() != null ? request.getTransferAmount() : 0
        );

        if (paidAmount.compareTo(transaction.getAmount()) < 0) {
            transaction.setStatus("FAILED");
            transaction.setUpdatedAt(LocalDateTime.now());
            transactionRepository.save(transaction);
            return;
        }

        Long courseId = transaction.getTargetId();

        Course course = courseRepository.findById(courseId)
                .orElse(null);

        if (course == null) {
            transaction.setStatus("FAILED");
            transaction.setUpdatedAt(LocalDateTime.now());
            transactionRepository.save(transaction);
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        transaction.setStatus("SUCCESS");
        transaction.setUpdatedAt(now);

        Transaction savedTransaction = transactionRepository.save(transaction);

        taoHoacCapNhatEnrollment(savedTransaction, course, now);

        if (!teacherEarningRepository.existsByTransactionTransactionId(
                savedTransaction.getTransactionId()
        )) {
            taoDoanhThuGiaoVien(course, savedTransaction, now);
        }
    }

    private void taoHoacCapNhatEnrollment(
            Transaction transaction,
            Course course,
            LocalDateTime now
    ) {
        User student = transaction.getUser();

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
                    .hasExamAccess(true)
                    .courseTransaction(transaction)
                    .examAccessTransaction(null)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
        } else {
            enrollment.setHasCourseAccess(true);
            enrollment.setCourseTransaction(transaction);

            if (enrollment.getHasExamAccess() == null) {
                enrollment.setHasExamAccess(false);
            }

            enrollment.setUpdatedAt(now);
        }

        enrollmentRepository.save(enrollment);
    }

    private void taoDoanhThuGiaoVien(
            Course course,
            Transaction transaction,
            LocalDateTime now
    ) {
        User teacher = course.getTeacher();

        if (teacher == null) {
            return;
        }

        BigDecimal grossAmount = transaction.getAmount();

        /*
            Ví dụ hệ thống giữ 20%.
            Nếu chưa muốn tính phí nền tảng thì để platformFeeRate = 0.00
        */
        BigDecimal platformFeeRate = new BigDecimal("0.20");

        BigDecimal platformFee = grossAmount.multiply(platformFeeRate);
        BigDecimal netAmount = grossAmount.subtract(platformFee);

        TeacherEarning earning = TeacherEarning.builder()
                .teacher(teacher)
                .course(course)
                .sourceType("COURSE")
                .sourceId(course.getCourseId())
                .transaction(transaction)
                .grossAmount(grossAmount)
                .platformFee(platformFee)
                .netAmount(netAmount)
                .status("Available")
                .createdAt(now)
                .build();

        teacherEarningRepository.save(earning);
    }

    private Long extractCourseTransactionId(SePayWebhookRequest request) {
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
        	System.out.println("Cái gì đó: " + matcher.group(1));
            return Long.parseLong(matcher.group(1));
        } catch (Exception e) {
            return null;
        }
    }
}