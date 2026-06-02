package com.learning.english.service;

import com.learning.english.dto.request.SePayWebhookRequest;
import com.learning.english.dto.response.NotificationSseResponse;
import com.learning.english.entity.Course;
import com.learning.english.entity.Enrollment;
import com.learning.english.entity.RefundRequestEntity;
import com.learning.english.entity.TeacherEarning;
import com.learning.english.entity.Transaction;
import com.learning.english.entity.TransactionItem;
import com.learning.english.entity.User;
import com.learning.english.entity.Withdrawal;
import com.learning.english.repository.CartItemRepository;
import com.learning.english.repository.EnrollmentRepository;
import com.learning.english.repository.RefundRequestRepository;
import com.learning.english.repository.TeacherEarningRepository;
import com.learning.english.repository.TransactionItemRepository;
import com.learning.english.repository.TransactionRepository;
import com.learning.english.repository.WithdrawalRepository;

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
	private final SystemSettingService systemSettingService;
	private final WithdrawalRepository withdrawalRepository;
	private final CartItemRepository cartItemRepository;
	private final RefundRequestRepository refundRequestRepository;

	private final SseService sseService;

	@Transactional
	public void xuLyThanhToanSePay(SePayWebhookRequest request) {
		if (request.getTransferType() == null || !"in".equalsIgnoreCase(request.getTransferType())) {
			return;
		}

		Long transactionId = extractTransactionId(request);

		if (transactionId == null) {
			return;
		}

		Transaction transaction = transactionRepository.findById(transactionId).orElse(null);

		if (transaction == null) {
			return;
		}

		if (!"PENDING".equalsIgnoreCase(transaction.getStatus())) {
			return;
		}

		BigDecimal paidAmount = BigDecimal
				.valueOf(request.getTransferAmount() != null ? request.getTransferAmount() : 0);

		if (paidAmount.compareTo(transaction.getTotalAmount()) < 0) {
			transaction.setStatus("FAILED");
			transaction.setUpdatedAt(LocalDateTime.now());
			transactionRepository.save(transaction);
			
			sseService.sendWithdrawalFailed((NotificationSseResponse.builder().amount(paidAmount)
					.message("Số tiền thanh toán không đủ").paidAt(LocalDateTime.now()).status(transaction.getStatus())
					.transactionCode(request.getCode()).build()));
			return;
		}

		List<TransactionItem> items = transactionItemRepository.findByTransactionTransactionId(transactionId);

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
		Double fee = systemSettingService.getPhiNenTang();

		for (TransactionItem item : items) {
			taoHoacCapNhatEnrollment(savedTransaction, item, now);
			taoDoanhThuGiaoVien(savedTransaction, item, now, fee);
			deleteGioHang(item.getCourse().getCourseId());
		}

		sseService.sendWithdrawalPaid(
				NotificationSseResponse.builder().amount(paidAmount).message("Thanh toán thành công").paidAt(now)
						.status(transaction.getStatus()).transactionCode(request.getCode()).build());
	}

	void deleteGioHang(Long courseId) {
		cartItemRepository.deleteByCourse_CourseId(courseId);
	}

	@Transactional
	public void xuLyChuyenTienSePay(SePayWebhookRequest request) {
		if (request.getTransferType() == null || !"out".equalsIgnoreCase(request.getTransferType())) {
			return;
		}

		Long withdrawnId = extractTransactionId(request);

		if (withdrawnId == null) {
			return;
		}

		Withdrawal withdrawal = withdrawalRepository.findById(withdrawnId).orElse(null);

		if (withdrawal == null) {
			return;
		}

		if (!"APPROVED".equalsIgnoreCase(withdrawal.getStatus())) {
			return;
		}

		BigDecimal paidAmount = BigDecimal
				.valueOf(request.getTransferAmount() != null ? request.getTransferAmount() : 0);

		if (paidAmount.compareTo(withdrawal.getAmount()) < 0) {
			withdrawal.setStatus("FAILED");
			withdrawalRepository.save(withdrawal);
			sseService.sendWithdrawalFailed((NotificationSseResponse.builder().amount(paidAmount)
					.message("Số tiền thanh toán không đủ").paidAt(LocalDateTime.now()).status(withdrawal.getStatus())
					.transactionCode(request.getCode()).build()));
			return;
		}

		LocalDateTime now = LocalDateTime.now();

		withdrawal.setStatus("PAID");
		withdrawal.setPaidAt(now);

		withdrawalRepository.save(withdrawal);

		sseService.sendWithdrawalPaid(
				NotificationSseResponse.builder().amount(paidAmount).message("Thanh toán thành công").paidAt(now)
						.status(withdrawal.getStatus()).transactionCode(request.getCode()).build());

	}

	@Transactional
	public void xuLyHoanTienSePay(SePayWebhookRequest request) {
		if (request.getTransferType() == null || !"out".equalsIgnoreCase(request.getTransferType())) {
			return;
		}

		Long refundId = extractRefundId(request);

		if (refundId == null) {
			return;
		}

		RefundRequestEntity refundRequestEntity = refundRequestRepository.findById(refundId).orElse(null);

		if (refundRequestEntity == null) {
			return;
		}
		System.out.println("=================================11111111111111111");
		Course course = refundRequestEntity.getCourse();
		TransactionItem transactionItem = refundRequestEntity.getTransactionItem();
		User user = refundRequestEntity.getStudent();

		if (!"APPROVED".equalsIgnoreCase(refundRequestEntity.getStatus())) {
			return;
		}

		System.out.println("=================================2222222222222222");

		BigDecimal paidAmount = BigDecimal
				.valueOf(request.getTransferAmount() != null ? request.getTransferAmount() : 0);

		if (paidAmount.compareTo(transactionItem.getPrice()) < 0) {
			refundRequestEntity.setStatus("FAILED");
			refundRequestRepository.save(refundRequestEntity);
			return;
		}

		System.out.println("=================================3333333333333333333");
		Enrollment enrollment = enrollmentRepository
				.findByUserUserIdAndCourseCourseId(user.getUserId(), course.getCourseId())
				.orElseThrow(() -> new RuntimeException("Bạn chưa mua khóa học"));

		TeacherEarning teacherEarning = teacherEarningRepository
				.findByCourseCourseIdAndTransactionItemTransactionItemId(course.getCourseId(),
						transactionItem.getTransactionItemId())
				.orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch"));
		teacherEarning.setStatus("REFUNDED");
		teacherEarningRepository.save(teacherEarning);

		LocalDateTime now = LocalDateTime.now();

		refundRequestEntity.setStatus("PAID");
		refundRequestEntity.setPaidAt(now);

		enrollmentRepository.delete(enrollment);
		refundRequestRepository.save(refundRequestEntity);

//		System.out.println(request.getCode() + " || " + request.getContent());
		sseService.sendWithdrawalPaid(
				NotificationSseResponse.builder().amount(paidAmount).message("Thanh toán thành công").paidAt(now)
						.status(refundRequestEntity.getStatus()).transactionCode(request.getCode()).build());

	}

	private void taoHoacCapNhatEnrollment(Transaction transaction, TransactionItem item, LocalDateTime now) {
		User student = transaction.getUser();
		Course course = item.getCourse();

		Enrollment enrollment = enrollmentRepository
				.findByUserUserIdAndCourseCourseId(student.getUserId(), course.getCourseId()).orElse(null);

		if (enrollment == null) {
			enrollment = Enrollment.builder().user(student).course(course).hasCourseAccess(true)
					.accessStatus(com.learning.english.constant.EnrollmentAccessStatus.ACTIVE)
					.courseTransactionItem(item).createdAt(now).updatedAt(now).build();
		} else {
			enrollment.setHasCourseAccess(true);
			enrollment.setAccessStatus(com.learning.english.constant.EnrollmentAccessStatus.ACTIVE);
			enrollment.setCourseTransactionItem(item);
			enrollment.setUpdatedAt(now);
		}

		enrollmentRepository.save(enrollment);
	}

	private void taoDoanhThuGiaoVien(Transaction transaction, TransactionItem item, LocalDateTime now, Double fee) {
		if (teacherEarningRepository.existsByTransactionItemTransactionItemId(item.getTransactionItemId())) {
			return;
		}

		User teacher = item.getTeacher();

		if (teacher == null) {
			return;
		}

		BigDecimal grossAmount = item.getPrice() == null ? BigDecimal.ZERO : item.getPrice();

		BigDecimal platformFeeRate = new BigDecimal(fee * 0.01);

		BigDecimal platformFee = grossAmount.multiply(platformFeeRate);
		BigDecimal netAmount = grossAmount.subtract(platformFee);
		LocalDateTime holdReleaseAt = now.plusHours(168);

		TeacherEarning earning = TeacherEarning.builder().teacher(teacher).course(item.getCourse())
				.transaction(transaction).transactionItem(item).grossAmount(grossAmount).platformFee(platformFee)
				.netAmount(netAmount).status("PENDING").holdReleaseAt(holdReleaseAt).withdrawableAmount(netAmount)
				.createdAt(now).build();

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

	private Long extractRefundId(SePayWebhookRequest request) {
		Long idFromCode = extractRefundIdFromText(request.getCode());

		if (idFromCode != null) {
			return idFromCode;
		}

		Long idFromContent = extractRefundIdFromText(request.getContent());

		if (idFromContent != null) {
			return idFromContent;
		}

		return extractIdFromText(request.getDescription());
	}

	private Long extractRefundIdFromText(String text) {
		if (text == null || text.isBlank()) {
			return null;
		}

		Pattern pattern = Pattern.compile("SEVQRHT(\\d+)");
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
