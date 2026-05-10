package com.learning.english.service;

import com.learning.english.dto.response.CoursePaymentResponse;
import com.learning.english.entity.Course;
import com.learning.english.entity.Transaction;
import com.learning.english.entity.User;
import com.learning.english.repository.CourseRepository;
import com.learning.english.repository.EnrollmentRepository;
import com.learning.english.repository.TransactionRepository;
import com.learning.english.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

@Service
public class CoursePaymentService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${sepay.bank.account}")
    private String bankAccount;

    @Value("${sepay.bank.name}")
    private String bankName;

    @Value("${sepay.bank.account-name}")
    private String accountName;

    @Transactional
    public CoursePaymentResponse taoThanhToanKhoaHoc(Long courseId) {
        User user = getCurrentUser();

        Course course = courseRepository.findByCourseIdAndStatus(courseId, "Published")
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học hoặc khóa học chưa được mở bán"));

        boolean hasCourseAccess = enrollmentRepository
                .existsByUserUserIdAndCourseCourseIdAndHasCourseAccessTrue(
                        user.getUserId(),
                        courseId
                );

        if (hasCourseAccess) {
            throw new RuntimeException("Bạn đã sở hữu khóa học này");
        }

        BigDecimal amount = course.getPrice();

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Khóa học miễn phí không cần thanh toán");
        }

        Transaction transaction = transactionRepository
                .findFirstByUserUserIdAndTargetTypeAndTargetIdAndStatusOrderByCreatedAtDesc(
                        user.getUserId(),
                        "COURSE",
                        courseId,
                        "PENDING"
                )
                .orElse(null);

        if (transaction == null) {
            LocalDateTime now = LocalDateTime.now();

            transaction = Transaction.builder()
                    .user(user)
                    .targetType("COURSE")
                    .targetId(courseId)
                    .amount(amount)
                    .status("PENDING")
                    .createdAt(now)
                    .updatedAt(now)
                    .build();

            transaction = transactionRepository.save(transaction);
        }

        String paymentCode = buildPaymentCode(transaction.getTransactionId());
        String qrUrl = buildSePayQrUrl(paymentCode, transaction.getAmount());

        return CoursePaymentResponse.builder()
                .transactionId(transaction.getTransactionId())
                .courseId(course.getCourseId())
                .courseTitle(course.getTitle())
                .userId(user.getUserId())
                .paymentCode(paymentCode)
                .amount(transaction.getAmount())
                .status(transaction.getStatus())
                .qrUrl(qrUrl)
                .bankName(bankName)
                .accountNumber(bankAccount)
                .accountName(accountName)
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    private String buildPaymentCode(Long transactionId) {
        return "SEVQR COURSE" + transactionId;
    }

    private String buildSePayQrUrl(String paymentCode, BigDecimal amount) {
        String description = URLEncoder.encode(paymentCode, StandardCharsets.UTF_8);

        return "https://qr.sepay.vn/img"
                + "?acc=" + bankAccount
                + "&bank=" + bankName
                + "&amount=" + amount.longValue()
                + "&des=" + description
                + "&template=compact";
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new RuntimeException("Người dùng chưa đăng nhập");
        }

        String username = authentication.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }
}