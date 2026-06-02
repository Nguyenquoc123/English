package com.learning.english.service;

import com.learning.english.dto.request.MultiCoursePaymentRequest;
import com.learning.english.dto.response.CoursePaymentResponse;
import com.learning.english.dto.response.RefundEligibilityResponse;
import com.learning.english.dto.response.StudentRefundStatusResponse;
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

	@Autowired
	RefundService refundService;

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

		List<Long> courseIds = new ArrayList<>(new LinkedHashSet<>(request.getCourseIds()));

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

			Enrollment enrollment = enrollmentRepository
					.findByUserUserIdAndCourseCourseId(user.getUserId(), course.getCourseId()).orElse(null);
//			boolean hasAccess = false;
			if (enrollment != null) {
				throw new RuntimeException("Bạn đã sở hữu khóa học: " + course.getTitle());
			}

			if (course.getTeacher() == null) {
				throw new RuntimeException("Khóa học chưa có giáo viên: " + course.getTitle());
			}

			BigDecimal price = course.getPrice() == null ? BigDecimal.ZERO : course.getPrice();

			if (price.compareTo(BigDecimal.ZERO) <= 0) {
				throw new RuntimeException("Khóa học miễn phí không cần thanh toán: " + course.getTitle());
			}

			totalAmount = totalAmount.add(price);
		}

		if (totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
			throw new RuntimeException("Tổng tiền thanh toán không hợp lệ");
		}

		Transaction transaction = Transaction.builder().user(user).totalAmount(totalAmount).paymentUrl(null)
				.status("PENDING").paidAt(null).createdAt(now).updatedAt(now).build();

		transaction = transactionRepository.save(transaction);

		for (Course course : courses) {
			TransactionItem item = TransactionItem.builder().transaction(transaction).course(course)
					.teacher(course.getTeacher()).itemType("COURSE").price(course.getPrice()).createdAt(now).build();

			transactionItemRepository.save(item);
		}

		String paymentCode = buildPaymentCode(transaction.getTransactionId());
		String qrUrl = buildSePayQrUrl(paymentCode, totalAmount);

		transaction.setPaymentUrl(qrUrl);
		transaction.setUpdatedAt(now);
		transactionRepository.save(transaction);

		return CoursePaymentResponse.builder().transactionId(transaction.getTransactionId())
				.courseId(courses.size() == 1 ? courses.get(0).getCourseId() : null)
				.courseTitle(courses.size() == 1 ? courses.get(0).getTitle() : "Thanh toán nhiều khóa học")
				.userId(user.getUserId()).paymentCode(paymentCode).amount(totalAmount).status(transaction.getStatus())
				.qrUrl(qrUrl).bankName(bankName).accountNumber(bankAccount).accountName(accountName)
				.createdAt(transaction.getCreatedAt()).build();
	}

	private String buildPaymentCode(Long transactionId) {
		return "SEVQR" + transactionId;
	}

	private String buildSePayQrUrl(String paymentCode, BigDecimal amount) {
		String description = URLEncoder.encode(paymentCode, StandardCharsets.UTF_8);

		return "https://qr.sepay.vn/img" + "?acc=" + bankAccount + "&bank=" + bankName + "&amount=" + amount.longValue()
				+ "&des=" + description + "&template=compact";
	}

	private User getCurrentUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()
				|| "anonymousUser".equals(authentication.getName())) {
			throw new RuntimeException("Người dùng chưa đăng nhập");
		}

		String username = authentication.getName();

		return userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
	}

	public List<StudentRefundStatusResponse> getMyCourseRefundStatuses() {
		return refundService.getMyCourseRefundStatuses();
	}

	@Transactional
	public void requestRefundForCourse(Long courseId, com.learning.english.dto.request.RefundRequest request) {
		refundService.requestRefundForCourse(courseId, request);
	}

	@Transactional
	public void reviewRefund(Long transactionId, boolean approve, String note, String adminUsername) {
		refundService.reviewRefund(transactionId, approve, note, null, adminUsername);
	}

	public RefundEligibilityResponse getRefundEligibility(Long courseId) {
		return refundService.getEligibilityForCourse(courseId);
	}
}