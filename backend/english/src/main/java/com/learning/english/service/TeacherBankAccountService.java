package com.learning.english.service;

import com.learning.english.dto.request.StudentBankAccountRequest;
import com.learning.english.dto.response.TeacherBankAccountResponse;
import com.learning.english.entity.TeacherBankAccount;
import com.learning.english.entity.User;
import com.learning.english.repository.TeacherBankAccountRepository;
import com.learning.english.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class TeacherBankAccountService {

    private static final Pattern ACCOUNT_NUMBER_PATTERN = Pattern.compile("^[0-9]{6,30}$");

    @Autowired
    TeacherBankAccountRepository teacherBankAccountRepository;

    @Autowired
    UserRepository userRepository;

    public List<TeacherBankAccountResponse> listMyAccounts() {
        User teacher = getCurrentUser();
        return teacherBankAccountRepository
                .findByTeacherUserIdOrderByIsDefaultDescCreatedAtDesc(teacher.getUserId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TeacherBankAccountResponse createAccount(StudentBankAccountRequest request) {
        User teacher = getCurrentUser();
        validateRequest(request);

        String accountNumber = request.getAccountNumber().trim();
        if (teacherBankAccountRepository.existsByTeacherUserIdAndAccountNumber(
                teacher.getUserId(),
                accountNumber
        )) {
            throw new RuntimeException("Số tài khoản này đã được thêm");
        }

        LocalDateTime now = LocalDateTime.now();
        boolean makeDefault = Boolean.TRUE.equals(request.getIsDefault())
                || teacherBankAccountRepository.countByTeacherUserId(teacher.getUserId()) == 0;

        if (makeDefault) {
            clearDefaultForTeacher(teacher.getUserId());
        }

        TeacherBankAccount account = TeacherBankAccount.builder()
                .teacher(teacher)
                .bankName(request.getBankName().trim())
                .accountNumber(accountNumber)
                .accountName(request.getAccountName().trim())
                .isDefault(makeDefault)
                .createdAt(now)
                .updatedAt(now)
                .build();

        return toResponse(teacherBankAccountRepository.save(account));
    }

    @Transactional
    public TeacherBankAccountResponse updateAccount(Long accountId, StudentBankAccountRequest request) {
        User teacher = getCurrentUser();
        validateRequest(request);

        TeacherBankAccount account = teacherBankAccountRepository
                .findByBankAccountIdAndTeacherUserId(accountId, teacher.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản ngân hàng"));

        String accountNumber = request.getAccountNumber().trim();
        if (teacherBankAccountRepository.existsByTeacherUserIdAndAccountNumberAndBankAccountIdNot(
                teacher.getUserId(),
                accountNumber,
                accountId
        )) {
            throw new RuntimeException("Số tài khoản này đã được thêm");
        }

        account.setBankName(request.getBankName().trim());
        account.setAccountNumber(accountNumber);
        account.setAccountName(request.getAccountName().trim());
        account.setUpdatedAt(LocalDateTime.now());

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultForTeacher(teacher.getUserId());
            account.setIsDefault(true);
        } else if (Boolean.FALSE.equals(request.getIsDefault()) && Boolean.TRUE.equals(account.getIsDefault())) {
            throw new RuntimeException("Không thể bỏ mặc định — hãy chọn tài khoản khác làm mặc định");
        }

        return toResponse(teacherBankAccountRepository.save(account));
    }

    @Transactional
    public void setDefaultAccount(Long accountId) {
        User teacher = getCurrentUser();
        TeacherBankAccount account = teacherBankAccountRepository
                .findByBankAccountIdAndTeacherUserId(accountId, teacher.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản ngân hàng"));

        clearDefaultForTeacher(teacher.getUserId());
        account.setIsDefault(true);
        account.setUpdatedAt(LocalDateTime.now());
        teacherBankAccountRepository.save(account);
    }

    @Transactional
    public void deleteAccount(Long accountId) {
        User teacher = getCurrentUser();
        TeacherBankAccount account = teacherBankAccountRepository
                .findByBankAccountIdAndTeacherUserId(accountId, teacher.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản ngân hàng"));

        boolean wasDefault = Boolean.TRUE.equals(account.getIsDefault());
        teacherBankAccountRepository.delete(account);

        if (wasDefault) {
            List<TeacherBankAccount> remaining = teacherBankAccountRepository
                    .findByTeacherUserIdOrderByIsDefaultDescCreatedAtDesc(teacher.getUserId());
            if (!remaining.isEmpty()) {
                TeacherBankAccount first = remaining.get(0);
                first.setIsDefault(true);
                first.setUpdatedAt(LocalDateTime.now());
                teacherBankAccountRepository.save(first);
            }
        }
    }

    public TeacherBankAccount requireOwnedAccount(User teacher, Long bankAccountId) {
        if (bankAccountId != null) {
            return teacherBankAccountRepository
                    .findByBankAccountIdAndTeacherUserId(bankAccountId, teacher.getUserId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản ngân hàng"));
        }

        return teacherBankAccountRepository
                .findByTeacherUserIdAndIsDefaultTrue(teacher.getUserId())
                .orElseThrow(() -> new RuntimeException(
                        "Vui lòng thêm tài khoản ngân hàng mặc định trước khi rút tiền"
                ));
    }

    private void clearDefaultForTeacher(Long teacherId) {
        List<TeacherBankAccount> accounts =
                teacherBankAccountRepository.findByTeacherUserIdOrderByIsDefaultDescCreatedAtDesc(teacherId);
        LocalDateTime now = LocalDateTime.now();
        for (TeacherBankAccount item : accounts) {
            if (Boolean.TRUE.equals(item.getIsDefault())) {
                item.setIsDefault(false);
                item.setUpdatedAt(now);
            }
        }
        teacherBankAccountRepository.saveAll(accounts);
    }

    private void validateRequest(StudentBankAccountRequest request) {
        if (request == null) {
            throw new RuntimeException("Dữ liệu không hợp lệ");
        }
        if (request.getBankName() == null || request.getBankName().isBlank()) {
            throw new RuntimeException("Vui lòng nhập tên ngân hàng");
        }
        if (request.getAccountNumber() == null || request.getAccountNumber().isBlank()) {
            throw new RuntimeException("Vui lòng nhập số tài khoản");
        }
        if (!ACCOUNT_NUMBER_PATTERN.matcher(request.getAccountNumber().trim()).matches()) {
            throw new RuntimeException("Số tài khoản chỉ gồm số và từ 6 đến 30 ký tự");
        }
        if (request.getAccountName() == null || request.getAccountName().isBlank()) {
            throw new RuntimeException("Vui lòng nhập tên chủ tài khoản");
        }
    }

    private TeacherBankAccountResponse toResponse(TeacherBankAccount account) {
        return TeacherBankAccountResponse.builder()
                .bankAccountId(account.getBankAccountId())
                .bankName(account.getBankName())
                .accountNumber(account.getAccountNumber())
                .accountName(account.getAccountName())
                .isDefault(account.getIsDefault())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new RuntimeException("Người dùng chưa đăng nhập");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }
}
