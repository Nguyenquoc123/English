package com.learning.english.service;

import com.learning.english.dto.request.StudentBankAccountRequest;
import com.learning.english.dto.response.StudentBankAccountResponse;
import com.learning.english.entity.StudentBankAccount;
import com.learning.english.entity.User;
import com.learning.english.repository.StudentBankAccountRepository;
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
public class StudentBankAccountService {

    private static final Pattern ACCOUNT_NUMBER_PATTERN = Pattern.compile("^[0-9]{6,30}$");

    @Autowired
    StudentBankAccountRepository studentBankAccountRepository;

    @Autowired
    UserRepository userRepository;

    public List<StudentBankAccountResponse> listMyAccounts() {
        User student = getCurrentUser();
        return studentBankAccountRepository
                .findByStudentUserIdOrderByIsDefaultDescCreatedAtDesc(student.getUserId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public StudentBankAccountResponse createAccount(StudentBankAccountRequest request) {
        User student = getCurrentUser();
        validateRequest(request);

        String accountNumber = request.getAccountNumber().trim();
        if (studentBankAccountRepository.existsByStudentUserIdAndAccountNumber(
                student.getUserId(),
                accountNumber
        )) {
            throw new RuntimeException("Số tài khoản này đã được thêm");
        }

        LocalDateTime now = LocalDateTime.now();
        boolean makeDefault = Boolean.TRUE.equals(request.getIsDefault())
                || studentBankAccountRepository.countByStudentUserId(student.getUserId()) == 0;

        if (makeDefault) {
            clearDefaultForStudent(student.getUserId());
        }

        StudentBankAccount account = StudentBankAccount.builder()
                .student(student)
                .bankName(request.getBankName().trim())
                .accountNumber(accountNumber)
                .accountName(request.getAccountName().trim())
                .isDefault(makeDefault)
                .createdAt(now)
                .updatedAt(now)
                .build();

        return toResponse(studentBankAccountRepository.save(account));
    }

    @Transactional
    public StudentBankAccountResponse updateAccount(Long accountId, StudentBankAccountRequest request) {
        User student = getCurrentUser();
        validateRequest(request);

        StudentBankAccount account = studentBankAccountRepository
                .findByStudentBankAccountIdAndStudentUserId(accountId, student.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản ngân hàng"));

        String accountNumber = request.getAccountNumber().trim();
        if (studentBankAccountRepository.existsByStudentUserIdAndAccountNumberAndStudentBankAccountIdNot(
                student.getUserId(),
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
            clearDefaultForStudent(student.getUserId());
            account.setIsDefault(true);
        } else if (Boolean.FALSE.equals(request.getIsDefault()) && Boolean.TRUE.equals(account.getIsDefault())) {
            throw new RuntimeException("Không thể bỏ mặc định — hãy chọn tài khoản khác làm mặc định");
        }

        return toResponse(studentBankAccountRepository.save(account));
    }

    @Transactional
    public void setDefaultAccount(Long accountId) {
        User student = getCurrentUser();
        StudentBankAccount account = studentBankAccountRepository
                .findByStudentBankAccountIdAndStudentUserId(accountId, student.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản ngân hàng"));

        clearDefaultForStudent(student.getUserId());
        account.setIsDefault(true);
        account.setUpdatedAt(LocalDateTime.now());
        studentBankAccountRepository.save(account);
    }

    @Transactional
    public void deleteAccount(Long accountId) {
        User student = getCurrentUser();
        StudentBankAccount account = studentBankAccountRepository
                .findByStudentBankAccountIdAndStudentUserId(accountId, student.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản ngân hàng"));

        boolean wasDefault = Boolean.TRUE.equals(account.getIsDefault());
        studentBankAccountRepository.delete(account);

        if (wasDefault) {
            List<StudentBankAccount> remaining = studentBankAccountRepository
                    .findByStudentUserIdOrderByIsDefaultDescCreatedAtDesc(student.getUserId());
            if (!remaining.isEmpty()) {
                StudentBankAccount first = remaining.get(0);
                first.setIsDefault(true);
                first.setUpdatedAt(LocalDateTime.now());
                studentBankAccountRepository.save(first);
            }
        }
    }

    public StudentBankAccount requireDefaultAccount(User student) {
        return studentBankAccountRepository
                .findByStudentUserIdAndIsDefaultTrue(student.getUserId())
                .orElseThrow(() -> new RuntimeException(
                        "Vui lòng thêm tài khoản ngân hàng mặc định trước khi yêu cầu hoàn tiền"
                ));
    }

    private void clearDefaultForStudent(Long studentId) {
        List<StudentBankAccount> accounts =
                studentBankAccountRepository.findByStudentUserIdOrderByIsDefaultDescCreatedAtDesc(studentId);
        LocalDateTime now = LocalDateTime.now();
        for (StudentBankAccount item : accounts) {
            if (Boolean.TRUE.equals(item.getIsDefault())) {
                item.setIsDefault(false);
                item.setUpdatedAt(now);
            }
        }
        studentBankAccountRepository.saveAll(accounts);
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

    private StudentBankAccountResponse toResponse(StudentBankAccount account) {
        return StudentBankAccountResponse.builder()
                .studentBankAccountId(account.getStudentBankAccountId())
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
