package com.learning.english.service;

import com.learning.english.dto.response.*;
import com.learning.english.dto.response.TransactionAdminResponse;
import com.learning.english.dto.response.CourseReviewResponse;
import com.learning.english.entity.*;
import com.learning.english.mapper.CourseMapper;
import com.learning.english.mapper.LessonMapper;
import com.learning.english.mapper.TeacherProfileMapper;
import com.learning.english.constant.RefundReasonCode;
import com.learning.english.constant.RefundPolicyConstants;
import com.learning.english.dto.request.NotificationRequest;
import com.learning.english.dto.request.AdminCreateUserRequest;
import com.learning.english.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static java.util.Set.of;

@Service
public class AdminService {

	@Autowired
	UserRepository userRepository;

	@Autowired
	CourseRepository courseRepository;

	@Autowired
	TeacherProfileRepository teacherProfileRepository;

	@Autowired
	TeacherProfileMapper teacherProfileMapper;

	@Autowired
	WithdrawalRepository withdrawalRepository;

	@Autowired
	TransactionRepository transactionRepository;

	@Autowired
	RoleRepository roleRepository;

	@Autowired
	CourseMapper courseMapper;

	@Autowired
	LessonRepository lessonRepository;

	@Autowired
	LessonMapper lessonMapper;

	@Autowired
	ExamRepository examRepository;

	@Autowired
	NotificationRepository notificationRepository;

	@Autowired
	NotificationService notificationService;

	@Autowired
	CourseReviewRepository courseReviewRepository;

	@Autowired
	TransactionItemRepository transactionItemRepository;

	@Autowired
	CoursePaymentService coursePaymentService;

	@Autowired
	StudentFeedbackTaskRepository studentFeedbackTaskRepository;

	@Autowired
	RefundRequestRepository refundRequestRepository;

	@Autowired
	StudentBankAccountRepository studentBankAccountRepository;

	@Autowired
	WithdrawalService withdrawalService;

	@Autowired
	RefundService refundService;

	public AdminDashboardResponse getDashboard() {
		long totalUsers = userRepository.count();
		long totalStudents = userRepository.countByRole_RoleName("student");
		long totalTeachers = userRepository.countByRole_RoleName("teacher");
		long totalCourses = courseRepository.count();
		long pendingTeachers = teacherProfileRepository.countByApprovalStatus("PENDING");
		long pendingCourses = courseRepository.countByStatus("PENDING");
		long pendingWithdrawals = withdrawalRepository.countByStatus("PENDING");
		long pendingStudentFeedbacks = safeCountPendingStudentFeedbacks();
		long pendingRefunds = safeCountPendingRefunds();
		BigDecimal totalRevenue = transactionRepository.sumSuccessAmount();
		if (totalRevenue == null)
			totalRevenue = BigDecimal.ZERO;

		return AdminDashboardResponse.builder().totalUsers(totalUsers).totalStudents(totalStudents)
				.totalTeachers(totalTeachers).totalCourses(totalCourses).pendingTeachers(pendingTeachers)
				.pendingCourses(pendingCourses).pendingWithdrawals(pendingWithdrawals)
				.pendingStudentFeedbacks(pendingStudentFeedbacks).pendingRefunds(pendingRefunds)
				.totalRevenue(totalRevenue).build();
	}

	private long safeCountPendingRefunds() {
		try {
			return getPendingRefundRequest().size();
		} catch (Exception ex) {
			return 0;
		}
	}

	private long safeCountPendingStudentFeedbacks() {
		try {
			return studentFeedbackTaskRepository.countByStatus("OPEN");
		} catch (Exception ex) {
			return 0;
		}
	}

	public List<UserAdminResponse> getAllUsers(String keyword, String roleName, String status) {
		List<User> users;

		boolean noFilter = (keyword == null || keyword.isBlank()) && (roleName == null || roleName.isBlank())
				&& (status == null || status.isBlank());

		if (noFilter) {
			users = userRepository.findAllByOrderByCreatedAtDesc();
		} else {
			users = userRepository.searchUsers(keyword == null || keyword.isBlank() ? null : keyword,
					roleName == null || roleName.isBlank() ? null : roleName,
					status == null || status.isBlank() ? null : status);
		}

		return users.stream().map(this::toUserAdminResponse).collect(Collectors.toList());
	}

