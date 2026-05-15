package com.learning.english.service;

import com.learning.english.dto.response.*;
import com.learning.english.dto.response.TransactionAdminResponse;
import com.learning.english.dto.response.CourseReviewResponse;
import com.learning.english.entity.*;
import com.learning.english.mapper.CourseMapper;
import com.learning.english.mapper.LessonMapper;
import com.learning.english.dto.request.NotificationRequest;
import com.learning.english.dto.request.AdminCreateUserRequest;
import com.learning.english.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    CourseRepository courseRepository;

    @Autowired
    TeacherProfileRepository teacherProfileRepository;

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
    CourseReviewRepository courseReviewRepository;

    // ==================== DASHBOARD ====================

    public AdminDashboardResponse getDashboard() {
        long totalUsers = userRepository.count();
        long totalStudents = userRepository.countByRole_RoleName("student");
        long totalTeachers = userRepository.countByRole_RoleName("teacher");
        long totalCourses = courseRepository.count();
        long pendingTeachers = teacherProfileRepository.countByApprovalStatus("PENDING");
        long pendingCourses = courseRepository.countByStatus("PENDING");
        long pendingWithdrawals = withdrawalRepository.countByStatus("PENDING");
        BigDecimal totalRevenue = transactionRepository.sumSuccessAmount();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalStudents(totalStudents)
                .totalTeachers(totalTeachers)
                .totalCourses(totalCourses)
                .pendingTeachers(pendingTeachers)
                .pendingCourses(pendingCourses)
                .pendingWithdrawals(pendingWithdrawals)
                .totalRevenue(totalRevenue)
                .build();
    }

    // ==================== USER MANAGEMENT ====================

    public List<UserAdminResponse> getAllUsers(String keyword, String roleName, String status) {
        List<User> users;

        boolean noFilter = (keyword == null || keyword.isBlank())
                        && (roleName == null || roleName.isBlank())
                        && (status == null || status.isBlank());

        if (noFilter) {
            users = userRepository.findAllByOrderByCreatedAtDesc();
        } else {
            users = userRepository.searchUsers(
                    keyword == null || keyword.isBlank() ? null : keyword,
                    roleName == null || roleName.isBlank() ? null : roleName,
                    status == null || status.isBlank() ? null : status
            );
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

        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder =
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        String encodedPassword = encoder.encode(request.getPassword());

        String status = (request.getStatus() != null && !request.getStatus().isBlank())
                ? request.getStatus() : "active";

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(encodedPassword)
                .fullName(request.getFullName())
                .role(role)
                .status(status)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

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
        return UserAdminResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .roleName(user.getRole() != null ? user.getRole().getRoleName() : null)
                .roleId(user.getRole() != null ? user.getRole().getRoleId() : null)
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    // ==================== TEACHER APPROVAL ====================

    public List<TeacherProfileResponse> getPendingTeachers() {
        return teacherProfileRepository
                .findByApprovalStatusOrderByCreatedAtDesc("PENDING")
                .stream()
                .map(this::toTeacherProfileResponse)
                .collect(Collectors.toList());
    }

    public List<TeacherProfileResponse> getAllTeacherProfiles() {
        return teacherProfileRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toTeacherProfileResponse)
                .collect(Collectors.toList());
    }

    private TeacherProfileResponse toTeacherProfileResponse(TeacherProfile tp) {
        List<TeacherCertificateResponse> certificates = tp.getCertificates() == null ? List.of() :
                tp.getCertificates().stream()
                        .map(c -> TeacherCertificateResponse.builder()
                                .certificateId(c.getCertificateId())
                                .certificateUrl(c.getCertificateUrl())
                                .build())
                        .collect(Collectors.toList());

        return TeacherProfileResponse.builder()
                .teacherProfileId(tp.getTeacherProfileId())
                .userId(tp.getUser() != null ? tp.getUser().getUserId() : null)
                .fullName(tp.getUser() != null ? tp.getUser().getFullName() : null)
                .email(tp.getUser() != null ? tp.getUser().getEmail() : null)
                .bio(tp.getBio())
                .experience(tp.getExperience())
                .approvalStatus(tp.getApprovalStatus())
                .rejectReason(tp.getRejectReason())
                .reviewedAt(tp.getReviewedAt())
                .createdAt(tp.getCreatedAt())
                .updatedAt(tp.getUpdatedAt())
                .certificates(certificates)
                .build();
    }

    // ==================== COURSE APPROVAL ====================

    public List<CourseResponse> getPendingCourses() {
        return courseRepository
                .findByStatusOrderByCreatedAtDesc("PENDING")
                .stream()
                .map(courseMapper::toCourseResponse)
                .collect(Collectors.toList());
    }

    public List<CourseResponse> getAllCourses() {
        return courseRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(courseMapper::toCourseResponse)
                .collect(Collectors.toList());
    }

    // ==================== WITHDRAWAL MANAGEMENT ====================

    public List<WithdrawalResponse> getPendingWithdrawals() {
        return withdrawalRepository.findByStatusOrderByRequestedAtDesc("PENDING")
                .stream()
                .map(this::toWithdrawalResponse)
                .collect(Collectors.toList());
    }

    public List<WithdrawalResponse> getAllWithdrawals() {
        return withdrawalRepository.findAllByOrderByRequestedAtDesc()
                .stream()
                .map(this::toWithdrawalResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public WithdrawalResponse reviewWithdrawalByUsername(Long withdrawalId, String status, String rejectReason, String adminUsername) {
        Withdrawal withdrawal = withdrawalRepository.findById(withdrawalId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu rút tiền"));

        if (!"PENDING".equals(withdrawal.getStatus()))
            throw new RuntimeException("Yêu cầu này không ở trạng thái chờ duyệt");

        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy admin"));

        withdrawal.setStatus(status);
        withdrawal.setReviewedAt(LocalDateTime.now());
        withdrawal.setReviewedBy(admin);

        if ("REJECTED".equals(status)) {
            if (rejectReason == null || rejectReason.isBlank())
                throw new RuntimeException("Vui lòng nhập lý do từ chối");
            withdrawal.setRejectReason(rejectReason);
        } else if ("PAID".equals(status)) {
            withdrawal.setPaidAt(LocalDateTime.now());
        }

        withdrawal = withdrawalRepository.save(withdrawal);
        return toWithdrawalResponse(withdrawal);
    }

    // ==================== LESSON FREE MANAGEMENT ====================

    public List<LessonResponse> getFreeLessons() {
        return lessonRepository.findByLessonTypeOrderByCreatedAtDesc("Free")
                .stream()
                .map(lessonMapper::toLessonResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public LessonResponse createFreeLesson(String title, String description, String status) {
        if (title == null || title.isBlank())
            throw new RuntimeException("Tiêu đề bài học không được rỗng");

        Lesson lesson = Lesson.builder()
                .course(null)
                .title(title)
                .description(description)
                .lessonType("Free")
                .lessonOrder(1)
                .status(status != null ? status : "Published")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        lesson = lessonRepository.save(lesson);
        return lessonMapper.toLessonResponse(lesson);
    }

    @Transactional
    public LessonResponse updateFreeLesson(Long lessonId, String title, String description, String status) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học"));

        if (!"Free".equals(lesson.getLessonType()))
            throw new RuntimeException("Bài học này không phải lesson free");

        if (title != null && !title.isBlank()) lesson.setTitle(title);
        if (description != null) lesson.setDescription(description);
        if (status != null && !status.isBlank()) lesson.setStatus(status);
        lesson.setUpdatedAt(LocalDateTime.now());

        lesson = lessonRepository.save(lesson);
        return lessonMapper.toLessonResponse(lesson);
    }

    @Transactional
    public void deleteFreeLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học"));

        if (!"Free".equals(lesson.getLessonType()))
            throw new RuntimeException("Chỉ được xóa bài học miễn phí");

        lesson.setStatus("deleted");
        lesson.setUpdatedAt(LocalDateTime.now());
        lessonRepository.save(lesson);
    }

    // ==================== EXAM MANAGEMENT ====================

    public List<ExamAdminResponse> getAllExams() {
        return examRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toExamAdminResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExamAdminResponse updateExamStatus(Long examId, String status) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kỳ thi"));
        exam.setStatus(status);
        exam.setUpdatedAt(LocalDateTime.now());
        exam = examRepository.save(exam);
        return toExamAdminResponse(exam);
    }

    private ExamAdminResponse toExamAdminResponse(Exam exam) {
        return ExamAdminResponse.builder()
                .examId(exam.getExamId())
                .title(exam.getTitle())
                .description(exam.getDescription())
                .durationMinutes(exam.getDurationMinutes())
                .maxAttempts(exam.getMaxAttempts())
                .status(exam.getStatus())
                .courseId(exam.getCourse() != null ? exam.getCourse().getCourseId() : null)
                .courseTitle(exam.getCourse() != null ? exam.getCourse().getTitle() : null)
                .createdByUsername(exam.getCreatedBy() != null ? exam.getCreatedBy().getUsername() : null)
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .createdAt(exam.getCreatedAt())
                .updatedAt(exam.getUpdatedAt())
                .build();
    }

    // ==================== NOTIFICATION MANAGEMENT ====================

    @Transactional
    public NotificationResponse createNotification(NotificationRequest req, String adminUsername) {
        if (req.getTitle() == null || req.getTitle().isBlank())
            throw new RuntimeException("Tiêu đề thông báo không được rỗng");
        if (req.getMessage() == null || req.getMessage().isBlank())
            throw new RuntimeException("Nội dung thông báo không được rỗng");

        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy admin"));

        Notification notification = Notification.builder()
                .title(req.getTitle())
                .message(req.getMessage())
                .targetType(req.getTargetType() != null ? req.getTargetType() : "ALL")
                .targetValue(req.getTargetValue())
                .createdBy(admin)
                .createdAt(LocalDateTime.now())
                .build();

        notification = notificationRepository.save(notification);
        return toNotificationResponse(notification);
    }

    public List<NotificationResponse> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toNotificationResponse)
                .collect(Collectors.toList());
    }

    private NotificationResponse toNotificationResponse(Notification n) {
        return NotificationResponse.builder()
                .notificationId(n.getNotificationId())
                .title(n.getTitle())
                .message(n.getMessage())
                .targetType(n.getTargetType())
                .targetValue(n.getTargetValue())
                .createdByUsername(n.getCreatedBy() != null ? n.getCreatedBy().getUsername() : null)
                .createdAt(n.getCreatedAt())
                .build();
    }

    // ==================== TRANSACTION MANAGEMENT ====================

    public List<TransactionAdminResponse> getAllTransactions() {
        return transactionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toTransactionAdminResponse)
                .collect(Collectors.toList());
    }

    private TransactionAdminResponse toTransactionAdminResponse(Transaction t) {
        User user = t.getUser();
        return TransactionAdminResponse.builder()
                .transactionId(t.getTransactionId())
                .userId(user != null ? user.getUserId() : null)
                .username(user != null ? user.getUsername() : null)
                .email(user != null ? user.getEmail() : null)
                .targetType(t.getTargetType())
                .targetId(t.getTargetId())
                .targetName(resolveTargetName(t.getTargetType(), t.getTargetId()))
                .amount(t.getAmount())
                .status(t.getStatus())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }

    private String resolveTargetName(String targetType, Long targetId) {
        if (targetId == null) return null;

        if ("COURSE".equals(targetType)) {
            return courseRepository.findById(targetId)
                    .map(c -> c.getTitle())
                    .orElse("[Khóa học #" + targetId + "]");
        }

        if ("EXAM".equals(targetType)) {
            return examRepository.findById(targetId)
                    .map(e -> e.getTitle())
                    .orElse("[Kỳ thi #" + targetId + "]");
        }

        return "[Không xác định #" + targetId + "]";
    }

    // ==================== COURSE REVIEW MANAGEMENT ====================

    public List<CourseReviewResponse> getAllCourseReviews() {
        return courseReviewRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toCourseReviewResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteCourseReview(Long reviewId) {
        if (!courseReviewRepository.existsById(reviewId))
            throw new RuntimeException("Không tìm thấy đánh giá");
        courseReviewRepository.deleteById(reviewId);
    }

    private CourseReviewResponse toCourseReviewResponse(CourseReview r) {
        return CourseReviewResponse.builder()
                .reviewId(r.getReviewId())
                .courseId(r.getCourse() != null ? r.getCourse().getCourseId() : null)
                .userId(r.getUser() != null ? r.getUser().getUserId() : null)
                .fullName(r.getUser() != null ? r.getUser().getFullName() : null)
                .avatarUrl(r.getUser() != null ? r.getUser().getAvatarUrl() : null)
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    // ==================== CHANGE PASSWORD ====================

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

        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder =
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

        if (!encoder.matches(oldPassword, admin.getPassword()))
            throw new RuntimeException("Mật khẩu hiện tại không đúng");

        admin.setPassword(encoder.encode(newPassword));
        admin.setUpdatedAt(LocalDateTime.now());
        userRepository.save(admin);
    }

    // ==================== HELPER ====================

    private WithdrawalResponse toWithdrawalResponse(Withdrawal w) {
        TeacherBankAccount bank = w.getBankAccount();
        return WithdrawalResponse.builder()
                .withdrawalId(w.getWithdrawalId())
                .teacherId(w.getTeacher() != null ? w.getTeacher().getUserId() : null)
                .teacherName(w.getTeacher() != null ? w.getTeacher().getFullName() : null)
                .teacherEmail(w.getTeacher() != null ? w.getTeacher().getEmail() : null)
                .bankAccountId(bank != null ? bank.getBankAccountId() : null)
                .bankName(bank != null ? bank.getBankName() : null)
                .accountNumber(bank != null ? bank.getAccountNumber() : null)
                .accountHolder(bank != null ? bank.getAccountName() : null)
                .amount(w.getAmount())
                .status(w.getStatus())
                .proofImageUrl(w.getProofImageUrl())
                .requestedAt(w.getRequestedAt())
                .reviewedAt(w.getReviewedAt())
                .reviewedBy(w.getReviewedBy() != null ? w.getReviewedBy().getUserId() : null)
                .rejectReason(w.getRejectReason())
                .paidAt(w.getPaidAt())
                .build();
    }
}
