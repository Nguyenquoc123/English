package com.learning.english.service;

import com.learning.english.constant.EnrollmentAccessStatus;
import com.learning.english.constant.RefundPolicyConstants;
import com.learning.english.constant.RefundReasonCode;
import com.learning.english.dto.request.RefundRequest;
import com.learning.english.dto.response.RefundEligibilityResponse;
import com.learning.english.dto.response.RefundReasonOptionResponse;
import com.learning.english.dto.response.StudentRefundStatusResponse;
import com.learning.english.entity.*;
import com.learning.english.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RefundService {

    private static final Set<String> OPEN_REFUND_STATUSES = Set.of("PENDING");

    @Autowired
    TransactionRepository transactionRepository;
    @Autowired
    TransactionItemRepository transactionItemRepository;
    @Autowired
    RefundRequestRepository refundRequestRepository;
    @Autowired
    EnrollmentRepository enrollmentRepository;
    @Autowired
    UserRepository userRepository;
    @Autowired
    StudentBankAccountService studentBankAccountService;
    @Autowired
    NotificationService notificationService;
    @Autowired
    TeacherEarningRepository teacherEarningRepository;
    @Autowired
    LessonRepository lessonRepository;
    @Autowired
    VideoProgressRepository videoProgressRepository;
    @Autowired
    RefundAuditService refundAuditService;

    public List<RefundReasonOptionResponse> listReasonOptions() {
        return Arrays.stream(RefundReasonCode.values())
                .map(code -> RefundReasonOptionResponse.builder()
                        .code(code.getCode())
                        .label(code.getLabel())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RefundEligibilityResponse getEligibilityForCourse(Long courseId) {
        User user = getCurrentUser();
        TransactionContext ctx = resolveSuccessfulTransaction(user.getUserId(), courseId);
        if (ctx == null) {
            return RefundEligibilityResponse.builder()
                    .courseId(courseId)
                    .canRequestRefund(false)
                    .ineligibilityReasons(List.of("Không tìm thấy giao dịch thành công"))
                    .build();
        }
        return buildEligibility(user, ctx.transaction(), ctx.course(), ctx.enrollment());
    }

    @Transactional(readOnly = true)
    public List<StudentRefundStatusResponse> getMyCourseRefundStatuses() {
        User user = getCurrentUser();
        List<Transaction> transactions = transactionRepository.findByUserUserIdOrderByCreatedAtDesc(user.getUserId());
        Map<Long, StudentRefundStatusResponse> latestByCourse = new HashMap<>();

        for (Transaction tx : transactions) {
            List<TransactionItem> items = transactionItemRepository.findByTransactionTransactionId(tx.getTransactionId());
            for (TransactionItem item : items) {
                if (item.getCourse() == null) {
                    continue;
                }
                Long courseId = item.getCourse().getCourseId();
                if (latestByCourse.containsKey(courseId)) {
                    continue;
                }
                Enrollment enrollment = enrollmentRepository
                        .findByUserUserIdAndCourseCourseId(user.getUserId(), courseId)
                        .orElse(null);
                RefundRequestEntity refund = refundRequestRepository
                        .findFirstByStudentUserIdAndCourseCourseIdOrderByCreatedAtDesc(user.getUserId(), courseId)
                        .orElse(null);

                RefundEligibilityResponse eligibility = buildEligibility(user, tx, item.getCourse(), enrollment);
                String displayStatus = resolveDisplayStatus(tx, refund);
                boolean canRequest = eligibility.isCanRequestRefund();
                if (refund != null && OPEN_REFUND_STATUSES.contains(refund.getStatus().toUpperCase())) {
                    canRequest = false;
                }
                if (refund != null && ("APPROVED".equalsIgnoreCase(refund.getStatus())
                        || "PAID".equalsIgnoreCase(refund.getStatus()))) {
                    canRequest = false;
                }
                if ("REFUNDED".equalsIgnoreCase(tx.getStatus())) {
                    canRequest = false;
                }

                latestByCourse.put(courseId, StudentRefundStatusResponse.builder()
                        .courseId(courseId)
                        .transactionId(tx.getTransactionId())
                        .status(displayStatus)
                        .accessStatus(eligibility.getAccessStatus())
                        .refundReason(refund != null ? refund.getReason() : tx.getRefundReason())
                        .refundRejectReason(resolveRejectReason(refund, tx))
                        .refundRequestedAt(refund != null ? refund.getCreatedAt() : tx.getRefundRequestedAt())
                        .refundReviewedAt(refund != null ? refund.getReviewedAt() : tx.getRefundReviewedAt())
                        .canRequestRefund(canRequest)
                        .purchaseAt(eligibility.getPurchaseAt())
                        .refundDeadlineAt(eligibility.getRefundDeadlineAt())
                        .remainingSeconds(eligibility.getRemainingSeconds())
                        .progressPercent(eligibility.getProgressPercent())
                        .completedLessons(eligibility.getCompletedLessons())
                        .totalLessons(eligibility.getTotalLessons())
                        .ineligibilityReasons(eligibility.getIneligibilityReasons())
                        .build());
            }
        }
        return new ArrayList<>(latestByCourse.values());
    }

    @Transactional
    public void requestRefundForCourse(Long courseId, RefundRequest request) {
        User user = getCurrentUser();
        TransactionContext ctx = resolveSuccessfulTransaction(user.getUserId(), courseId);
        if (ctx == null) {
            throw new RuntimeException("Không tìm thấy giao dịch thành công để yêu cầu hoàn tiền");
        }

        RefundEligibilityResponse eligibility = buildEligibility(user, ctx.transaction(), ctx.course(), ctx.enrollment());
        if (!eligibility.isCanRequestRefund()) {
            String message = eligibility.getIneligibilityReasons().isEmpty()
                    ? "Không đủ điều kiện hoàn tiền"
                    : eligibility.getIneligibilityReasons().get(0);
            throw new RuntimeException(message);
        }

        RefundReasonCode reasonCode = resolveReasonCode(request);
        String detail = normalizeDetail(request != null ? request.getDetailDescription() : null);
        validateReasonInput(reasonCode, detail);

        Transaction target = ctx.transaction();
        if (refundRequestRepository.existsByTransactionTransactionIdAndStatusIn(
                target.getTransactionId(), OPEN_REFUND_STATUSES)) {
            throw new RuntimeException("Đã có yêu cầu hoàn tiền đang chờ xử lý");
        }

        StudentBankAccount bankAccount = studentBankAccountService.requireDefaultAccount(user);
        LocalDateTime now = LocalDateTime.now();
        String reasonText = buildReasonText(reasonCode, detail);

        RefundRequestEntity refundRequest = RefundRequestEntity.builder()
                .transaction(target)
                .course(ctx.course())
                .student(user)
                .studentBankAccount(bankAccount)
                .reasonCode(reasonCode.getCode())
                .detailDescription(detail)
                .reason(reasonText)
                .purchaseAt(eligibility.getPurchaseAt())
                .progressPercent(eligibility.getProgressPercent())
                .completedLessons(eligibility.getCompletedLessons())
                .totalLessons(eligibility.getTotalLessons())
                .refundDeadlineAt(eligibility.getRefundDeadlineAt())
                .status("PENDING")
                .createdAt(now)
                .updatedAt(now)
                .build();
        refundRequest = refundRequestRepository.save(refundRequest);

        target.setStatus("REFUND_REQUESTED");
        target.setRefundReason(reasonText);
        target.setRefundRejectReason(null);
        target.setRefundRequestedAt(now);
        target.setRefundReviewedAt(null);
        target.setRefundReviewedBy(null);
        target.setUpdatedAt(now);
        transactionRepository.save(target);

        lockEnrollment(user.getUserId(), courseId, now);
        refundAuditService.log("CREATED", refundRequest, user, null, "PENDING", reasonText);
        notifyAdminsNewRefundRequest(user, ctx.course(), target, refundRequest, bankAccount);
    }

    @Transactional
    public void reviewRefund(Long transactionId, boolean approve, String note, String internalNote, String adminUsername) {
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
            List<TeacherEarning> earnings = teacherEarningRepository.findByTransactionTransactionId(transactionId);
            boolean hasReleasedEarning = earnings.stream()
                    .anyMatch(e -> "AVAILABLE".equalsIgnoreCase(e.getStatus()) || "WITHDRAWN".equalsIgnoreCase(e.getStatus()));
            if (hasReleasedEarning) {
                throw new RuntimeException("Không thể duyệt hoàn tiền — doanh thu giảng viên đã chuyển sang có thể rút");
            }

            tx.setStatus("REFUNDED");
            tx.setRefundRejectReason(null);

            if (refundRequest != null) {
                String oldStatus = refundRequest.getStatus();
                refundRequest.setStatus("APPROVED");
                refundRequest.setReviewNote(reviewNote);
                refundRequest.setReviewedBy(admin);
                refundRequest.setReviewedAt(now);
                refundRequest.setPaidAt(now);
                refundRequest.setUpdatedAt(now);
                if (internalNote != null && !internalNote.isBlank()) {
                    refundRequest.setInternalNote(internalNote.trim());
                }
                refundRequestRepository.save(refundRequest);
                refundAuditService.log("APPROVED", refundRequest, admin, oldStatus, "APPROVED", reviewNote);
            }

            finalizeRefundAccess(transactionId, now);
            for (TeacherEarning earning : earnings) {
                earning.setStatus("REFUNDED");
            }
            teacherEarningRepository.saveAll(earnings);
            notifyStudentRefundReviewed(tx.getUser(), refundRequest, true, reviewNote);
        } else {
            if (reviewNote == null || reviewNote.isEmpty()) {
                throw new RuntimeException("Vui lòng nhập lý do từ chối hoàn tiền");
            }
            tx.setStatus("SUCCESS");
            tx.setRefundRejectReason(reviewNote);

            if (refundRequest != null) {
                String oldStatus = refundRequest.getStatus();
                refundRequest.setStatus("REJECTED");
                refundRequest.setReviewNote(reviewNote);
                refundRequest.setRejectReason(reviewNote);
                refundRequest.setReviewedBy(admin);
                refundRequest.setReviewedAt(now);
                refundRequest.setUpdatedAt(now);
                if (internalNote != null && !internalNote.isBlank()) {
                    refundRequest.setInternalNote(internalNote.trim());
                }
                refundRequestRepository.save(refundRequest);
                refundAuditService.log("REJECTED", refundRequest, admin, oldStatus, "REJECTED", reviewNote);
            }

            restoreEnrollmentAfterReject(transactionId, now);
            notifyStudentRefundReviewed(tx.getUser(), refundRequest, false, reviewNote);
        }

        transactionRepository.save(tx);
    }

    RefundEligibilityResponse buildEligibility(User user, Transaction tx, Course course, Enrollment enrollment) {
        List<String> reasons = new ArrayList<>();
        LocalDateTime purchaseAt = resolvePurchaseAt(tx);
        LocalDateTime deadline = purchaseAt.plusSeconds(RefundPolicyConstants.REFUND_WINDOW_SECONDS);
        LocalDateTime now = LocalDateTime.now();
        long elapsed = Duration.between(purchaseAt, now).getSeconds();
        long remaining = Math.max(0, RefundPolicyConstants.REFUND_WINDOW_SECONDS - elapsed);

        int totalLessons = (int) lessonRepository.countRefundableLessonsByCourseId(course.getCourseId());
        int completedLessons = (int) videoProgressRepository.countCompletedLessonsByUserAndCourse(
                user.getUserId(), course.getCourseId());
        BigDecimal progressPercent = calculateProgressPercent(completedLessons, totalLessons);

        String accessStatus = enrollment != null && enrollment.getAccessStatus() != null
                ? enrollment.getAccessStatus()
                : EnrollmentAccessStatus.ACTIVE;

        if (!"SUCCESS".equalsIgnoreCase(tx.getStatus())
                && !"REFUND_REJECTED".equalsIgnoreCase(tx.getStatus())) {
            reasons.add("Giao dịch không còn đủ điều kiện hoàn tiền");
        }
        if ("REFUND_REQUESTED".equalsIgnoreCase(tx.getStatus())) {
            reasons.add("Đang có yêu cầu hoàn tiền đang chờ xử lý");
        }
        if ("REFUNDED".equalsIgnoreCase(tx.getStatus())) {
            reasons.add("Khóa học đã được hoàn tiền");
        }
        if (elapsed > RefundPolicyConstants.REFUND_WINDOW_SECONDS) {
            reasons.add("Đã hết thời hạn hoàn tiền 7 ngày (168 giờ)");
        }
        if (totalLessons == 0) {
            reasons.add("Khóa học chưa có bài học để xác định tiến độ");
        } else if (progressPercent.compareTo(RefundPolicyConstants.MAX_PROGRESS_PERCENT) > 0) {
            reasons.add(String.format(
                    "Bạn đã học %.2f%% (vượt quá 20%%) — không đủ điều kiện hoàn tiền",
                    progressPercent
            ));
        }
        if (EnrollmentAccessStatus.REFUNDED.equalsIgnoreCase(accessStatus)) {
            reasons.add("Khóa học đã được hoàn tiền");
        }
        if (EnrollmentAccessStatus.REFUND_PENDING_LOCKED.equalsIgnoreCase(accessStatus)) {
            reasons.add("Đang có yêu cầu hoàn tiền chờ xử lý");
        }

        return RefundEligibilityResponse.builder()
                .courseId(course.getCourseId())
                .transactionId(tx.getTransactionId())
                .canRequestRefund(reasons.isEmpty())
                .ineligibilityReasons(reasons)
                .purchaseAt(purchaseAt)
                .refundDeadlineAt(deadline)
                .remainingSeconds(remaining)
                .progressPercent(progressPercent)
                .completedLessons(completedLessons)
                .totalLessons(totalLessons)
                .accessStatus(accessStatus)
                .build();
    }

    private void lockEnrollment(Long userId, Long courseId, LocalDateTime now) {
        Enrollment enrollment = enrollmentRepository.findByUserUserIdAndCourseCourseId(userId, courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ghi danh khóa học"));
        enrollment.setHasCourseAccess(false);
        enrollment.setAccessStatus(EnrollmentAccessStatus.REFUND_PENDING_LOCKED);
        enrollment.setUpdatedAt(now);
        enrollmentRepository.save(enrollment);
    }

    private void restoreEnrollmentAfterReject(Long transactionId, LocalDateTime now) {
        List<Enrollment> enrollments = enrollmentRepository
                .findByCourseTransactionItem_Transaction_TransactionId(transactionId);
        for (Enrollment enrollment : enrollments) {
            enrollment.setHasCourseAccess(true);
            enrollment.setAccessStatus(EnrollmentAccessStatus.REJECTED_ACTIVE);
            enrollment.setUpdatedAt(now);
        }
        enrollmentRepository.saveAll(enrollments);
    }

    private void finalizeRefundAccess(Long transactionId, LocalDateTime now) {
        List<Enrollment> enrollments = enrollmentRepository
                .findByCourseTransactionItem_Transaction_TransactionId(transactionId);
        for (Enrollment enrollment : enrollments) {
            enrollment.setHasCourseAccess(false);
            enrollment.setAccessStatus(EnrollmentAccessStatus.REFUNDED);
            enrollment.setUpdatedAt(now);
        }
        enrollmentRepository.saveAll(enrollments);
    }

    private RefundReasonCode resolveReasonCode(RefundRequest request) {
        if (request != null && request.getReasonCode() != null && !request.getReasonCode().isBlank()) {
            return RefundReasonCode.fromCode(request.getReasonCode())
                    .orElseThrow(() -> new RuntimeException("Lý do hoàn tiền không hợp lệ"));
        }
        if (request != null && request.getReason() != null && !request.getReason().isBlank()) {
            return RefundReasonCode.OTHER;
        }
        throw new RuntimeException("Vui lòng chọn lý do hoàn tiền");
    }

    private void validateReasonInput(RefundReasonCode reasonCode, String detail) {
        if (RefundReasonCode.OTHER.equals(reasonCode)) {
            if (detail == null || detail.length() < RefundPolicyConstants.DETAIL_MIN_LENGTH_OTHER) {
                throw new RuntimeException(String.format(
                        "Vui lòng nhập mô tả chi tiết ít nhất %d ký tự",
                        RefundPolicyConstants.DETAIL_MIN_LENGTH_OTHER
                ));
            }
        }
    }

    private String normalizeDetail(String detail) {
        return detail == null ? null : detail.trim();
    }

    private String buildReasonText(RefundReasonCode reasonCode, String detail) {
        if (detail == null || detail.isBlank()) {
            return reasonCode.getLabel();
        }
        return reasonCode.getLabel() + " — " + detail;
    }

    private LocalDateTime resolvePurchaseAt(Transaction tx) {
        if (tx.getPaidAt() != null) {
            return tx.getPaidAt();
        }
        return tx.getCreatedAt();
    }

    private BigDecimal calculateProgressPercent(int completedLessons, int totalLessons) {
        if (totalLessons <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return BigDecimal.valueOf(completedLessons * 100.0 / totalLessons)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private TransactionContext resolveSuccessfulTransaction(Long userId, Long courseId) {
        List<TransactionItem> items = transactionItemRepository
                .findByTransactionUserUserIdAndCourseCourseIdOrderByCreatedAtDesc(userId, courseId);
        for (TransactionItem item : items) {
            Transaction tx = item.getTransaction();
            if (tx == null) {
                continue;
            }
            String status = tx.getStatus() == null ? "" : tx.getStatus().toUpperCase();
            if ("SUCCESS".equals(status) || "REFUND_REJECTED".equals(status)) {
                Enrollment enrollment = enrollmentRepository
                        .findByUserUserIdAndCourseCourseId(userId, courseId)
                        .orElse(null);
                return new TransactionContext(tx, item.getCourse(), enrollment);
            }
        }
        return null;
    }

    private String resolveDisplayStatus(Transaction tx, RefundRequestEntity refund) {
        if (refund != null) {
            return switch (refund.getStatus().toUpperCase()) {
                case "PENDING" -> "REFUND_REQUESTED";
                case "REJECTED" -> "REFUND_REJECTED";
                case "APPROVED", "PAID" -> "REFUNDED";
                default -> tx.getStatus();
            };
        }
        return tx.getStatus();
    }

    private String resolveRejectReason(RefundRequestEntity refund, Transaction tx) {
        if (refund != null && "REJECTED".equalsIgnoreCase(refund.getStatus())) {
            return refund.getRejectReason() != null ? refund.getRejectReason() : refund.getReviewNote();
        }
        return tx.getRefundRejectReason();
    }

    private void notifyAdminsNewRefundRequest(
            User student,
            Course course,
            Transaction tx,
            RefundRequestEntity refundRequest,
            StudentBankAccount bankAccount
    ) {
        try {
            String message = String.format(
                    "Học viên %s yêu cầu hoàn tiền khóa \"%s\" (GD #%d, %s).\nLý do: %s\nTiến độ: %s/%s bài (%.2f%%)",
                    student.getUsername(),
                    course != null ? course.getTitle() : "Khóa học",
                    tx.getTransactionId(),
                    tx.getTotalAmount() != null ? tx.getTotalAmount().toPlainString() + " VND" : "—",
                    refundRequest.getReason(),
                    refundRequest.getCompletedLessons(),
                    refundRequest.getTotalLessons(),
                    refundRequest.getProgressPercent()
            );
            if (bankAccount != null) {
                message += String.format(
                        "\nSTK nhận hoàn: %s | %s | %s",
                        bankAccount.getBankName(),
                        bankAccount.getAccountNumber(),
                        bankAccount.getAccountName()
                );
            }
            List<User> admins = userRepository.searchUsers(null, "admin", null);
            if (admins.isEmpty()) {
                admins = userRepository.findEligibleByRoleName("admin");
            }
            for (User admin : admins) {
                notificationService.notifyUser(admin, "Yêu cầu hoàn tiền mới", message, student);
            }
        } catch (Exception ex) {
            System.err.println("Không gửi được thông báo hoàn tiền cho admin: " + ex.getMessage());
        }
    }

    private void notifyStudentRefundReviewed(User student, RefundRequestEntity refundRequest, boolean approved, String note) {
        if (student == null) {
            return;
        }
        try {
            String title = approved ? "Hoàn tiền được duyệt" : "Yêu cầu hoàn tiền bị từ chối";
            String message = approved
                    ? "Yêu cầu hoàn tiền của bạn đã được duyệt. Khoản tiền sẽ được admin chuyển khoản trong vòng 01 ngày làm việc."
                    : "Yêu cầu hoàn tiền bị từ chối. Lý do: " + note + ". Quyền học khóa học đã được mở lại.";
            notificationService.notifyUser(student, title, message, student);
        } catch (Exception ex) {
            System.err.println("Không gửi được thông báo hoàn tiền cho học viên: " + ex.getMessage());
        }
    }

    private User getCurrentUser() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new RuntimeException("Người dùng chưa đăng nhập");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    private record TransactionContext(Transaction transaction, Course course, Enrollment enrollment) {
    }
}
