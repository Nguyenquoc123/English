package com.learning.english.service;

import com.learning.english.dto.request.WithdrawalCreateRequest;
import com.learning.english.dto.response.TeacherBankAccountResponse;
import com.learning.english.dto.response.TeacherWithdrawalSummaryResponse;
import com.learning.english.dto.response.WithdrawalResponse;
import com.learning.english.entity.SystemSetting;
import com.learning.english.entity.TeacherBankAccount;
import com.learning.english.entity.TeacherEarning;
import com.learning.english.entity.User;
import com.learning.english.entity.Withdrawal;
import com.learning.english.entity.WithdrawalEarning;
import com.learning.english.repository.SystemSettingRepository;
import com.learning.english.repository.TeacherEarningRepository;
import com.learning.english.repository.UserRepository;
import com.learning.english.repository.WithdrawalEarningRepository;
import com.learning.english.repository.WithdrawalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class WithdrawalService {

	@Autowired
	WithdrawalRepository withdrawalRepository;

	@Autowired
	TeacherEarningRepository teacherEarningRepository;

	@Autowired
	TeacherBankAccountService teacherBankAccountService;

	@Autowired
	UserRepository userRepository;

	@Autowired
	NotificationService notificationService;

	@Autowired
	SystemSettingRepository systemSettingRepository;
	
	@Autowired
	WithdrawalEarningRepository withdrawalEarningRepository;
	

	@Transactional(readOnly = true)
	public TeacherWithdrawalSummaryResponse getMySummary() {
		User teacher = getCurrentUser();
		Long teacherId = teacher.getUserId();

		BigDecimal totalRevenue = teacherEarningRepository.sumTotalRevenueByTeacherId(teacherId);
		if (totalRevenue == null) {
			totalRevenue = BigDecimal.ZERO;
		}

		BigDecimal availableGross = teacherEarningRepository.sumAvailableRevenueByTeacherId(teacherId);
		if (availableGross == null) {
			availableGross = BigDecimal.ZERO;
		}

		BigDecimal pendingAmount = withdrawalRepository.sumPendingAmountByTeacherId(teacherId);
		if (pendingAmount == null) {
			pendingAmount = BigDecimal.ZERO;
		}

		BigDecimal availableBalance = availableGross.subtract(pendingAmount);
		if (availableBalance.compareTo(BigDecimal.ZERO) < 0) {
			availableBalance = BigDecimal.ZERO;
		}

		long pendingCount = withdrawalRepository.countByTeacher_UserIdAndStatus(teacherId, "PENDING");
		List<TeacherBankAccountResponse> bankAccounts = teacherBankAccountService.listMyAccounts();

		return TeacherWithdrawalSummaryResponse.builder().totalRevenue(totalRevenue).availableBalance(availableBalance)
				.pendingWithdrawalAmount(pendingAmount).pendingWithdrawalCount(pendingCount).bankAccounts(bankAccounts)
				.build();
	}

	@Transactional(readOnly = true)
	public List<WithdrawalResponse> getMyWithdrawals() {
		User teacher = getCurrentUser();
		return withdrawalRepository.findByTeacher_UserIdOrderByRequestedAtDesc(teacher.getUserId()).stream()
				.map(this::toWithdrawalResponse).toList();
	}

	@Transactional
	public WithdrawalResponse createWithdrawal(WithdrawalCreateRequest request) {
	    User teacher = getCurrentUser();

	    if (request == null || request.getAmount() == null) {
	        throw new RuntimeException("Vui lòng nhập số tiền rút");
	    }

	    BigDecimal amount = request.getAmount();

	    if (amount.compareTo(BigDecimal.ZERO) <= 0) {
	        throw new RuntimeException("Số tiền rút phải lớn hơn 0");
	    }

	    SystemSetting systemSetting = systemSettingRepository
	            .findBySettingKey("MIN_WITHDRAW_AMOUNT")
	            .orElse(null);

	    if (systemSetting != null) {
	        BigDecimal minWithdrawAmount = new BigDecimal(systemSetting.getSettingValue());

	        if (amount.compareTo(minWithdrawAmount) < 0) {
	            throw new RuntimeException(
	                    "Số tiền rút phải lớn hơn hoặc bằng "
	                            + minWithdrawAmount.toPlainString()
	                            + " VNĐ"
	            );
	        }
	    }

	    if (amount.scale() > 0 && amount.stripTrailingZeros().scale() > 0) {
	        throw new RuntimeException("Số tiền rút phải là số nguyên (VND)");
	    }

	    TeacherWithdrawalSummaryResponse summary = getMySummary();

	    if (summary.getAvailableBalance().compareTo(amount) < 0) {
	        throw new RuntimeException("Số dư khả dụng không đủ để rút tiền");
	    }

	    TeacherBankAccount bankAccount = teacherBankAccountService.requireOwnedAccount(
	            teacher,
	            request.getBankAccountId()
	    );

	    LocalDateTime now = LocalDateTime.now();

	    Withdrawal withdrawal = Withdrawal.builder()
	            .teacher(teacher)
	            .bankAccount(bankAccount)
	            .amount(amount)
	            .status("PENDING")
	            .requestedAt(now)
	            .build();

	    withdrawal = withdrawalRepository.save(withdrawal);

	    lockEarningsForWithdrawal(teacher.getUserId(), withdrawal, amount);

	    notifyAdminsNewWithdrawal(teacher, withdrawal, bankAccount);

	    return toWithdrawalResponse(withdrawal);
	}
	
	
	private void lockEarningsForWithdrawal(Long teacherId, Withdrawal withdrawal, BigDecimal amount) {
	    List<TeacherEarning> available = teacherEarningRepository
	            .findByTeacher_UserIdAndStatusOrderByCreatedAtAsc(teacherId, "AVAILABLE");

	    BigDecimal remaining = amount;

	    List<TeacherEarning> earningsToUpdate = new ArrayList<>();
	    List<WithdrawalEarning> withdrawalEarningsToSave = new ArrayList<>();

	    LocalDateTime now = LocalDateTime.now();

	    for (TeacherEarning earning : available) {
	        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
	            break;
	        }

	        BigDecimal canUse = earning.getWithdrawableAmount();

	        if (canUse == null || canUse.compareTo(BigDecimal.ZERO) <= 0) {
	            continue;
	        }

	        BigDecimal usedAmount;

	        if (canUse.compareTo(remaining) <= 0) {
	            usedAmount = canUse;

	            earning.setWithdrawableAmount(BigDecimal.ZERO);
	            earning.setStatus("WITHDRAWING");

	            remaining = remaining.subtract(canUse);
	        } else {
	            usedAmount = remaining;

	            earning.setWithdrawableAmount(canUse.subtract(remaining));

	            // Còn tiền khả dụng nên vẫn giữ AVAILABLE
	            earning.setStatus("AVAILABLE");

	            remaining = BigDecimal.ZERO;
	        }

	        WithdrawalEarning withdrawalEarning = WithdrawalEarning.builder()
	                .withdrawal(withdrawal)
	                .teacherEarning(earning)
	                .amount(usedAmount)
	                .createdAt(now)
	                .build();

	        withdrawalEarningsToSave.add(withdrawalEarning);
	        earningsToUpdate.add(earning);
	    }

	    if (remaining.compareTo(BigDecimal.ZERO) > 0) {
	        throw new RuntimeException("Số dư doanh thu khả dụng không đủ để hoàn tất rút tiền");
	    }

	    teacherEarningRepository.saveAll(earningsToUpdate);
	    withdrawalEarningRepository.saveAll(withdrawalEarningsToSave);
	}
	
	

	@Transactional
	public WithdrawalResponse duyetWithdrawn(Long withdrawalId) {

		User admin = getCurrentUser();

		if (!"admin".equals(admin.getRole().getRoleName())) {
			throw new RuntimeException("Bạn không có quyền");
		}

		Withdrawal withdrawal = withdrawalRepository.findById(withdrawalId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu rút tiền"));

		if (!"PENDING".equalsIgnoreCase(withdrawal.getStatus())) {
			throw new RuntimeException("Yêu cầu này không ở trạng thái chờ duyệt");
		}

		withdrawal.setStatus("APPROVED");
		String paymentCode = buildPaymentCode(withdrawalId);
		String qrPay = buildSePayQrUrl(paymentCode, withdrawal.getAmount(),
				withdrawal.getBankAccount().getAccountNumber(), withdrawal.getBankAccount().getBankName());

		withdrawal.setQrPay(qrPay);
		withdrawal.setPaymentcode(paymentCode);
		withdrawal.setReviewedAt(LocalDateTime.now());
		withdrawal.setReviewedBy(admin);
		withdrawal = withdrawalRepository.save(withdrawal);

		notifyTeacherWithdrawalReviewed(withdrawal);

		return toWithdrawalResponse(withdrawal);
	}
	
	@Transactional
	public WithdrawalResponse tuChoiWithdrawal(Long withdrawalId, String rejectReason) {
	    if (rejectReason == null || rejectReason.trim().isEmpty()) {
	        throw new RuntimeException("Vui lòng nhập lý do từ chối");
	    }

	    User admin = getCurrentUser();

	    Withdrawal withdrawal = withdrawalRepository.findById(withdrawalId)
	            .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu rút tiền"));

	    String status = withdrawal.getStatus();

	    if (!"PENDING".equalsIgnoreCase(status) && !"APPROVED".equalsIgnoreCase(status)) {
	        throw new RuntimeException("Chỉ có thể từ chối yêu cầu đang chờ duyệt");
	    }

	    List<WithdrawalEarning> details = withdrawalEarningRepository
	            .findByWithdrawal_WithdrawalId(withdrawalId);

	    if (details.isEmpty()) {
	        throw new RuntimeException("Không tìm thấy chi tiết doanh thu đã khóa cho yêu cầu rút tiền này");
	    }

	    for (WithdrawalEarning detail : details) {
	        TeacherEarning earning = detail.getTeacherEarning();

	        BigDecimal currentWithdrawable = earning.getWithdrawableAmount() == null
	                ? BigDecimal.ZERO
	                : earning.getWithdrawableAmount();

	        earning.setWithdrawableAmount(currentWithdrawable.add(detail.getAmount()));
	        earning.setStatus("AVAILABLE");

	        teacherEarningRepository.save(earning);
	    }

	    withdrawal.setStatus("REJECTED");
	    withdrawal.setRejectReason(rejectReason.trim());
	    withdrawal.setReviewedAt(LocalDateTime.now());
	    withdrawal.setReviewedBy(admin);

	    withdrawal = withdrawalRepository.save(withdrawal);

	    return toWithdrawalResponse(withdrawal);
	}
	
	
	// cập nhật các trạng thái trong withdrawals và teacher_earning sau khi chuyển tiền thành công
	@Transactional
	public Withdrawal markWithdrawalPaid(Long withdrawalId) {
	    Withdrawal withdrawal = withdrawalRepository.findById(withdrawalId)
	            .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu rút tiền"));

	    if (!"APPROVED".equalsIgnoreCase(withdrawal.getStatus())) {
	        throw new RuntimeException("Chỉ có thể xác nhận chuyển tiền cho yêu cầu đã được duyệt");
	    }

	    List<WithdrawalEarning> details = withdrawalEarningRepository
	            .findByWithdrawal_WithdrawalId(withdrawalId);

	    if (details.isEmpty()) {
	        throw new RuntimeException("Không tìm thấy chi tiết doanh thu đã khóa cho yêu cầu rút tiền này");
	    }

	    for (WithdrawalEarning detail : details) {
	        TeacherEarning earning = detail.getTeacherEarning();

	        if (earning.getWithdrawableAmount() == null
	                || earning.getWithdrawableAmount().compareTo(BigDecimal.ZERO) == 0) {
	            earning.setStatus("WITHDRAWN");
	        }

	        teacherEarningRepository.save(earning);
	    }

	    withdrawal.setStatus("PAID");
	    withdrawal.setPaidAt(LocalDateTime.now());

	    withdrawal = withdrawalRepository.save(withdrawal);

	    return withdrawal;
	}

	private String buildSePayQrUrl(String paymentCode, BigDecimal amount, String bankAccount, String bankName) {
		String description = URLEncoder.encode(paymentCode, StandardCharsets.UTF_8);

		return "https://qr.sepay.vn/img" + "?acc=" + bankAccount + "&bank=" + bankName + "&amount=" + amount.longValue()
				+ "&des=" + description + "&template=compact";
	}

	private String buildPaymentCode(Long withdrawalId) {
		return "SEVQR" + withdrawalId;
	}

//	private void markEarningsWithdrawn(Long teacherId, BigDecimal amount) {
//		List<TeacherEarning> available = teacherEarningRepository
//				.findByTeacher_UserIdAndStatusOrderByCreatedAtAsc(teacherId, "AVAILABLE");
//
//		BigDecimal remaining = amount;
//		List<TeacherEarning> toUpdate = new ArrayList<>();
//
//		for (TeacherEarning earning : available) {
//
//			if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
//				break;
//			}
//
//			BigDecimal canUse = earning.getWithdrawableAmount();
//
//			if (canUse.compareTo(remaining) <= 0) {
//
//				earning.setWithdrawableAmount(BigDecimal.ZERO);
//				earning.setStatus("WITHDRAWN");
//
//				remaining = remaining.subtract(canUse);
//
//			} else {
//
//				earning.setWithdrawableAmount(canUse.subtract(remaining));
//
//				remaining = BigDecimal.ZERO;
//			}
//
//			toUpdate.add(earning);
//		}
//
//		if (remaining.compareTo(BigDecimal.ZERO) > 0) {
//			throw new RuntimeException("Số dư doanh thu khả dụng không đủ để hoàn tất rút tiền");
//		}
//
//		for (TeacherEarning earning : toUpdate) {
//			if(earning.getWithdrawableAmount().compareTo(BigDecimal.ZERO) == 0)
//				earning.setStatus("WITHDRAWN");
//		}
//		teacherEarningRepository.saveAll(toUpdate);
//	}

	private void notifyAdminsNewWithdrawal(User teacher, Withdrawal withdrawal, TeacherBankAccount bank) {
		try {
			String message = String.format("Giáo viên %s yêu cầu rút %s VND.\nSTK: %s | %s | %s",
					teacher.getFullName() != null ? teacher.getFullName() : teacher.getUsername(),
					withdrawal.getAmount().toPlainString(), bank.getBankName(), bank.getAccountNumber(),
					bank.getAccountName());

			List<User> admins = userRepository.findEligibleByRoleName("admin");
			if (admins.isEmpty()) {
				admins = userRepository.searchUsers(null, "admin", "active");
			}

			for (User admin : admins) {
				notificationService.notifyUser(admin, "Yêu cầu rút tiền mới", message, teacher);
			}
		} catch (Exception ex) {
			System.err.println("Không gửi được thông báo rút tiền cho admin: " + ex.getMessage());
		}
	}

	private void notifyTeacherWithdrawalReviewed(Withdrawal withdrawal) {
		try {
			User teacher = withdrawal.getTeacher();
			if (teacher == null) {
				return;
			}

			String title;
			String message;
			if ("PAID".equalsIgnoreCase(withdrawal.getStatus())) {
				title = "Rút tiền thành công";
				message = String.format("Yêu cầu rút %s VND đã được admin xác nhận thanh toán.",
						withdrawal.getAmount().toPlainString());
			} else {
				title = "Yêu cầu rút tiền bị từ chối";
				message = String.format("Yêu cầu rút %s VND đã bị từ chối. Lý do: %s",
						withdrawal.getAmount().toPlainString(), withdrawal.getRejectReason());
			}

			notificationService.notifyUser(teacher, title, message, withdrawal.getReviewedBy());
		} catch (Exception ex) {
			System.err.println("Không gửi được thông báo rút tiền cho giáo viên: " + ex.getMessage());
		}
	}

	WithdrawalResponse toWithdrawalResponse(Withdrawal w) {
		TeacherBankAccount bank = w.getBankAccount();
		return WithdrawalResponse.builder().withdrawalId(w.getWithdrawalId())
				.teacherId(w.getTeacher() != null ? w.getTeacher().getUserId() : null)
				.teacherName(w.getTeacher() != null ? w.getTeacher().getFullName() : null)
				.teacherEmail(w.getTeacher() != null ? w.getTeacher().getEmail() : null)
				.bankAccountId(bank != null ? bank.getBankAccountId() : null)
				.bankName(bank != null ? bank.getBankName() : null)
				.accountNumber(bank != null ? bank.getAccountNumber() : null)
				.accountHolder(bank != null ? bank.getAccountName() : null).amount(w.getAmount()).status(w.getStatus())
				.proofImageUrl(w.getProofImageUrl()).requestedAt(w.getRequestedAt()).reviewedAt(w.getReviewedAt())
				.reviewedBy(w.getReviewedBy() != null ? w.getReviewedBy().getUserId() : null)
				.rejectReason(w.getRejectReason()).paidAt(w.getPaidAt()).qrPay(w.getQrPay())
				.paymentCode(w.getPaymentcode()).build();
	}

	private User getCurrentUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()
				|| "anonymousUser".equals(authentication.getName())) {
			throw new RuntimeException("Người dùng chưa đăng nhập");
		}
		return userRepository.findByUsername(authentication.getName())
				.orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
	}
}
