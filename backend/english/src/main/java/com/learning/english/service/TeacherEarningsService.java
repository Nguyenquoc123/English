package com.learning.english.service;



import com.learning.english.dto.response.TeacherEarningsResponse;
import com.learning.english.dto.response.TeacherWithdrawalResponse;
import com.learning.english.entity.TeacherBankAccount;
import com.learning.english.entity.TeacherEarning;
import com.learning.english.entity.User;
import com.learning.english.entity.Withdrawal;
import com.learning.english.repository.TeacherEarningRepository;
import com.learning.english.repository.UserRepository;
import com.learning.english.repository.WithdrawalRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherEarningsService {

    private final TeacherEarningRepository teacherEarningRepository;
    private final WithdrawalRepository withdrawalRepository;
    private final UserRepository userRepository;

    
    public TeacherEarningsResponse getTeacherEarnings() {
        Long teacherId = getCurrentUserId();

        BigDecimal totalAmount = nullToZero(
                teacherEarningRepository.sumTotalAmountByTeacherId(teacherId)
        );

        

        BigDecimal pendingAmount = nullToZero(
                withdrawalRepository.sumPendingAmountByTeacherId(teacherId)
        );

        BigDecimal availableAmount = nullToZero(
                teacherEarningRepository.sumAvailableAmountByTeacherId(teacherId)
        );

        if (availableAmount.compareTo(BigDecimal.ZERO) < 0) {
            availableAmount = BigDecimal.ZERO;
        }

        List<TeacherWithdrawalResponse> withdrawals = withdrawalRepository
                .findHistoryByTeacherId(teacherId)
                .stream()
                .map(this::toWithdrawalResponse)
                .toList();

        return TeacherEarningsResponse.builder()
                .availableAmount(availableAmount)
                .pendingAmount(pendingAmount)
                .totalAmount(totalAmount)
                .withdrawals(withdrawals)
                .build();
    }

    private TeacherWithdrawalResponse toWithdrawalResponse(Withdrawal withdrawal) {
        TeacherBankAccount bankAccount = withdrawal.getBankAccount();

        return TeacherWithdrawalResponse.builder()
                .withdrawalId(withdrawal.getWithdrawalId())
                .amount(withdrawal.getAmount())
                .totalAmount(withdrawal.getAmount())
                .bankName(bankAccount != null ? bankAccount.getBankName() : null)
                .accountNumber(bankAccount != null ? bankAccount.getAccountNumber() : null)
                .bankAccountNumber(bankAccount != null ? bankAccount.getAccountNumber() : null)
                .accountName(bankAccount != null ? bankAccount.getAccountName() : null)
                .bankAccountName(bankAccount != null ? bankAccount.getAccountName() : null)
                .status(withdrawal.getStatus())
                .requestedAt(withdrawal.getRequestedAt())
                .createdAt(withdrawal.getRequestedAt())
                .reviewedAt(withdrawal.getReviewedAt())
                .processedAt(withdrawal.getPaidAt())
                .rejectReason(withdrawal.getRejectReason())
                .note(withdrawal.getRejectReason())
                .build();
    }
    
    @Transactional
    public void capNhatTeacherEarningDenHan() {
        LocalDateTime now = LocalDateTime.now();

        List<TeacherEarning> earnings =
                teacherEarningRepository.findPendingEarningsCanRelease(now);

        for (TeacherEarning earning : earnings) {
            earning.setStatus("AVAILABLE");
        }

        teacherEarningRepository.saveAll(earnings);
    }
    

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Bạn chưa đăng nhập");
        }

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        return user.getUserId();
    }

    private BigDecimal nullToZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}