	public UserAdminResponse getUserDetail(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
		return toUserAdminResponse(user);
	}

	@Transactional
	public UserAdminResponse createUser(AdminCreateUserRequest request) {
		if (request.getUsername() == null || request.getUsername().isBlank())
			throw new RuntimeException("Username không được rỗng");
		if (request.getUsername().trim().length() < 3)
			throw new RuntimeException("Username tối thiểu 3 ký tự");
		if (request.getEmail() == null || request.getEmail().isBlank())
			throw new RuntimeException("Email không được rỗng");
		if (request.getPassword() == null || request.getPassword().isBlank())
			throw new RuntimeException("Mật khẩu không được rỗng");
		if (request.getPassword().length() < 6)
			throw new RuntimeException("Mật khẩu tối thiểu 6 ký tự");

		String roleName = request.getRoleName();
		if (roleName == null || roleName.isBlank())
			throw new RuntimeException("Vui lòng chọn vai trò");
		if (userRepository.existsByUsername(request.getUsername()))
			throw new RuntimeException("Username đã tồn tại: " + request.getUsername());
		if (userRepository.existsByEmail(request.getEmail()))
			throw new RuntimeException("Email đã tồn tại: " + request.getEmail());

		Role role = roleRepository.findByRoleName(roleName)
				.orElseThrow(() -> new RuntimeException("Vai trò không tồn tại: " + roleName));

		org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
		String encodedPassword = encoder.encode(request.getPassword());

		String status = (request.getStatus() != null && !request.getStatus().isBlank()) ? request.getStatus()
				: "active";

		User user = User.builder().username(request.getUsername()).email(request.getEmail()).password(encodedPassword)
				.fullName(request.getFullName()).role(role).status(status).createdAt(LocalDateTime.now())
				.updatedAt(LocalDateTime.now()).build();

		User savedUser = userRepository.save(user);
		return toUserAdminResponse(savedUser);
	}

	@Transactional
	public UserAdminResponse updateUserRole(Long userId, String roleName) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

		if ("admin".equalsIgnoreCase(user.getRole() != null ? user.getRole().getRoleName() : ""))
			throw new RuntimeException("Không thể đổi role của Admin");

		Role role = roleRepository.findByRoleName(roleName)
				.orElseThrow(() -> new RuntimeException("Role không tồn tại: " + roleName));

