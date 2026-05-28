package com.learning.english.service;

import com.learning.english.dto.request.MultiCoursePaymentRequest;
import com.learning.english.dto.response.StudentRefundStatusResponse;
import com.learning.english.dto.response.CoursePaymentResponse;
import com.learning.english.entity.Course;
import com.learning.english.entity.Enrollment;
import com.learning.english.entity.RefundRequestEntity;
import com.learning.english.entity.TeacherEarning;
import com.learning.english.entity.Transaction;
import com.learning.english.entity.TransactionItem;
import com.learning.english.entity.User;
import com.learning.english.repository.CourseRepository;
import com.learning.english.repository.EnrollmentRepository;
import com.learning.english.repository.RefundRequestRepository;
import com.learning.english.repository.TeacherEarningRepository;
import com.learning.english.repository.TransactionItemRepository;
import com.learning.english.repository.TransactionRepository;
import com.learning.english.repository.UserRepository;

import jakarta.transaction.Transactional;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class CoursePaymentService {
	@Autowired
    CourseRepository courseRepository;
	
	@Autowired
    TransactionRepository transactionRepository;
	
	@Autowired
    TransactionItemRepository transactionItemRepository;
	
	@Autowired
    EnrollmentRepository enrollmentRepository;
	
	@Autowired
    UserRepository userRepository;

	@Autowired
	TeacherEarningRepository teacherEarningRepository;

	@Autowired
	RefundRequestRepository refundRequestRepository;

	@Autowired
	NotificationService notificationService;

	@Autowired
	StudentBankAccountService studentBankAccountService;

	private static final Set<String> OPEN_REFUND_STATUSES = Set.of("PENDING", "APPROVED");

    @Value("${sepay.bank.account}")
    private String bankAccount;

    @Value("${sepay.bank.name}")
    private String bankName;

    @Value("${sepay.bank.account-name}")
    private String accountName;

    @Transactional
    public CoursePaymentResponse taoThanhToanKhoaHoc(Long courseId) {
        MultiCoursePaymentRequest request = new MultiCoursePaymentRequest();
        request.setCourseIds(List.of(courseId));

        return taoThanhToanNhieuKhoaHoc(request);
    }

    @Transactional
    public CoursePaymentResponse taoThanhToanNhieuKhoaHoc(MultiCoursePaymentRequest request) {
        User user = getCurrentUser();

        if (request.getCourseIds() == null || request.getCourseIds().isEmpty()) {
            throw new RuntimeException("Danh sách khóa học không được rỗng");
        }

        List<Long> courseIds = new ArrayList<>(
                new LinkedHashSet<>(request.getCourseIds())
        );

        List<Course> courses = courseRepository.findAllById(courseIds);

        if (courses.size() != courseIds.size()) {
            throw new RuntimeException("Có khóa học không tồn tại");
        }

        LocalDateTime now = LocalDateTime.now();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (Course course : courses) {
            if (!"PUBLISHED".equalsIgnoreCase(course.getStatus())
                    && !"Published".equalsIgnoreCase(course.getStatus())) {
                throw new RuntimeException("Khóa học chưa được mở bán: " + course.getTitle());
            }

            boolean hasAccess =
                    enrollmentRepository.existsByUserUserIdAndCourseCourseIdAndHasCourseAccessTrue(
                            user.getUserId(),
                            course.getCourseId()
                    );

            if (hasAccess) {
                throw new RuntimeException("Bạn đã sở hữu khóa học: " + course.getTitle());
            }

            if (course.getTeacher() == null) {
                throw new RuntimeException("Khóa học chưa có giáo viên: " + course.getTitle());
            }

            BigDecimal price = course.getPrice() == null
                    ? BigDecimal.ZERO
                    : course.getPrice();

            if (price.compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Khóa học miễn phí không cần thanh toán: " + course.getTitle());
            }

            totalAmount = totalAmount.add(price);
        }

        if (totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Tổng tiền thanh toán không hợp lệ");
        }

        Transaction transaction = Transaction.builder()
                .user(user)
                .totalAmount(totalAmount)
                .paymentUrl(null)
                .status("PENDING")
                .paidAt(null)
                .createdAt(now)
                .updatedAt(now)
                .build();

        transaction = transactionRepository.save(transaction);

        for (Course course : courses) {
            TransactionItem item = TransactionItem.builder()
                    .transaction(transaction)
                    .course(course)
                    .teacher(course.getTeacher())
                    .itemType("COURSE")
                    .price(course.getPrice())
                    .createdAt(now)
                    .build();

            transactionItemRepository.save(item);
        }

        String paymentCode = buildPaymentCode(transaction.getTransactionId());
        String qrUrl = buildSePayQrUrl(paymentCode, totalAmount);

        transaction.setPaymentUrl(qrUrl);
        transaction.setUpdatedAt(now);
        transactionRepository.save(transaction);

        return CoursePaymentResponse.builder()
                .transactionId(transaction.getTransactionId())
                .courseId(courses.size() == 1 ? courses.get(0).getCourseId() : null)
                .courseTitle(courses.size() == 1 ? courses.get(0).getTitle() : "Thanh toán nhiều khóa học")
                .userId(user.getUserId())
                .paymentCode(paymentCode)
                .amount(totalAmount)
                .status(transaction.getStatus())
                .qrUrl(qrUrl)
                .bankName(bankName)
                .accountNumber(bankAccount)
                .accountName(accountName)
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    private String buildPaymentCode(Long transactionId) {
        return "SEVQR" + transactionId;
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

    public List<StudentRefundStatusResponse> getMyCourseRefundStatuses() {
        User user = getCurrentUser();
        List<Transaction> transactions = transactionRepository.findByUserUserIdOrderByCreatedAtDesc(user.getUserId());

        Map<Long, StudentRefundStatusResponse> latestByCourse = new HashMap<>();

        for (Transaction tx : transactions) {
            List<TransactionItem> items = transactionItemRepository.findByTransactionTransactionId(tx.getTransactionId());
            for (TransactionItem item : items) {
                if (item.getCourse() == null) continue;
                Long courseId = item.getCourse().getCourseId();
                if (latestByCourse.containsKey(courseId)) continue;

                String txStatus = tx.getStatus() == null ? "" : tx.getStatus().toUpperCase();
                RefundRequestEntity refund = refundRequestRepository
                        .findFirstByStudentUserIdAndCourseCourseIdOrderByCreatedAtDesc(user.getUserId(), courseId)
                        .orElse(null);

                String displayStatus;
                String refundReason;
                String refundRejectReason;
                LocalDateTime refundRequestedAt;
                LocalDateTime refundReviewedAt;
                boolean canRequest;

                if (refund != null) {
                    displayStatus = mapRefundStatusToDisplay(refund.getStatus());
                    refundReason = refund.getReason();
                    refundRejectReason = "REJECTED".equalsIgnoreCase(refund.getStatus())
                            ? refund.getReviewNote()
                            : null;
                    refundRequestedAt = refund.getCreatedAt();
                    refundReviewedAt = refund.getReviewedAt();
                    canRequest = "SUCCESS".equals(txStatus)
                            && !OPEN_REFUND_STATUSES.contains(refund.getStatus().toUpperCase())
                            && !"PAID".equalsIgnoreCase(refund.getStatus());
                } else {
                    displayStatus = txStatus;
                    refundReason = tx.getRefundReason();
                    refundRejectReason = tx.getRefundRejectReason();
                    refundRequestedAt = tx.getRefundRequestedAt();
                    refundReviewedAt = tx.getRefundReviewedAt();
                    canRequest = "SUCCESS".equals(txStatus)
                            && !"REFUND_REQUESTED".equals(txStatus)
                            && !"REFUNDED".equals(txStatus);
                }

                latestByCourse.put(courseId, StudentRefundStatusResponse.builder()
                        .courseId(courseId)
                        .transactionId(tx.getTransactionId())
                        .status(displayStatus)
                        .refundReason(refundReason)
                        .refundRejectReason(refundRejectReason)
                        .refundRequestedAt(refundRequestedAt)
                        .refundReviewedAt(refundReviewedAt)
                        .canRequestRefund(canRequest)
                        .build());
            }
        }

        return new ArrayList<>(latestByCourse.values());
    }

    @Transactional
    public void requestRefundForCourse(Long courseId, String reason) {
        User user = getCurrentUser();
        String normalizedReason = reason == null ? "" : reason.trim();
        if (normalizedReason.isEmpty()) {
            throw new RuntimeException("Vui lòng nhập lý do hoàn tiền");
        }

        List<TransactionItem> items = transactionItemRepository
                .findByTransactionUserUserIdAndCourseCourseIdOrderByCreatedAtDesc(user.getUserId(), courseId);

        Transaction target = null;
        Course course = null;
        for (TransactionItem item : items) {
            Transaction tx = item.getTransaction();
            if (tx != null && "SUCCESS".equalsIgnoreCase(tx.getStatus())) {
                target = tx;
                course = item.getCourse();
                break;
            }
        }

        if (target == null) {
            throw new RuntimeException("Không tìm thấy giao dịch thành công để yêu cầu hoàn tiền");
        }

        if (refundRequestRepository.existsByTransactionTransactionIdAndStatusIn(
                target.getTransactionId(),
                OPEN_REFUND_STATUSES
        )) {
            throw new RuntimeException("Đã có yêu cầu hoàn tiền đang chờ xử lý");
        }

        if (refundRequestRepository.existsByStudentUserIdAndCourseCourseIdAndStatusIn(
                user.getUserId(),
                courseId,
                OPEN_REFUND_STATUSES
        )) {
            throw new RuntimeException("Đã có yêu cầu hoàn tiền đang chờ xử lý cho khóa học này");
        }

        LocalDateTime now = LocalDateTime.now();
        var refundBankAccount = studentBankAccountService.requireDefaultAccount(user);

        RefundRequestEntity refundRequest = RefundRequestEntity.builder()
                .transaction(target)
                .course(course)
                .student(user)
                .studentBankAccount(refundBankAccount)
                .reason(normalizedReason)
                .status("PENDING")
                .reviewNote(null)
                .reviewedBy(null)
                .reviewedAt(null)
                .paidAt(null)
                .createdAt(now)
                .updatedAt(now)
                .build();
        refundRequestRepository.save(refundRequest);

        target.setStatus("REFUND_REQUESTED");
        target.setRefundReason(normalizedReason);
        target.setRefundRejectReason(null);
        target.setRefundRequestedAt(now);
        target.setRefundReviewedAt(null);
        target.setRefundReviewedBy(null);
        target.setUpdatedAt(now);
        transactionRepository.save(target);

        try {
            notifyAdminsNewRefundRequest(user, course, target, normalizedReason, refundBankAccount);
        } catch (Exception ex) {
            System.err.println("Không gửi được thông báo hoàn tiền cho admin: " + ex.getMessage());
        }
    }

    private void notifyAdminsNewRefundRequest(
            User student,
            Course course,
            Transaction tx,
            String reason,
            com.learning.english.entity.StudentBankAccount bankAccount
    ) {
        String courseTitle = course != null ? course.getTitle() : "Khóa học";
        String shortReason = reason.length() > 180 ? reason.substring(0, 180) + "..." : reason;
        StringBuilder messageBuilder = new StringBuilder(String.format(
                "Học viên %s yêu cầu hoàn tiền khóa \"%s\" (giao dịch #%d, %s). Lý do: %s",
                student.getUsername(),
                courseTitle,
                tx.getTransactionId(),
                tx.getTotalAmount() != null ? tx.getTotalAmount().toPlainString() + " VND" : "—",
                shortReason
        ));
        if (student.getFullName() != null && !student.getFullName().isBlank()) {
            messageBuilder.append("\nHọ tên: ").append(student.getFullName());
        }
        if (student.getPhone() != null && !student.getPhone().isBlank()) {
            messageBuilder.append("\nSĐT: ").append(student.getPhone());
        }
        if (bankAccount != null) {
            messageBuilder.append(String.format(
                    "\nSTK nhận hoàn: %s | %s | %s",
                    bankAccount.getBankName(),
                    bankAccount.getAccountNumber(),
                    bankAccount.getAccountName()
            ));
        }
        String message = messageBuilder.toString();

        List<User> admins = userRepository.searchUsers(null, "admin", null);
        if (admins.isEmpty()) {
            admins = userRepository.findEligibleByRoleName("admin");
        }
        for (User admin : admins) {
            notificationService.notifyUser(
                    admin,
                    "Yêu cầu hoàn tiền mới",
                    message,
                    student
            );
        }
    }

    @Transactional
    public void reviewRefund(Long transactionId, boolean approve, String note, String adminUsername) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch"));

        RefundRequestEntity refundRequest = refundRequestRepository
                .findFirstByTransactionTransactionIdAndStatusOrderByCreatedAtDesc(transactionId, "PENDING")
                .orElseGet(() -> refundRequestRepository
                        .findFirstByTransactionTransactionIdOrderByCreatedAtDesc(transactionId)
                        .orElse(null));

        if (refundRequest != null && !"PENDING".equalsIgnoreCase(refundRequest.getStatus())) {
            refundRequest = null;
        }

        if (refundRequest == null && !"REFUND_REQUESTED".equalsIgnoreCase(tx.getStatus())) {
            throw new RuntimeException("Giao dịch này không ở trạng thái chờ hoàn tiền");
        }

        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy admin"));

        LocalDateTime now = LocalDateTime.now();
        String reviewNote = note == null ? null : note.trim();

        tx.setRefundReviewedBy(admin);
        tx.setRefundReviewedAt(now);
        tx.setUpdatedAt(now);

        if (approve) {
            tx.setStatus("REFUNDED");
            tx.setRefundRejectReason(null);

            if (refundRequest != null) {
                refundRequest.setStatus("PAID");
                refundRequest.setReviewNote(reviewNote);
                refundRequest.setReviewedBy(admin);
                refundRequest.setReviewedAt(now);
                refundRequest.setPaidAt(now);
                refundRequest.setUpdatedAt(now);
                refundRequestRepository.save(refundRequest);
            }

            List<Enrollment> enrollments = enrollmentRepository
                    .findByCourseTransactionItem_Transaction_TransactionId(transactionId);
            for (Enrollment enrollment : enrollments) {
                enrollment.setHasCourseAccess(false);
                enrollment.setUpdatedAt(now);
            }
            enrollmentRepository.saveAll(enrollments);

            List<TeacherEarning> earnings = teacherEarningRepository.findByTransactionTransactionId(transactionId);
            for (TeacherEarning earning : earnings) {
                earning.setStatus("REFUNDED");
            }
            teacherEarningRepository.saveAll(earnings);
        } else {
            if (reviewNote == null || reviewNote.isEmpty()) {
                throw new RuntimeException("Vui lòng nhập lý do từ chối hoàn tiền");
            }

            tx.setStatus("REFUND_REJECTED");
            tx.setRefundRejectReason(reviewNote);

            if (refundRequest != null) {
                refundRequest.setStatus("REJECTED");
                refundRequest.setReviewNote(reviewNote);
                refundRequest.setReviewedBy(admin);
                refundRequest.setReviewedAt(now);
                refundRequest.setUpdatedAt(now);
                refundRequestRepository.save(refundRequest);
            }
        }

        transactionRepository.save(tx);
    }

    private String mapRefundStatusToDisplay(String refundStatus) {
        if (refundStatus == null) {
            return "";
        }
        return switch (refundStatus.toUpperCase()) {
            case "PENDING", "APPROVED" -> "REFUND_REQUESTED";
            case "REJECTED" -> "REFUND_REJECTED";
            case "PAID" -> "REFUNDED";
            default -> refundStatus.toUpperCase();
        };
    }
}