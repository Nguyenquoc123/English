package com.learning.english.service;

import com.learning.english.constant.EnrollmentAccessStatus;
import com.learning.english.constant.RefundPolicyConstants;
import com.learning.english.constant.RefundReasonCode;
import com.learning.english.dto.request.RefundRequest;
import com.learning.english.dto.response.RefundEligibilityResponse;
import com.learning.english.dto.response.RefundReasonOptionResponse;
import com.learning.english.dto.response.RefundRequestHistoryResponse;
import com.learning.english.dto.response.StudentRefundStatusResponse;
import com.learning.english.entity.*;
import com.learning.english.mapper.RefundRequestMapper;
import com.learning.english.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RefundService {

	private static final String TX_SUCCESS = "SUCCESS";
	private static final String TX_REFUND_REQUESTED = "REFUND_REQUESTED";
	private static final String TX_PARTIALLY_REFUND_REQUESTED = "PARTIALLY_REFUND_REQUESTED";
	private static final String TX_REFUND_APPROVED = "REFUND_APPROVED";
	private static final String TX_PARTIALLY_REFUND_APPROVED = "PARTIALLY_REFUND_APPROVED";
	private static final String TX_REFUNDED = "REFUNDED";
	private static final String TX_PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED";
	private static final String TX_REFUND_REJECTED = "REFUND_REJECTED";

	private static final String REFUND_PENDING = "PENDING";
	private static final String REFUND_APPROVED = "APPROVED";
	private static final String REFUND_REJECTED = "REJECTED";
	private static final String REFUND_PAID = "PAID";
	private static final String REFUND_REFUNDED = "REFUNDED";
	private static final String REFUND_CANCELLED = "CANCELLED";

	private static final Set<String> OPEN_REFUND_STATUSES = Set.of(REFUND_PENDING, REFUND_APPROVED);

	private final TransactionRepository transactionRepository;
	private final TransactionItemRepository transactionItemRepository;
	private final RefundRequestRepository refundRequestRepository;
	private final EnrollmentRepository enrollmentRepository;
	private final UserRepository userRepository;
	private final StudentBankAccountService studentBankAccountService;
	private final NotificationService notificationService;
	private final TeacherEarningRepository teacherEarningRepository;
	private final LessonRepository lessonRepository;
	private final VideoProgressRepository videoProgressRepository;
	private final RefundRequestMapper refundRequestMapper;

	public List<RefundReasonOptionResponse> listReasonOptions() {
		return Arrays.stream(RefundReasonCode.values())
				.map(code -> RefundReasonOptionResponse.builder().code(code.getCode()).label(code.getLabel()).build())
				.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public RefundEligibilityResponse getEligibilityForCourse(Long courseId) {
		User user = getCurrentUser();

		TransactionContext ctx = resolveRefundableTransaction(user.getUserId(), courseId);

		if (ctx == null) {
			return RefundEligibilityResponse.builder().courseId(courseId).canRequestRefund(false)
					.ineligibilityReasons(List.of("Không tìm thấy giao dịch hợp lệ để hoàn tiền")).build();
		}

		RefundRequestEntity latestRefund = refundRequestRepository
				.findFirstByTransactionItemTransactionItemIdOrderByCreatedAtDesc(
						ctx.transactionItem().getTransactionItemId())
				.orElse(null);

		return buildEligibilityForCourseItem(user, ctx.transaction(), ctx.transactionItem(), ctx.enrollment(),
				latestRefund);
	}

	@Transactional(readOnly = true)
	public List<StudentRefundStatusResponse> getMyCourseRefundStatuses() {
		User user = getCurrentUser();

		List<Transaction> transactions = transactionRepository.findByUserUserIdOrderByCreatedAtDesc(user.getUserId());

		Map<Long, StudentRefundStatusResponse> latestByCourse = new LinkedHashMap<>();

		for (Transaction tx : transactions) {
			List<TransactionItem> items = transactionItemRepository
					.findByTransactionTransactionId(tx.getTransactionId());

			for (TransactionItem item : items) {
				if (item.getCourse() == null) {
					continue;
				}

				Long courseId = item.getCourse().getCourseId();

				if (latestByCourse.containsKey(courseId)) {
					continue;
				}

				Enrollment enrollment = enrollmentRepository
						.findByUserUserIdAndCourseCourseId(user.getUserId(), courseId).orElse(null);

				RefundRequestEntity latestRefund = refundRequestRepository
						.findFirstByTransactionItemTransactionItemIdOrderByCreatedAtDesc(item.getTransactionItemId())
						.orElse(null);

				RefundEligibilityResponse eligibility = buildEligibilityForCourseItem(user, tx, item, enrollment,
						latestRefund);
				boolean canRequestRefund = eligibility.isCanRequestRefund();
				if(latestRefund != null)
					canRequestRefund = false;
				latestByCourse.put(courseId, StudentRefundStatusResponse.builder().courseId(courseId)
						.transactionId(tx.getTransactionId()).status(resolveCourseRefundDisplayStatus(tx, latestRefund))
						.accessStatus(eligibility.getAccessStatus()).refundReason(resolveRefundReason(latestRefund))
						.refundRejectReason(resolveRefundRejectReason(latestRefund))
						.refundRequestedAt(resolveRefundRequestedAt(latestRefund))
						.refundReviewedAt(resolveRefundReviewedAt(latestRefund))
						.canRequestRefund(canRequestRefund).purchaseAt(eligibility.getPurchaseAt())
						.refundDeadlineAt(eligibility.getRefundDeadlineAt())
						.remainingSeconds(eligibility.getRemainingSeconds())
						.progressPercent(eligibility.getProgressPercent())
						.completedLessons(eligibility.getCompletedLessons()).totalLessons(eligibility.getTotalLessons())
						.ineligibilityReasons(eligibility.getIneligibilityReasons()).build());
			}
		}

		return new ArrayList<>(latestByCourse.values());
	}

	@Transactional
	public RefundRequestEntity requestRefundForCourse(Long courseId, RefundRequest request) {
		User user = getCurrentUser();

		TransactionContext ctx = resolveRefundableTransaction(user.getUserId(), courseId);

		if (ctx == null) {
			throw new RuntimeException("Không tìm thấy giao dịch hợp lệ để yêu cầu hoàn tiền");
		}

		Transaction tx = ctx.transaction();
		TransactionItem item = ctx.transactionItem();

		RefundRequestEntity latestRefund = refundRequestRepository
				.findFirstByTransactionItemTransactionItemIdOrderByCreatedAtDesc(item.getTransactionItemId())
				.orElse(null);

		RefundEligibilityResponse eligibility = buildEligibilityForCourseItem(user, tx, item, ctx.enrollment(),
				latestRefund);

		if (!eligibility.isCanRequestRefund()) {
			String message = eligibility.getIneligibilityReasons().isEmpty() ? "Không đủ điều kiện hoàn tiền"
					: eligibility.getIneligibilityReasons().get(0);

			throw new RuntimeException(message);
		}

		boolean hasOpenRefund = refundRequestRepository
				.existsByTransactionItemTransactionItemIdAndStatusIn(item.getTransactionItemId(), OPEN_REFUND_STATUSES);

		if (hasOpenRefund) {
			throw new RuntimeException("Đã có yêu cầu hoàn tiền đang chờ xử lý cho khóa học này");
		}

		RefundReasonCode reasonCode = resolveReasonCode(request);
		String detail = normalizeDetail(request != null ? request.getDetailDescription() : null);

		validateReasonInput(reasonCode, detail);

//        StudentBankAccount bankAccount = studentBankAccountService.requireDefaultAccount(user);
		System.err.println(reasonCode.getCode());
		System.err.println(reasonCode.getLabel());
		LocalDateTime now = LocalDateTime.now();
		String reasonText = buildReasonText(reasonCode, detail);

		RefundRequestEntity refundRequest = RefundRequestEntity.builder().transactionItem(item).course(item.getCourse())
				.student(user).nameBank(tx.getNameBank()).accountBank(tx.getAccountBank()).reason(reasonText)
				.reasonCode(reasonCode.getCode()).detailDescription(detail)
				.purchaseAt(eligibility.getPurchaseAt()).progressPercent(eligibility.getProgressPercent())
				.completedLessons(eligibility.getCompletedLessons()).totalLessons(eligibility.getTotalLessons())
				.amount(item.getPrice().multiply(BigDecimal.valueOf(0.8)))
				.refundDeadlineAt(eligibility.getRefundDeadlineAt()).status(REFUND_PENDING)
				.rejectReason(null).reviewedBy(null).reviewedAt(null).paidAt(null).createdAt(now)
				.reason(reasonText)
				.build();

		refundRequest = refundRequestRepository.save(refundRequest);

		lockEnrollment(user.getUserId(), courseId, now);

		refreshTransactionRefundStatus(tx, now);

		notifyAdminsNewRefundRequest(user, item.getCourse(), tx, refundRequest);

		return refundRequest;
	}

	/**
	 * Admin duyệt hoặc từ chối yêu cầu hoàn tiền. Vẫn nhận transactionId để không
	 * cần sửa controller nhiều. Nếu transaction có nhiều item, service sẽ tìm
	 * refund PENDING mới nhất trong các item.
	 */
	@Transactional
	public RefundRequestEntity reviewRefund(Long refundRequestId, boolean approve, String note, String internalNote,
			String adminUsername) {

		RefundRequestEntity refundRequest = refundRequestRepository.findById(refundRequestId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu hoàn tiền"));

		if (!REFUND_PENDING.equalsIgnoreCase(refundRequest.getStatus())) {
			throw new RuntimeException("Yêu cầu hoàn tiền này không ở trạng thái chờ xử lý");
		}

		TransactionItem item = refundRequest.getTransactionItem();

		if (item == null) {
			throw new RuntimeException("Yêu cầu hoàn tiền không có chi tiết giao dịch");
		}

		User admin = userRepository.findByUsername(adminUsername)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy admin"));

		LocalDateTime now = LocalDateTime.now();
		String reviewNote = normalizeText(note);
		String normalizedInternalNote = normalizeText(internalNote);

		if (approve) {
			approveRefund(item, refundRequest, admin, reviewNote, normalizedInternalNote, now);
		} else {
			rejectRefund(refundRequest, admin, reviewNote, normalizedInternalNote, now);
		}



		return refundRequest;
	}



	private void approveRefund(TransactionItem item, RefundRequestEntity refundRequest, User admin, String reviewNote,
			String internalNote, LocalDateTime now) {
		List<TeacherEarning> earnings = teacherEarningRepository
				.findByTransactionItemTransactionItemId(item.getTransactionItemId());

		boolean hasWithdrawnEarning = earnings.stream().anyMatch(e -> "WITHDRAWN".equalsIgnoreCase(e.getStatus()));

		if (hasWithdrawnEarning) {
			throw new RuntimeException("Không thể duyệt hoàn tiền — giáo viên đã rút doanh thu của khóa học này");
		}

		refundRequest.setStatus(REFUND_APPROVED);
		refundRequest.setRejectReason(null);
		refundRequest.setReviewedBy(admin);
		refundRequest.setReviewedAt(now);
		refundRequest.setPaidAt(null);

		refundRequest.setReviewedBy(admin);
		refundRequest.setReviewedAt(now);
		refundRequest.setRejectReason(null);

		
		refundRequestRepository.save(refundRequest);

		notifyStudentRefundReviewed(refundRequest.getStudent(), refundRequest, true, reviewNote);
	}

	private void rejectRefund(RefundRequestEntity refundRequest, User admin, String reviewNote, String internalNote,
			LocalDateTime now) {
		if (reviewNote == null || reviewNote.isBlank()) {
			throw new RuntimeException("Vui lòng nhập lý do từ chối hoàn tiền");
		}

		refundRequest.setStatus(REFUND_REJECTED);
		refundRequest.setRejectReason(reviewNote);
		refundRequest.setReviewedBy(admin);
		refundRequest.setReviewedAt(now);
		refundRequest.setPaidAt(null);

		refundRequest.setReviewedBy(admin);
		refundRequest.setReviewedAt(now);
		refundRequest.setRejectReason(reviewNote);

		
		refundRequestRepository.save(refundRequest);

		restoreEnrollmentAfterReject(refundRequest, now);

		notifyStudentRefundReviewed(refundRequest.getStudent(), refundRequest, false, reviewNote);
	}

	
	private void lockEnrollment(Long userId, Long courseId, LocalDateTime now) {
		Enrollment enrollment = enrollmentRepository.findByUserUserIdAndCourseCourseId(userId, courseId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy ghi danh khóa học"));

		enrollment.setHasCourseAccess(false);
		enrollment.setAccessStatus(EnrollmentAccessStatus.REFUND_PENDING_LOCKED);
		enrollment.setUpdatedAt(now);

		enrollmentRepository.save(enrollment);
	}

	private void restoreEnrollmentAfterReject(RefundRequestEntity refundRequest, LocalDateTime now) {
		if (refundRequest.getStudent() == null || refundRequest.getCourse() == null) {
			return;
		}

		Enrollment enrollment = enrollmentRepository.findByUserUserIdAndCourseCourseId(
				refundRequest.getStudent().getUserId(), refundRequest.getCourse().getCourseId()).orElse(null);

		if (enrollment == null) {
			return;
		}

		enrollment.setHasCourseAccess(true);
		enrollment.setAccessStatus(EnrollmentAccessStatus.REJECTED_ACTIVE);
		enrollment.setUpdatedAt(now);

		enrollmentRepository.save(enrollment);
	}

	

	private RefundEligibilityResponse buildEligibilityForCourseItem(User user, Transaction tx, TransactionItem item,
			Enrollment enrollment, RefundRequestEntity latestRefund) {
		Course course = item.getCourse();

		if (course == null) {
			return RefundEligibilityResponse.builder().transactionId(tx.getTransactionId()).canRequestRefund(false)
					.ineligibilityReasons(List.of("Không tìm thấy khóa học trong giao dịch")).build();
		}

		List<String> reasons = new ArrayList<>();

		LocalDateTime purchaseAt = resolvePurchaseAt(tx);
		LocalDateTime now = LocalDateTime.now();
		LocalDateTime deadline = purchaseAt.plusSeconds(RefundPolicyConstants.REFUND_WINDOW_SECONDS);

		long elapsed = Duration.between(purchaseAt, now).getSeconds();
		long remaining = Math.max(0, RefundPolicyConstants.REFUND_WINDOW_SECONDS - elapsed);

		int totalLessons = (int) lessonRepository.countRefundableLessonsByCourseId(course.getCourseId());

		int completedLessons = (int) videoProgressRepository.countCompletedLessonsByUserAndCourse(user.getUserId(),
				course.getCourseId());

		BigDecimal progressPercent = calculateProgressPercent(completedLessons, totalLessons);

		String accessStatus = enrollment != null && enrollment.getAccessStatus() != null ? enrollment.getAccessStatus()
				: EnrollmentAccessStatus.ACTIVE;

		if (latestRefund != null && latestRefund.getStatus() != null) {
			String refundStatus = latestRefund.getStatus();

			if (REFUND_PENDING.equalsIgnoreCase(refundStatus)) {
				reasons.add("Đang có yêu cầu hoàn tiền đang chờ xử lý");
			}

			if (REFUND_APPROVED.equalsIgnoreCase(refundStatus)) {
				reasons.add("Yêu cầu hoàn tiền đã được duyệt và đang chờ chuyển tiền");
			}

			if (REFUND_PAID.equalsIgnoreCase(refundStatus) || REFUND_REFUNDED.equalsIgnoreCase(refundStatus)) {
				reasons.add("Khóa học đã được hoàn tiền");
			}
		}

		String txStatus = tx.getStatus() == null ? "" : tx.getStatus();

		if (TX_REFUNDED.equalsIgnoreCase(txStatus) && latestRefund == null) {
			reasons.add("Giao dịch đã được hoàn tiền");
		}

		if (elapsed > RefundPolicyConstants.REFUND_WINDOW_SECONDS) {
			reasons.add("Đã hết thời hạn hoàn tiền 7 ngày (168 giờ)");
		}

		if (totalLessons == 0) {
			reasons.add("Khóa học chưa có bài học để xác định tiến độ");
		} else if (progressPercent.compareTo(RefundPolicyConstants.MAX_PROGRESS_PERCENT) > 0) {
			reasons.add(String.format("Bạn đã học %.2f%%, vượt quá mức cho phép để hoàn tiền", progressPercent));
		}

		if (EnrollmentAccessStatus.REFUNDED.equalsIgnoreCase(accessStatus)) {
			reasons.add("Khóa học đã được hoàn tiền");
		}

		if (EnrollmentAccessStatus.REFUND_PENDING_LOCKED.equalsIgnoreCase(accessStatus)) {
			reasons.add("Đang có yêu cầu hoàn tiền chờ xử lý");
		}

		return RefundEligibilityResponse.builder().courseId(course.getCourseId()).transactionId(tx.getTransactionId())
				.canRequestRefund(reasons.isEmpty()).ineligibilityReasons(reasons).purchaseAt(purchaseAt)
				.refundDeadlineAt(deadline).remainingSeconds(remaining).progressPercent(progressPercent)
				.completedLessons(completedLessons).totalLessons(totalLessons).accessStatus(accessStatus).build();
	}

	private void refreshTransactionRefundStatus(Transaction tx, LocalDateTime now) {
		List<TransactionItem> items = transactionItemRepository.findByTransactionTransactionId(tx.getTransactionId());

		if (items == null || items.isEmpty()) {
			return;
		}

		int totalItems = items.size();
		int pendingCount = 0;
		int approvedCount = 0;
		int refundedCount = 0;
		int rejectedCount = 0;
		int noRefundCount = 0;

		for (TransactionItem item : items) {
			RefundRequestEntity latestRefund = refundRequestRepository
					.findFirstByTransactionItemTransactionItemIdOrderByCreatedAtDesc(item.getTransactionItemId())
					.orElse(null);

			if (latestRefund == null || latestRefund.getStatus() == null) {
				noRefundCount++;
				continue;
			}

			String status = latestRefund.getStatus().toUpperCase();

			switch (status) {
			case REFUND_PENDING -> pendingCount++;
			case REFUND_APPROVED -> approvedCount++;
			case REFUND_PAID, REFUND_REFUNDED -> refundedCount++;
			case REFUND_REJECTED, REFUND_CANCELLED -> rejectedCount++;
			default -> noRefundCount++;
			}
		}

		if (pendingCount > 0) {
			tx.setStatus(totalItems == 1 ? TX_REFUND_REQUESTED : TX_PARTIALLY_REFUND_REQUESTED);
		} else if (approvedCount > 0) {
			tx.setStatus(totalItems == 1 ? TX_REFUND_APPROVED : TX_PARTIALLY_REFUND_APPROVED);
		} else if (refundedCount == totalItems) {
			tx.setStatus(TX_REFUNDED);
		} else if (refundedCount > 0) {
			tx.setStatus(TX_PARTIALLY_REFUNDED);
		} else if (rejectedCount > 0) {
			tx.setStatus(TX_REFUND_REJECTED);
		} else {
			tx.setStatus(TX_SUCCESS);
		}

		tx.setUpdatedAt(now);
		transactionRepository.save(tx);
	}

	

	private TransactionContext resolveRefundableTransaction(Long userId, Long courseId) {
		List<TransactionItem> items = transactionItemRepository
				.findByTransactionUserUserIdAndCourseCourseIdOrderByCreatedAtDesc(userId, courseId);

		for (TransactionItem item : items) {
			Transaction tx = item.getTransaction();

			if (tx == null || tx.getStatus() == null) {
				continue;
			}

			String txStatus = tx.getStatus().toUpperCase();

			// giao dịch thành công
			boolean allowedTransactionStatus = TX_SUCCESS.equals(txStatus);

			if (!allowedTransactionStatus) {
				continue;
			}

			Enrollment enrollment = enrollmentRepository.findByUserUserIdAndCourseCourseId(userId, courseId)
					.orElse(null);

			return new TransactionContext(tx, item, item.getCourse(), enrollment);
		}

		return null;
	}

	private String resolveCourseRefundDisplayStatus(Transaction tx, RefundRequestEntity refund) {
		if (refund != null && refund.getStatus() != null) {
			return switch (refund.getStatus().toUpperCase()) {
			case REFUND_PENDING -> "REFUND_REQUESTED";
			case REFUND_APPROVED -> "REFUND_APPROVED";
			case REFUND_REJECTED -> "REFUND_REJECTED";
			case REFUND_PAID, REFUND_REFUNDED -> "REFUNDED";
			case REFUND_CANCELLED -> "REFUND_CANCELLED";
			default -> refund.getStatus();
			};
		}

		if (tx.getStatus() == null) {
			return TX_SUCCESS;
		}

		if (TX_SUCCESS.equalsIgnoreCase(tx.getStatus())
				|| TX_PARTIALLY_REFUND_REQUESTED.equalsIgnoreCase(tx.getStatus())
				|| TX_PARTIALLY_REFUND_APPROVED.equalsIgnoreCase(tx.getStatus())
				|| TX_PARTIALLY_REFUNDED.equalsIgnoreCase(tx.getStatus())) {
			return TX_SUCCESS;
		}

		return tx.getStatus();
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
				throw new RuntimeException(String.format("Vui lòng nhập mô tả chi tiết ít nhất %d ký tự",
						RefundPolicyConstants.DETAIL_MIN_LENGTH_OTHER));
			}
		}
	}

	private String buildReasonText(RefundReasonCode reasonCode, String detail) {
		if (detail == null || detail.isBlank()) {
			return reasonCode.getLabel();
		}

		return reasonCode.getLabel() + " — " + detail;
	}

	private String normalizeDetail(String detail) {
		return detail == null ? null : detail.trim();
	}

	private String normalizeText(String text) {
		return text == null ? null : text.trim();
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

		return BigDecimal.valueOf(completedLessons).multiply(BigDecimal.valueOf(100))
				.divide(BigDecimal.valueOf(totalLessons), 2, RoundingMode.HALF_UP);
	}

	private String resolveRefundReason(RefundRequestEntity refund) {
		if (refund == null) {
			return null;
		}

		if (refund.getReason() != null && !refund.getReason().isBlank()) {
			return refund.getReason();
		}

		return refund.getReason();
	}

	private String resolveRefundRejectReason(RefundRequestEntity refund) {
		if (refund == null) {
			return null;
		}
		
		return refund.getRejectReason();

		
	}

	private LocalDateTime resolveRefundRequestedAt(RefundRequestEntity refund) {
		if (refund == null) {
			return null;
		}

		return refund.getCreatedAt() != null ? refund.getCreatedAt() : refund.getCreatedAt();
	}

	private LocalDateTime resolveRefundReviewedAt(RefundRequestEntity refund) {
		if (refund == null) {
			return null;
		}

		return refund.getReviewedAt() != null ? refund.getReviewedAt() : refund.getReviewedAt();
	}

	private void notifyAdminsNewRefundRequest(User student, Course course, Transaction tx,
			RefundRequestEntity refundRequest) {
		try {
			String message = String.format(
					"Học viên %s yêu cầu hoàn tiền khóa \"%s\" (GD #%d, %s).\nLý do: %s\nTiến độ: %s/%s bài (%.2f%%)",
					student.getUsername(), course != null ? course.getTitle() : "Khóa học", tx.getTransactionId(),
					tx.getTotalAmount() != null ? tx.getTotalAmount().toPlainString() + " VND" : "—",
					refundRequest.getReason(), refundRequest.getCompletedLessons(), refundRequest.getTotalLessons(),
					refundRequest.getProgressPercent());

			if (tx != null) {
				message += String.format("\nSTK nhận hoàn: %s | %s | %s", tx.getNameBank(), tx.getAccountBank()

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

	private void notifyStudentRefundReviewed(User student, RefundRequestEntity refundRequest, boolean approved,
			String note) {
		if (student == null) {
			return;
		}

		try {
			String title = approved ? "Yêu cầu hoàn tiền đã được duyệt" : "Yêu cầu hoàn tiền bị từ chối";

			String message = approved
					? "Yêu cầu hoàn tiền của bạn đã được duyệt. Admin sẽ chuyển khoản hoàn tiền trong thời gian sớm nhất."
					: "Yêu cầu hoàn tiền bị từ chối. Lý do: " + note + ". Quyền học khóa học đã được mở lại.";

			notificationService.notifyUser(student, title, message, student);
		} catch (Exception ex) {
			System.err.println("Không gửi được thông báo hoàn tiền cho học viên: " + ex.getMessage());
		}
	}

	
	
	
	@Transactional(readOnly = true)
    public List<RefundRequestHistoryResponse> getMyRefundRequestHistory() {
        User user = getCurrentUser();

        List<RefundRequestEntity> refundRequests =
                refundRequestRepository.findByStudent_UserIdOrderByCreatedAtDesc(
                        user.getUserId()
                );

        return refundRequestMapper.toHistoryResponses(refundRequests);
    }

	private User getCurrentUser() {
		var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
				.getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()
				|| "anonymousUser".equals(authentication.getName())) {
			throw new RuntimeException("Người dùng chưa đăng nhập");
		}

		return userRepository.findByUsername(authentication.getName())
				.orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
	}

	private record TransactionContext(Transaction transaction, TransactionItem transactionItem, Course course,
			Enrollment enrollment) {
	}
}