		user.setRole(role);
		user.setUpdatedAt(LocalDateTime.now());
		user = userRepository.save(user);
		return toUserAdminResponse(user);
	}

	@Transactional
	public UserAdminResponse updateUserStatus(Long userId, String status) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
		user.setStatus(status);
		user.setUpdatedAt(LocalDateTime.now());
		user = userRepository.save(user);
		return toUserAdminResponse(user);
	}

	private UserAdminResponse toUserAdminResponse(User user) {
		return UserAdminResponse.builder().userId(user.getUserId()).username(user.getUsername()).email(user.getEmail())
				.fullName(user.getFullName()).avatarUrl(user.getAvatarUrl())
				.roleName(user.getRole() != null ? user.getRole().getRoleName() : null)
				.roleId(user.getRole() != null ? user.getRole().getRoleId() : null).status(user.getStatus())
				.createdAt(user.getCreatedAt()).updatedAt(user.getUpdatedAt()).build();
	}

	@Transactional(readOnly = true)
	public List<TeacherProfileResponse> getPendingTeachers() {
		return teacherProfileRepository.findByApprovalStatusOrderByCreatedAtDesc("PENDING").stream()
				.map(teacherProfileMapper::toTeacherProfileResponse).collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public List<TeacherProfileResponse> getAllTeacherProfiles() {
		return teacherProfileRepository.findAllByOrderByCreatedAtDesc().stream()
				.map(teacherProfileMapper::toTeacherProfileResponse).collect(Collectors.toList());
	}

	public List<CourseResponse> getPendingCourses() {
		return courseRepository.findByStatusOrderByCreatedAtDesc("PENDING").stream().map(courseMapper::toCourseResponse)
				.collect(Collectors.toList());
	}

	public List<CourseResponse> getAllCourses() {
		return courseRepository.findAllByOrderByCreatedAtDesc().stream().map(courseMapper::toCourseResponse)
				.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public List<WithdrawalResponse> getPendingWithdrawals() {
		return withdrawalRepository.findByStatusWithDetailsOrderByRequestedAtDesc("PENDING").stream()
				.map(withdrawalService::toWithdrawalResponse).collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public List<WithdrawalResponse> getAllWithdrawals() {
		return withdrawalRepository.findAllWithDetailsOrderByRequestedAtDesc().stream()
				.map(withdrawalService::toWithdrawalResponse).collect(Collectors.toList());
	}

//    @Transactional
//    public WithdrawalResponse reviewWithdrawalByUsername(Long withdrawalId, String status, String rejectReason, String adminUsername) {
//        User admin = userRepository.findByUsername(adminUsername)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy admin"));
//
//        return withdrawalService.reviewWithdrawal(withdrawalId, status, rejectReason, admin);
//    }

	// ==================== LESSON FREE MANAGEMENT ====================

//    public List<LessonResponse> getFreeLessons() {
//        return lessonRepository.findByLessonTypeOrderByCreatedAtDesc("Free")
//                .stream()
//                .map(lessonMapper::toLessonResponse)
//                .collect(Collectors.toList());
//    }

	@Transactional
	public LessonResponse createFreeLesson(String title, String description, String status) {
		if (title == null || title.isBlank())
			throw new RuntimeException("Tiêu đề bài học không được rỗng");

		Lesson lesson = Lesson.builder().course(null).title(title).description(description)
				.status(status != null ? status : "Published").createdAt(LocalDateTime.now())
				.updatedAt(LocalDateTime.now()).build();

		lesson = lessonRepository.save(lesson);
		return lessonMapper.toLessonResponse(lesson);
	}

	@Transactional
	public LessonResponse updateFreeLesson(Long lessonId, String title, String description, String status) {
		Lesson lesson = lessonRepository.findById(lessonId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy bài học"));

//        if (!"Free".equals(lesson.getLessonType()))
//            throw new RuntimeException("Bài học này không phải lesson free");

		if (title != null && !title.isBlank())
			lesson.setTitle(title);
		if (description != null)
			lesson.setDescription(description);
		if (status != null && !status.isBlank())
			lesson.setStatus(status);
		lesson.setUpdatedAt(LocalDateTime.now());

		lesson = lessonRepository.save(lesson);
		return lessonMapper.toLessonResponse(lesson);
	}

	@Transactional
	public void deleteFreeLesson(Long lessonId) {
		Lesson lesson = lessonRepository.findById(lessonId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy bài học"));

//        if (!"Free".equals(lesson.getLessonType()))
//            throw new RuntimeException("Chỉ được xóa bài học miễn phí");

		lesson.setStatus("deleted");
		lesson.setUpdatedAt(LocalDateTime.now());
		lessonRepository.save(lesson);
	}

	public List<ExamAdminResponse> getAllExams() {
		return examRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toExamAdminResponse)
				.collect(Collectors.toList());
	}

	@Transactional
	public ExamAdminResponse updateExamStatus(Long examId, String status) {
		Exam exam = examRepository.findById(examId).orElseThrow(() -> new RuntimeException("Không tìm thấy kỳ thi"));
		exam.setStatus(status);
		exam.setUpdatedAt(LocalDateTime.now());
		exam = examRepository.save(exam);
		return toExamAdminResponse(exam);
	}

	private ExamAdminResponse toExamAdminResponse(Exam exam) {
		return ExamAdminResponse.builder().examId(exam.getExamId()).title(exam.getTitle())
				.description(exam.getDescription()).durationMinutes(exam.getDurationMinutes()).status(exam.getStatus())
				.courseId(exam.getCourse() != null ? exam.getCourse().getCourseId() : null)
				.courseTitle(exam.getCourse() != null ? exam.getCourse().getTitle() : null)
				.createdByUsername(exam.getCreatedBy() != null ? exam.getCreatedBy().getUsername() : null)
				.createdAt(exam.getCreatedAt()).updatedAt(exam.getUpdatedAt()).build();
	}

	@Transactional
	public NotificationResponse createNotification(NotificationRequest req, String adminUsername) {
		return notificationService.createBroadcast(req, adminUsername);
	}

	public List<NotificationResponse> getAllNotifications() {
		return notificationService.getAllBroadcasts();
	}

	private NotificationResponse toNotificationResponse(Notification n) {
		return NotificationResponse.builder().notificationId(n.getNotificationId()).title(n.getTitle())
				.message(n.getMessage()).targetType(n.getTargetType()).targetValue(n.getTargetValue())
				.createdByUsername(n.getCreatedBy() != null ? n.getCreatedBy().getUsername() : null)
				.createdAt(n.getCreatedAt()).build();
	}

	// ==================== TRANSACTION MANAGEMENT ====================

	@Transactional(readOnly = true)
	public List<TransactionAdminResponse> getAllTransactions() {
		return transactionRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toTransactionAdminResponse)
				.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public List<RefundRequestAdminResponse> getAllRefunds() {
		return refundRequestRepository.findAllRefunds().stream().map(this::toRefundRequestAdminResponse).toList();
	}
	
	@Transactional(readOnly = true)
	public List<RefundRequestAdminResponse> getPendingRefundRequest() {
		return refundRequestRepository.findRefundPending().stream().map(this::toRefundRequestAdminResponse).toList();
	}

	

	private List<RefundRequestEntity> ensureRefundRequestsForTransaction(Transaction tx) {
		List<RefundRequestEntity> results = new ArrayList<>();

		if (tx == null || tx.getTransactionId() == null) {
			return results;
		}

		List<TransactionItem> items = transactionItemRepository.findByTransactionTransactionId(tx.getTransactionId());

		for (TransactionItem item : items) {
			RefundRequestEntity refund = ensureRefundRequestForTransactionItem(tx, item);

			if (refund != null) {
				results.add(refund);
			}
		}

		return results;
	}

	private RefundRequestEntity ensureRefundRequestForTransactionItem(Transaction tx, TransactionItem item) {
		if (tx == null || item == null || item.getTransactionItemId() == null) {
			return null;
		}

		if (refundRequestRepository.existsByTransactionItemTransactionItemIdAndStatusIn(item.getTransactionItemId(), Set.of("PENDING"))) {
			return refundRequestRepository
					.findFirstByTransactionItemTransactionItemIdAndStatusOrderByCreatedAtDesc(
							item.getTransactionItemId(), "PENDING")
					.orElseGet(() -> refundRequestRepository
							.findFirstByTransactionItemTransactionItemIdOrderByCreatedAtDesc(
									item.getTransactionItemId())
							.orElse(null));
		}

		RefundRequestEntity existing = refundRequestRepository
				.findFirstByTransactionItemTransactionItemIdOrderByCreatedAtDesc(item.getTransactionItemId())
				.orElse(null);

		if (existing != null && "PENDING".equalsIgnoreCase(existing.getStatus())) {
			return existing;
		}

		User student = tx.getUser();
		Course course = item.getCourse();

		LocalDateTime requestedAt = existing.getCreatedAt() != null ? existing.getCreatedAt() : LocalDateTime.now();

		String reason = existing.getReason();

		

		RefundRequestEntity created = RefundRequestEntity.builder().transactionItem(item).course(course)
				.student(student).nameBank(tx.getNameBank()).accountBank(tx.getAccountBank()).reason(reason).reasonCode(null)
				.detailDescription(null).status("PENDING").reviewedBy(null).reviewedAt(null)
				.paidAt(null).purchaseAt(tx.getPaidAt() != null ? tx.getPaidAt() : tx.getCreatedAt())
				.createdAt(requestedAt).build();

		return refundRequestRepository.save(created);
	}

	private void syncTransactionForPendingRefund(RefundRequestEntity rr) {
		Transaction tx = getTransactionFromRefundRequest(rr);

		if (tx == null) {
			return;
		}

		String status = tx.getStatus() == null ? "" : tx.getStatus();

//		if ("SUCCESS".equalsIgnoreCase(status) || "REFUND_REQUESTED".equalsIgnoreCase(status)) {
//			if (!"REFUND_REQUESTED".equalsIgnoreCase(status)) {
//				tx.setStatus("REFUND_REQUESTED");
//			}
//
//			if (tx.getRefundReason() == null || tx.getRefundReason().isBlank()) {
//				tx.setRefundReason(rr.getReason());
//			}
//
//			if (tx.getRefundRequestedAt() == null) {
//				tx.setRefundRequestedAt(rr.getCreatedAt());
//			}
//
//			tx.setUpdatedAt(LocalDateTime.now());
//
//			transactionRepository.save(tx);
//		}
	}

	private Transaction getTransactionFromRefundRequest(RefundRequestEntity rr) {
		if (rr == null || rr.getTransactionItem() == null) {
			return null;
		}

		return rr.getTransactionItem().getTransaction();
	}

	@Transactional
	public void reviewRefund(Long transactionId, boolean approve, String note, String internalNote,
			String adminUsername) {
		refundService.reviewRefund(transactionId, approve, note, internalNote, adminUsername);
	}

	private RefundRequestAdminResponse toRefundRequestAdminResponse(RefundRequestEntity rr) {
		User student = rr.getStudent();

		TransactionItem item = rr.getTransactionItem();
		Transaction tx = item != null ? item.getTransaction() : null;

		Course course = rr.getCourse() != null ? rr.getCourse() : item != null ? item.getCourse() : null;

//		var bank = rr.getStudentBankAccount();

		User teacher = course != null ? course.getTeacher() : null;

		String reasonCode = rr.getReasonCode();

		String reasonLabel = RefundReasonCode.fromCode(reasonCode).map(RefundReasonCode::getLabel).orElse(null);
		
		

		Long remainingSeconds = null;

		if (rr.getRefundDeadlineAt() != null && rr.getCreatedAt() != null) {
			LocalDateTime purchaseAt = rr.getPurchaseAt() != null ? rr.getPurchaseAt() : rr.getCreatedAt();

			long elapsed = java.time.Duration.between(purchaseAt, rr.getCreatedAt()).getSeconds();

			remainingSeconds = Math.max(0, RefundPolicyConstants.REFUND_WINDOW_SECONDS - elapsed);
		}

		BigDecimal amount = rr.getAmount();
		String paymenCode = buildPaymentCode(rr.getRefundRequestId());
		String qrPay = buildSePayQrUrl(paymenCode, amount, rr.getAccountBank(), rr.getNameBank());
		return RefundRequestAdminResponse.builder().refundRequestId(rr.getRefundRequestId())
				.transactionItemId(rr != null ? rr.getTransactionItem().getTransactionItemId() : null)
				.courseId(course != null ? course.getCourseId() : null)
				.courseTitle(course != null ? course.getTitle() : null)
				.teacherId(teacher != null ? teacher.getUserId() : null)
				.teacherName(teacher != null ? teacher.getFullName() : null)
				.studentId(student != null ? student.getUserId() : null)
				.studentUsername(student != null ? student.getUsername() : null)
				.studentFullName(student != null ? student.getFullName() : null)
				.studentEmail(student != null ? student.getEmail() : null)
				.studentPhone(student != null ? student.getPhone() : null)
				.refundBankName(rr.getNameBank())
				.refundAccountNumber(rr.getAccountBank())
				.amount(amount).reasonCode(reasonCode)
				.reasonLabel(reasonLabel).reason(rr.getReason()).detailDescription(rr.getDetailDescription())
				.status(rr.getStatus()).purchaseAt(rr.getPurchaseAt()).refundDeadlineAt(rr.getRefundDeadlineAt())
				.remainingSecondsAtRequest(remainingSeconds).progressPercent(rr.getProgressPercent())
				.completedLessons(rr.getCompletedLessons()).totalLessons(rr.getTotalLessons())
				.createdAt(rr.getCreatedAt()).reviewedAt(rr.getReviewedAt()).rejectReason(rr.getRejectReason())
				.qrPay(qrPay).paymentCode(paymenCode)
				.build();
	}
	
	private String buildSePayQrUrl(String paymentCode, BigDecimal amount, String bankAccount, String bankName) {
		String description = URLEncoder.encode(paymentCode, StandardCharsets.UTF_8);

		return "https://qr.sepay.vn/img" + "?acc=" + bankAccount + "&bank=" + bankName + "&amount=" + amount.longValue()
				+ "&des=" + description + "&template=compact";
	}

	private String buildPaymentCode(Long withdrawalId) {
		return "SEVQRHT" + withdrawalId;
	}

	private String resolveDisplayStatus(Transaction t, RefundRequestEntity latestRefund) {
		if (latestRefund != null) {
			String refundStatus = latestRefund.getStatus();
			if (refundStatus == null) {
				return t.getStatus();
			}
			if ("PENDING".equalsIgnoreCase(refundStatus) || "APPROVED".equalsIgnoreCase(refundStatus)) {
				return "REFUND_REQUESTED";
			}
			if ("REJECTED".equalsIgnoreCase(refundStatus)) {
				return "REFUND_REJECTED";
			}
			if ("PAID".equalsIgnoreCase(refundStatus)) {
				return "REFUNDED";
			}
		}
		return t.getStatus();
	}

	private TransactionAdminResponse toTransactionAdminResponse(Transaction t) {
		User user = t.getUser();

		List<TransactionItem> items = transactionItemRepository.findByTransactionTransactionId(t.getTransactionId());

		TransactionItem firstItem = items.isEmpty() ? null : items.get(0);

		String targetType = firstItem != null ? firstItem.getItemType() : null;

		Long targetId = firstItem != null && firstItem.getCourse() != null ? firstItem.getCourse().getCourseId() : null;

		String targetName = firstItem != null && firstItem.getCourse() != null ? firstItem.getCourse().getTitle()
				: null;

		
		Long refundRequestId = null;
//		StudentBankAccount refundBank = null;

		RefundRequestEntity latestRefund = findLatestRefundByTransactionId(t.getTransactionId());
		String refundReason = null;
		String refundRejectReason = null;
		LocalDateTime refundRequestedAt = null;
		LocalDateTime refundReviewedAt = null;
		String refundReviewedByUsername =  null;
		String nameBank = null;
		String accountBank = null;
		if (latestRefund != null) {
			refundReason =  latestRefund.getReason();
			refundRejectReason = latestRefund.getRejectReason();
			refundRequestedAt = latestRefund.getCreatedAt();
			refundReviewedAt = latestRefund.getReviewedAt();

			refundReviewedByUsername = latestRefund.getReviewedBy() != null ? latestRefund.getReviewedBy().getUsername()
					: null;
			

			refundRequestId = latestRefund.getRefundRequestId();
			refundReason = latestRefund.getReason();
			refundRequestedAt = latestRefund.getCreatedAt();
			refundReviewedAt = latestRefund.getReviewedAt();
			nameBank = latestRefund.getNameBank();
			accountBank = latestRefund.getAccountBank();
//			refundBank = latestRefund.getStudentBankAccount();

			if (latestRefund.getReviewedBy() != null) {
				refundReviewedByUsername = latestRefund.getReviewedBy().getUsername();
			}

			if ("REJECTED".equalsIgnoreCase(latestRefund.getStatus())) {
				refundRejectReason = latestRefund.getRejectReason();
			}

			Course refundCourse = latestRefund.getCourse();

			if (refundCourse == null && latestRefund.getTransactionItem() != null
					&& latestRefund.getTransactionItem().getCourse() != null) {
				refundCourse = latestRefund.getTransactionItem().getCourse();
			}

			if (refundCourse != null) {
				targetId = refundCourse.getCourseId();
				targetName = refundCourse.getTitle();
				targetType = "COURSE";
			}
		}

		String displayStatus = resolveDisplayStatus(t, latestRefund);

		return TransactionAdminResponse.builder().transactionId(t.getTransactionId()).refundRequestId(refundRequestId)

				.userId(user != null ? user.getUserId() : null).username(user != null ? user.getUsername() : null)
				.email(user != null ? user.getEmail() : null)

				.targetType(targetType).targetId(targetId).targetName(targetName)

				.amount(t.getTotalAmount()).status(displayStatus)

				.refundBankName(nameBank)
				.refundAccountNumber(accountBank)
				

				.refundReason(refundReason).refundRejectReason(refundRejectReason).refundRequestedAt(refundRequestedAt)
				.refundReviewedAt(refundReviewedAt).refundReviewedByUsername(refundReviewedByUsername)

				.createdAt(t.getCreatedAt()).updatedAt(t.getUpdatedAt()).build();
	}

	private RefundRequestEntity findLatestRefundByTransactionId(Long transactionId) {
		List<TransactionItem> items = transactionItemRepository.findByTransactionTransactionId(transactionId);

		RefundRequestEntity latest = null;

		for (TransactionItem item : items) {
			RefundRequestEntity refund = refundRequestRepository
					.findFirstByTransactionItemTransactionItemIdOrderByCreatedAtDesc(item.getTransactionItemId())
					.orElse(null);

			if (refund == null) {
				continue;
			}

			if (latest == null) {
				latest = refund;
				continue;
			}

			if (refund.getCreatedAt() != null && latest.getCreatedAt() != null
					&& refund.getCreatedAt().isAfter(latest.getCreatedAt())) {
				latest = refund;
			}
		}

		return latest;
	}

//    public List<TransactionAdminResponse> getAllTransactions() {
//        return transactionRepository.findAllByOrderByCreatedAtDesc()
//                .stream()
//                .map(this::toTransactionAdminResponse)
//                .collect(Collectors.toList());
//    }
//
//    private TransactionAdminResponse toTransactionAdminResponse(Transaction t) {
//        User user = t.getUser();
//        return TransactionAdminResponse.builder()
//                .transactionId(t.getTransactionId())
//                .userId(user != null ? user.getUserId() : null)
//                .username(user != null ? user.getUsername() : null)
//                .email(user != null ? user.getEmail() : null)
//                .targetType(t.getTargetType())
//                .targetId(t.getTargetId())
//                .targetName(resolveTargetName(t.getTargetType(), t.getTargetId()))
//                .amount(t.getAmount())
//                .status(t.getStatus())
//                .createdAt(t.getCreatedAt())
//                .updatedAt(t.getUpdatedAt())
//                .build();
//    }

	private String resolveTargetName(String targetType, Long targetId) {
		if (targetId == null)
			return null;

		if ("COURSE".equals(targetType)) {
			return courseRepository.findById(targetId).map(c -> c.getTitle()).orElse("[Khóa học #" + targetId + "]");
		}

		if ("EXAM".equals(targetType)) {
			return examRepository.findById(targetId).map(e -> e.getTitle()).orElse("[Kỳ thi #" + targetId + "]");
		}

		return "[Không xác định #" + targetId + "]";
	}

	public List<CourseReviewResponse> getAllCourseReviews() {
		return courseReviewRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toCourseReviewResponse)
				.collect(Collectors.toList());
	}

	@Transactional
	public void deleteCourseReview(Long reviewId) {
		if (!courseReviewRepository.existsById(reviewId))
			throw new RuntimeException("Không tìm thấy đánh giá");
		courseReviewRepository.deleteById(reviewId);
	}

	private CourseReviewResponse toCourseReviewResponse(CourseReview r) {
		return CourseReviewResponse.builder().reviewId(r.getReviewId())
				.courseId(r.getCourse() != null ? r.getCourse().getCourseId() : null)
				.userId(r.getUser() != null ? r.getUser().getUserId() : null)
				.fullName(r.getUser() != null ? r.getUser().getFullName() : null)
				.avatarUrl(r.getUser() != null ? r.getUser().getAvatarUrl() : null).rating(r.getRating())
				.comment(r.getComment()).createdAt(r.getCreatedAt()).updatedAt(r.getUpdatedAt()).build();
	}

	@Transactional
	public void changeAdminPassword(String username, String oldPassword, String newPassword, String confirmPassword) {
		if (oldPassword == null || oldPassword.isBlank())
			throw new RuntimeException("Vui lòng nhập mật khẩu hiện tại");
		if (newPassword == null || newPassword.isBlank())
			throw new RuntimeException("Vui lòng nhập mật khẩu mới");
		if (!newPassword.equals(confirmPassword))
			throw new RuntimeException("Mật khẩu mới và xác nhận mật khẩu không khớp");
		if (newPassword.length() < 6)
			throw new RuntimeException("Mật khẩu mới phải có ít nhất 6 ký tự");

		User admin = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản admin"));

		org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

		if (!encoder.matches(oldPassword, admin.getPassword()))
			throw new RuntimeException("Mật khẩu hiện tại không đúng");

		admin.setPassword(encoder.encode(newPassword));
		admin.setUpdatedAt(LocalDateTime.now());
		userRepository.save(admin);
	}
}
