// Khai báo package — đây là lớp nằm trong tầng service của ứng dụng
package com.learning.english.service;

// Import các DTO response — các class dùng để trả dữ liệu về phía client (không lộ entity trực tiếp)
import com.learning.english.dto.response.*;
// Import DTO response mới cho tính năng quản lý giao dịch (ADM-10)
// TransactionAdminResponse được tạo thêm để chứa thông tin giao dịch kèm tên user
import com.learning.english.dto.response.TransactionAdminResponse;
// Import DTO response đánh giá khóa học (ADM-11) — đã có sẵn, dùng lại
import com.learning.english.dto.response.CourseReviewResponse;

// Import các Entity — ánh xạ trực tiếp đến bảng trong database
import com.learning.english.entity.*;

// Import CourseMapper — MapStruct mapper tự động convert Course entity sang CourseResponse DTO
import com.learning.english.mapper.CourseMapper;

// Import LessonMapper — MapStruct mapper convert Lesson entity sang LessonResponse DTO
import com.learning.english.mapper.LessonMapper;

// Import các DTO request bổ sung cho admin
import com.learning.english.dto.request.NotificationRequest;
import com.learning.english.dto.request.AdminCreateUserRequest;

// Import các Repository — interface JPA để thao tác với database (CRUD + custom query)
import com.learning.english.repository.*;

// Import @Autowired — annotation để Spring tự động inject dependency (bean) vào field
import org.springframework.beans.factory.annotation.Autowired;

// Import @Service — đánh dấu class này là Service layer, Spring sẽ quản lý lifecycle
import org.springframework.stereotype.Service;

// Import @Transactional — đảm bảo toàn bộ method chạy trong 1 transaction DB; nếu lỗi thì rollback
import org.springframework.transaction.annotation.Transactional;

// Import BigDecimal — kiểu số thập phân chính xác cao, dùng cho tính toán tiền tệ (tránh sai số float/double)
import java.math.BigDecimal;

// Import LocalDateTime — kiểu ngày giờ không có timezone của Java 8+ (ISO-8601)
import java.time.LocalDateTime;

// Import List — kiểu dữ liệu danh sách có thứ tự
import java.util.List;

// Import Collectors — lớp tiện ích để thu gom Stream thành Collection (toList, toMap, v.v.)
import java.util.stream.Collectors;

// @Service: Đánh dấu đây là lớp Service trong kiến trúc Spring MVC
// Spring Boot sẽ tự động tạo bean và quản lý vòng đời (singleton theo mặc định)
@Service
public class AdminService {

    // @Autowired: Spring tự động inject bean UserRepository vào đây (Dependency Injection)
    // UserRepository là interface JPA — cung cấp CRUD + các method tùy chỉnh trên bảng users
    @Autowired
    UserRepository userRepository;

    // @Autowired: Inject CourseRepository — thao tác với bảng courses
    @Autowired
    CourseRepository courseRepository;

    // @Autowired: Inject TeacherProfileRepository — thao tác với bảng teacher_profiles
    @Autowired
    TeacherProfileRepository teacherProfileRepository;

    // @Autowired: Inject WithdrawalRepository — thao tác với bảng withdrawals (yêu cầu rút tiền)
    @Autowired
    WithdrawalRepository withdrawalRepository;

    // @Autowired: Inject TransactionRepository — thao tác với bảng transactions (giao dịch)
    @Autowired
    TransactionRepository transactionRepository;

    // @Autowired: Inject RoleRepository — thao tác với bảng roles (vai trò người dùng)
    @Autowired
    RoleRepository roleRepository;

    // @Autowired: Inject CourseMapper — MapStruct tự sinh code convert Course → CourseResponse
    @Autowired
    CourseMapper courseMapper;

    // @Autowired: Inject LessonRepository — thao tác với bảng lessons (bài học free và course)
    @Autowired
    LessonRepository lessonRepository;

    // @Autowired: Inject LessonMapper — MapStruct convert Lesson entity sang LessonResponse DTO
    @Autowired
    LessonMapper lessonMapper;

    // @Autowired: Inject ExamRepository — thao tác với bảng exams (kỳ thi)
    @Autowired
    ExamRepository examRepository;

    // @Autowired: Inject NotificationRepository — thao tác với bảng notifications (thông báo)
    @Autowired
    NotificationRepository notificationRepository;

    // @Autowired: Inject CourseReviewRepository — thao tác với bảng course_reviews (đánh giá)
    // Dùng trong ADM-11: Quản lý bình luận và đánh giá
    @Autowired
    CourseReviewRepository courseReviewRepository;

    // ==================== DASHBOARD ====================

    /**
     * Lấy thống kê tổng quan cho trang Dashboard của Admin
     * Pattern: Query Aggregation — tổng hợp nhiều nguồn dữ liệu thành 1 response object
     * @return AdminDashboardResponse chứa các số liệu thống kê của hệ thống
     */
    public AdminDashboardResponse getDashboard() {
        // Đếm tổng số bản ghi trong bảng users (không phân biệt role)
        // userRepository.count() là method JPA tích hợp sẵn — tương đương SELECT COUNT(*) FROM users
        long totalUsers = userRepository.count();

        // Đếm số user có role là "student" (chú ý: DB lưu "student" viết thường)
        // countByRole_RoleName: Spring Data JPA tự sinh query dựa trên tên method (query derivation)
        // Role_RoleName = JOIN role ON role.roleId = user.roleId WHERE role.roleName = ?
        long totalStudents = userRepository.countByRole_RoleName("student");

        // Đếm số user có role là "teacher"
        long totalTeachers = userRepository.countByRole_RoleName("teacher");

        // Đếm tổng số khóa học (tất cả status)
        // courseRepository.count() = SELECT COUNT(*) FROM courses
        long totalCourses = courseRepository.count();

        // Đếm số hồ sơ giáo viên đang chờ duyệt (approvalStatus = "PENDING")
        // countByApprovalStatus: custom method trong TeacherProfileRepository
        long pendingTeachers = teacherProfileRepository.countByApprovalStatus("PENDING");

        // Đếm số khóa học đang chờ duyệt (status = "PENDING")
        // countByStatus: custom method trong CourseRepository
        long pendingCourses = courseRepository.countByStatus("PENDING");

        // Đếm số yêu cầu rút tiền đang chờ duyệt (status = "PENDING")
        // countByStatus: custom method trong WithdrawalRepository
        long pendingWithdrawals = withdrawalRepository.countByStatus("PENDING");

        // Tính tổng doanh thu từ tất cả giao dịch thành công
        // sumSuccessAmount(): @Query trong TransactionRepository — SUM(amount) WHERE status = 'SUCCESS'
        // Trả về null nếu không có giao dịch nào, cần xử lý null để tránh NullPointerException
        BigDecimal totalRevenue = transactionRepository.sumSuccessAmount();

        // Nếu không có giao dịch nào thì gán về 0 thay vì null (tránh lỗi khi serialize JSON)
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        // Builder pattern: tạo object AdminDashboardResponse với các field đã set
        // @Builder (Lombok) sinh sẵn static class Builder và method build()
        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)           // Tổng số người dùng
                .totalStudents(totalStudents)     // Tổng số học viên
                .totalTeachers(totalTeachers)     // Tổng số giáo viên
                .totalCourses(totalCourses)       // Tổng số khóa học
                .pendingTeachers(pendingTeachers) // Giáo viên chờ duyệt
                .pendingCourses(pendingCourses)   // Khóa học chờ duyệt
                .pendingWithdrawals(pendingWithdrawals) // Yêu cầu rút tiền chờ duyệt
                .totalRevenue(totalRevenue)       // Tổng doanh thu
                .build();                         // Kết thúc builder, tạo instance mới
    }

    // ==================== USER MANAGEMENT ====================

    /**
     * Lấy danh sách người dùng với tùy chọn tìm kiếm theo keyword và vai trò
     * Pattern: Conditional Query — dùng query khác nhau tùy theo có/không có filter
     * @param keyword  Từ khóa tìm kiếm (tên, email, username) — có thể null/rỗng
     * @param roleName Tên vai trò cần lọc (student/teacher/admin) — có thể null/rỗng
     * @return Danh sách UserAdminResponse đã được map từ entity
     */
    public List<UserAdminResponse> getAllUsers(String keyword, String roleName, String status) {
        // Khai báo biến users để chứa kết quả truy vấn
        List<User> users;

        // Kiểm tra nếu không có keyword, roleName, VÀ status → lấy toàn bộ user
        boolean noFilter = (keyword == null || keyword.isBlank())
                        && (roleName == null || roleName.isBlank())
                        && (status == null || status.isBlank());

        if (noFilter) {
            // Không có filter: lấy tất cả user, sắp xếp theo createdAt giảm dần
            users = userRepository.findAllByOrderByCreatedAtDesc();
        } else {
            // Có ít nhất 1 filter: dùng custom @Query để tìm kiếm
            users = userRepository.searchUsers(
                    keyword == null || keyword.isBlank() ? null : keyword,
                    roleName == null || roleName.isBlank() ? null : roleName,
                    status == null || status.isBlank() ? null : status
            );
        }

        return users.stream().map(this::toUserAdminResponse).collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết một người dùng theo ID
     * @param userId ID của người dùng cần xem
     * @return UserAdminResponse chứa thông tin chi tiết
     */
    public UserAdminResponse getUserDetail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return toUserAdminResponse(user);
    }

    /**
     * Admin tạo người dùng mới trong hệ thống
     * @Transactional: Đảm bảo toàn bộ thao tác trong 1 transaction
     * @param request AdminCreateUserRequest chứa username, email, password, fullName, roleName, status
     * @return UserAdminResponse chứa thông tin người dùng vừa tạo
     */
    @Transactional
    public UserAdminResponse createUser(AdminCreateUserRequest request) {
        // Validate: username không được rỗng và tối thiểu 3 ký tự
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new RuntimeException("Username không được rỗng");
        }
        if (request.getUsername().trim().length() < 3) {
            throw new RuntimeException("Username tối thiểu 3 ký tự");
        }

        // Validate: email không được rỗng
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new RuntimeException("Email không được rỗng");
        }

        // Validate: password không được rỗng và tối thiểu 6 ký tự
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new RuntimeException("Mật khẩu không được rỗng");
        }
        if (request.getPassword().length() < 6) {
            throw new RuntimeException("Mật khẩu tối thiểu 6 ký tự");
        }

        // Validate: roleName hợp lệ
        String roleName = request.getRoleName();
        if (roleName == null || roleName.isBlank()) {
            throw new RuntimeException("Vui lòng chọn vai trò");
        }

        // Check trùng username
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username đã tồn tại: " + request.getUsername());
        }

        // Check trùng email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại: " + request.getEmail());
        }

        // Tìm Role theo roleName
        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new RuntimeException("Vai trò không tồn tại: " + roleName));

        // Mã hóa mật khẩu bằng BCrypt
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder =
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        String encodedPassword = encoder.encode(request.getPassword());

        // Xác định status — mặc định "active" nếu không truyền
        String status = (request.getStatus() != null && !request.getStatus().isBlank())
                ? request.getStatus()
                : "active";

        // Build User entity
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

        // Lưu vào database
        User savedUser = userRepository.save(user);

        return toUserAdminResponse(savedUser);
    }

    /**
     * Cập nhật vai trò của người dùng
     * @Transactional: Đảm bảo findById + roleRepository.findByRoleName + save trong 1 transaction
     * @param userId   ID của user cần đổi role
     * @param roleName Tên role mới: "student" hoặc "teacher"
     * @return UserAdminResponse sau khi cập nhật
     */
    @Transactional
    public UserAdminResponse updateUserRole(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Không cho phép đổi role của Admin
        if ("admin".equalsIgnoreCase(user.getRole() != null ? user.getRole().getRoleName() : "")) {
            throw new RuntimeException("Không thể đổi role của Admin");
        }

        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new RuntimeException("Role không tồn tại: " + roleName));

        user.setRole(role);
        user.setUpdatedAt(LocalDateTime.now());
        user = userRepository.save(user);
        return toUserAdminResponse(user);
    }

    /**
     * Cập nhật trạng thái tài khoản của người dùng (khoá/mở khoá)
     * @Transactional: Đảm bảo findById + save chạy trong 1 transaction — nếu lỗi giữa chừng thì rollback
     * @param userId ID của user cần cập nhật
     * @param status  Trạng thái mới — "banned" (khoá) hoặc "active" (mở khoá)
     * @return UserAdminResponse chứa thông tin user sau khi cập nhật
     */
    @Transactional
    public UserAdminResponse updateUserStatus(Long userId, String status) {
        // Tìm user theo ID; nếu không tìm thấy thì ném RuntimeException (Spring sẽ trả HTTP 500)
        // orElseThrow: method của Optional<T> — ném exception nếu Optional rỗng
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Cập nhật trạng thái user theo giá trị mới (vd: "banned" hoặc "active")
        user.setStatus(status);

        // Cập nhật thời gian sửa đổi cuối cùng (audit field)
        // LocalDateTime.now() = thời điểm hiện tại không có timezone
        user.setUpdatedAt(LocalDateTime.now());

        // Lưu entity vào database — JPA sẽ thực hiện UPDATE SQL
        // Gán lại biến để lấy object đã được merge (Hibernate trả về managed entity)
        user = userRepository.save(user);

        // Convert entity sang DTO và trả về
        return toUserAdminResponse(user);
    }

    /**
     * Helper method: Convert User entity sang UserAdminResponse DTO
     * Private — chỉ dùng nội bộ trong AdminService
     * @param user Entity User từ database
     * @return UserAdminResponse DTO để trả về client
     */
    private UserAdminResponse toUserAdminResponse(User user) {
        // Builder pattern của Lombok — tạo UserAdminResponse với các field từ User entity
        return UserAdminResponse.builder()
                .userId(user.getUserId())            // ID người dùng
                .username(user.getUsername())        // Tên đăng nhập
                .email(user.getEmail())              // Email
                .fullName(user.getFullName())        // Họ tên đầy đủ
                .avatarUrl(user.getAvatarUrl())      // URL ảnh đại diện
                // Kiểm tra null trước khi lấy roleName — User có thể chưa gán role
                // Toán tử 3 ngôi: nếu role != null thì lấy roleName, ngược lại trả null
                .roleName(user.getRole() != null ? user.getRole().getRoleName() : null)
                .roleId(user.getRole() != null ? user.getRole().getRoleId() : null)
                .status(user.getStatus())            // Trạng thái: "pending"/"active"/"banned"
                .createdAt(user.getCreatedAt())      // Thời điểm tạo tài khoản
                .updatedAt(user.getUpdatedAt())      // Thời điểm cập nhật cuối
                .build();
    }

    // ==================== TEACHER APPROVAL ====================

    /**
     * Lấy danh sách hồ sơ giáo viên đang chờ duyệt (approvalStatus = "PENDING")
     * @return Danh sách TeacherProfileResponse đã map từ entity
     */
    public List<TeacherProfileResponse> getPendingTeachers() {
        // findByApprovalStatusOrderByCreatedAtDesc: lọc theo status + sắp xếp mới nhất lên đầu
        // Spring Data JPA tự sinh: SELECT * FROM teacher_profiles WHERE approval_status='PENDING' ORDER BY created_at DESC
        return teacherProfileRepository
                .findByApprovalStatusOrderByCreatedAtDesc("PENDING") // Chỉ lấy hồ sơ PENDING
                .stream()                                             // Bắt đầu Stream pipeline
                .map(this::toTeacherProfileResponse)                 // Convert từng TeacherProfile → DTO
                .collect(Collectors.toList());                       // Thu gom thành List
    }

    /**
     * Lấy toàn bộ hồ sơ giáo viên (tất cả trạng thái duyệt)
     * @return Danh sách TeacherProfileResponse đã map từ entity
     */
    public List<TeacherProfileResponse> getAllTeacherProfiles() {
        // findAllByOrderByCreatedAtDesc: lấy tất cả, sắp xếp theo createdAt giảm dần
        return teacherProfileRepository
                .findAllByOrderByCreatedAtDesc()    // Lấy tất cả hồ sơ giáo viên
                .stream()
                .map(this::toTeacherProfileResponse)
                .collect(Collectors.toList());
    }

    /**
     * Helper method: Convert TeacherProfile entity sang TeacherProfileResponse DTO
     * @param tp TeacherProfile entity từ database (có thể kèm certificates via @OneToMany)
     * @return TeacherProfileResponse DTO
     */
    private TeacherProfileResponse toTeacherProfileResponse(TeacherProfile tp) {
        // Convert danh sách chứng chỉ (TeacherCertificate → TeacherCertificateResponse)
        // Nếu certificates null (chưa fetch) → dùng List.of() (immutable empty list) để tránh NPE
        List<TeacherCertificateResponse> certificates = tp.getCertificates() == null ? List.of() :
                tp.getCertificates().stream()
                        .map(c -> TeacherCertificateResponse.builder()
                                .certificateId(c.getCertificateId())   // ID chứng chỉ
                                .certificateUrl(c.getCertificateUrl()) // URL file chứng chỉ (ảnh/pdf)
                                .build())
                        .collect(Collectors.toList());

        // Build TeacherProfileResponse từ TeacherProfile entity + User liên quan
        return TeacherProfileResponse.builder()
                .teacherProfileId(tp.getTeacherProfileId())                         // ID hồ sơ giáo viên
                // Lấy userId từ User liên kết (ManyToOne) — kiểm tra null để tránh NPE
                .userId(tp.getUser() != null ? tp.getUser().getUserId() : null)
                // Lấy tên đầy đủ từ User liên kết
                .fullName(tp.getUser() != null ? tp.getUser().getFullName() : null)
                // Lấy email từ User liên kết
                .email(tp.getUser() != null ? tp.getUser().getEmail() : null)
                .bio(tp.getBio())                   // Giới thiệu bản thân của giáo viên
                .experience(tp.getExperience())     // Kinh nghiệm giảng dạy
                .approvalStatus(tp.getApprovalStatus()) // Trạng thái duyệt: PENDING/APPROVED/REJECTED
                .rejectReason(tp.getRejectReason()) // Lý do từ chối (nếu có)
                .reviewedAt(tp.getReviewedAt())     // Thời điểm admin duyệt/từ chối
                .createdAt(tp.getCreatedAt())       // Thời điểm tạo hồ sơ
                .updatedAt(tp.getUpdatedAt())       // Thời điểm cập nhật cuối
                .certificates(certificates)         // Danh sách chứng chỉ đính kèm
                .build();
    }

    // ==================== COURSE APPROVAL ====================

    /**
     * Lấy danh sách khóa học đang chờ duyệt (status = "PENDING")
     * @return Danh sách CourseResponse đã map từ entity
     */
    public List<CourseResponse> getPendingCourses() {
        // findByStatusOrderByCreatedAtDesc: lọc theo status + sắp xếp mới nhất lên đầu
        return courseRepository
                .findByStatusOrderByCreatedAtDesc("PENDING") // Chỉ lấy khóa học status PENDING
                .stream()
                // courseMapper::toCourseResponse: MapStruct mapper tự động convert Course → CourseResponse
                // Dùng method reference thay vì lambda để code ngắn gọn hơn
                .map(courseMapper::toCourseResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy toàn bộ khóa học (tất cả trạng thái)
     * @return Danh sách CourseResponse đã map từ entity
     */
    public List<CourseResponse> getAllCourses() {
        // findAllByOrderByCreatedAtDesc: lấy tất cả khóa học, sắp xếp mới nhất lên đầu
        return courseRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(courseMapper::toCourseResponse)
                .collect(Collectors.toList());
    }

    // ==================== WITHDRAWAL MANAGEMENT ====================

    /**
     * Lấy danh sách yêu cầu rút tiền đang chờ duyệt (status = "PENDING")
     * @return Danh sách WithdrawalResponse đã map từ entity
     */
    public List<WithdrawalResponse> getPendingWithdrawals() {
        // findByStatusOrderByRequestedAtDesc: lọc PENDING + sắp xếp theo ngày yêu cầu giảm dần
        return withdrawalRepository.findByStatusOrderByRequestedAtDesc("PENDING")
                .stream()
                .map(this::toWithdrawalResponse) // Convert Withdrawal entity → WithdrawalResponse DTO
                .collect(Collectors.toList());
    }

    /**
     * Lấy toàn bộ yêu cầu rút tiền (tất cả trạng thái)
     * @return Danh sách WithdrawalResponse đã map từ entity
     */
    public List<WithdrawalResponse> getAllWithdrawals() {
        // findAllByOrderByRequestedAtDesc: lấy tất cả, sắp xếp theo ngày yêu cầu giảm dần
        return withdrawalRepository.findAllByOrderByRequestedAtDesc()
                .stream()
                .map(this::toWithdrawalResponse)
                .collect(Collectors.toList());
    }

    /**
     * Admin xét duyệt yêu cầu rút tiền: chấp nhận (PAID) hoặc từ chối (REJECTED)
     * @Transactional: Đảm bảo toàn bộ thao tác DB trong 1 transaction — rollback nếu có lỗi
     * @param withdrawalId  ID của yêu cầu rút tiền cần xét duyệt
     * @param status        Trạng thái mới: "PAID" (đã thanh toán) hoặc "REJECTED" (từ chối)
     * @param rejectReason  Lý do từ chối — bắt buộc khi status = "REJECTED"
     * @param adminUsername Tên đăng nhập của admin đang thực hiện (lấy từ JWT)
     * @return WithdrawalResponse chứa thông tin sau khi cập nhật
     */
    @Transactional
    public WithdrawalResponse reviewWithdrawalByUsername(Long withdrawalId, String status, String rejectReason, String adminUsername) {
        // Tìm yêu cầu rút tiền theo ID; ném lỗi nếu không tìm thấy
        Withdrawal withdrawal = withdrawalRepository.findById(withdrawalId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu rút tiền"));

        // Kiểm tra nghiệp vụ: chỉ cho phép duyệt yêu cầu đang ở trạng thái PENDING
        // Tránh trường hợp admin duyệt lại yêu cầu đã PAID hoặc đã REJECTED
        if (!"PENDING".equals(withdrawal.getStatus())) {
            throw new RuntimeException("Yêu cầu này không ở trạng thái chờ duyệt");
        }

        // Tìm admin user theo username (username được lấy từ JWT subject qua SecurityContext)
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy admin"));

        // Cập nhật trạng thái yêu cầu rút tiền theo quyết định của admin
        withdrawal.setStatus(status);

        // Ghi lại thời điểm admin xét duyệt (audit trail)
        withdrawal.setReviewedAt(LocalDateTime.now());

        // Ghi lại admin đã thực hiện xét duyệt (audit trail — foreign key đến bảng users)
        withdrawal.setReviewedBy(admin);

        // Xử lý theo trạng thái cụ thể
        if ("REJECTED".equals(status)) {
            // Khi từ chối: bắt buộc phải có lý do từ chối (validate nghiệp vụ)
            if (rejectReason == null || rejectReason.isBlank()) {
                throw new RuntimeException("Vui lòng nhập lý do từ chối");
            }
            // Lưu lý do từ chối vào bản ghi
            withdrawal.setRejectReason(rejectReason);
        } else if ("PAID".equals(status)) {
            // Khi đã thanh toán: ghi lại thời điểm thanh toán thực tế (audit)
            withdrawal.setPaidAt(LocalDateTime.now());
        }

        // Lưu bản ghi đã cập nhật vào database (JPA UPDATE SQL)
        withdrawal = withdrawalRepository.save(withdrawal);

        // Convert entity → DTO và trả về
        return toWithdrawalResponse(withdrawal);
    }

    // ==================== LESSON FREE MANAGEMENT ====================

    /**
     * Lấy danh sách bài học miễn phí (lessonType = "Free") để admin quản lý
     * @return Danh sách LessonResponse của tất cả lesson free, mới nhất lên đầu
     */
    public List<LessonResponse> getFreeLessons() {
        // findByLessonTypeOrderByCreatedAtDesc: lọc theo lessonType = "Free", sắp xếp mới nhất lên đầu
        // Admin-created free lessons có lessonType = "Free" và không thuộc khóa học cụ thể
        return lessonRepository.findByLessonTypeOrderByCreatedAtDesc("Free")
                .stream()
                // lessonMapper::toLessonResponse: MapStruct convert Lesson entity → LessonResponse DTO
                .map(lessonMapper::toLessonResponse)
                .collect(Collectors.toList());
    }

    /**
     * Admin tạo bài học miễn phí mới
     * @Transactional: Đảm bảo toàn bộ thao tác DB trong 1 transaction — rollback nếu lỗi
     * @param title       Tiêu đề bài học — bắt buộc nhập
     * @param description Mô tả bài học — có thể null
     * @param status      Trạng thái bài học: "Published" (hiển thị) hoặc "Hidden" (ẩn)
     * @return LessonResponse chứa thông tin bài học vừa tạo
     */
    @Transactional
    public LessonResponse createFreeLesson(String title, String description, String status) {
        // Validate dữ liệu đầu vào — tiêu đề không được rỗng
        if (title == null || title.isBlank()) {
            throw new RuntimeException("Tiêu đề bài học không được rỗng");
        }

        // Tạo Lesson entity mới với lessonType = "Free" và không gán courseId (lesson free)
        // Builder pattern (Lombok @Builder) — tạo object linh hoạt theo từng field
        Lesson lesson = Lesson.builder()
                .course(null)                    // Lesson free không thuộc khóa học nào
                .title(title)                    // Tiêu đề bài học
                .description(description)        // Mô tả bài học (có thể null)
                .lessonType("Free")              // Loại lesson: "Free" = bài học miễn phí
                .lessonOrder(1)                  // Thứ tự mặc định = 1 — DB có CHECK lessonOrder > 0; Free lesson không có thứ tự nên dùng 1
                .status(status != null ? status : "Published") // Trạng thái: mặc định Published
                .createdAt(LocalDateTime.now())  // Thời điểm tạo
                .updatedAt(LocalDateTime.now())  // Thời điểm cập nhật (bằng createdAt lúc mới tạo)
                .build();

        // Lưu entity vào database — JPA thực hiện INSERT SQL
        lesson = lessonRepository.save(lesson);

        // Convert entity → DTO và trả về cho controller
        return lessonMapper.toLessonResponse(lesson);
    }

    /**
     * Admin cập nhật thông tin bài học miễn phí
     * @Transactional: Đảm bảo findById + save trong 1 transaction
     * @param lessonId    ID của bài học cần cập nhật
     * @param title       Tiêu đề mới (null = giữ nguyên)
     * @param description Mô tả mới (null = giữ nguyên)
     * @param status      Trạng thái mới (null = giữ nguyên)
     * @return LessonResponse sau khi cập nhật
     */
    @Transactional
    public LessonResponse updateFreeLesson(Long lessonId, String title, String description, String status) {
        // Tìm bài học theo ID; ném lỗi nếu không tìm thấy
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học"));

        // Kiểm tra lesson này có phải lesson free không (chỉ được sửa lesson free)
        if (!"Free".equals(lesson.getLessonType())) {
            throw new RuntimeException("Bài học này không phải lesson free");
        }

        // Cập nhật các field nếu giá trị mới được cung cấp (không null/blank)
        if (title != null && !title.isBlank()) lesson.setTitle(title);
        if (description != null) lesson.setDescription(description);
        if (status != null && !status.isBlank()) lesson.setStatus(status);

        // Cập nhật thời gian sửa đổi cuối (audit field)
        lesson.setUpdatedAt(LocalDateTime.now());

        // Lưu thay đổi vào database
        lesson = lessonRepository.save(lesson);

        return lessonMapper.toLessonResponse(lesson);
    }

    /**
     * Admin xóa mềm bài học miễn phí (soft delete — đổi status thành "deleted")
     * @Transactional: Đảm bảo toàn bộ thao tác trong 1 transaction
     * @param lessonId ID của bài học cần xóa
     */
    @Transactional
    public void deleteFreeLesson(Long lessonId) {
        // Tìm bài học theo ID
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học"));

        // Kiểm tra chỉ xóa được lesson free (tránh admin vô tình xóa lesson của khóa học)
        if (!"Free".equals(lesson.getLessonType())) {
            throw new RuntimeException("Chỉ được xóa bài học miễn phí");
        }

        // Soft delete: đổi status sang "deleted" thay vì xóa vật lý khỏi DB
        // Lý do: bảo toàn dữ liệu lịch sử học tập của học viên liên quan đến lesson này
        lesson.setStatus("deleted");
        lesson.setUpdatedAt(LocalDateTime.now());
        lessonRepository.save(lesson);
    }

    // ==================== EXAM MANAGEMENT ====================

    /**
     * Lấy toàn bộ kỳ thi trong hệ thống để admin quản lý
     * @return Danh sách ExamAdminResponse của tất cả kỳ thi, mới nhất lên đầu
     */
    public List<ExamAdminResponse> getAllExams() {
        // findAllByOrderByCreatedAtDesc: lấy tất cả kỳ thi, sắp xếp mới nhất lên đầu
        return examRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                // toExamAdminResponse: helper method convert Exam entity → ExamAdminResponse DTO
                .map(this::toExamAdminResponse)
                .collect(Collectors.toList());
    }

    /**
     * Admin cập nhật trạng thái kỳ thi (duyệt/ẩn/đóng)
     * @Transactional: Đảm bảo toàn bộ thao tác trong 1 transaction
     * @param examId ID của kỳ thi cần cập nhật
     * @param status Trạng thái mới: "Open" (mở/duyệt), "Hidden" (ẩn), "Closed" (đóng)
     * @return ExamAdminResponse sau khi cập nhật
     */
    @Transactional
    public ExamAdminResponse updateExamStatus(Long examId, String status) {
        // Tìm kỳ thi theo ID; ném lỗi nếu không tìm thấy
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kỳ thi"));

        // Cập nhật trạng thái kỳ thi (ví dụ: "Draft" → "Open" khi admin duyệt)
        exam.setStatus(status);

        // Cập nhật thời gian sửa đổi cuối (audit field)
        exam.setUpdatedAt(LocalDateTime.now());

        // Lưu thay đổi vào database
        exam = examRepository.save(exam);

        return toExamAdminResponse(exam);
    }

    /**
     * Helper method: Convert Exam entity sang ExamAdminResponse DTO
     * @param exam Exam entity từ database
     * @return ExamAdminResponse DTO để trả về client
     */
    private ExamAdminResponse toExamAdminResponse(Exam exam) {
        // Build ExamAdminResponse từ Exam entity và các entity liên quan
        return ExamAdminResponse.builder()
                .examId(exam.getExamId())           // ID kỳ thi
                .title(exam.getTitle())             // Tên kỳ thi
                .description(exam.getDescription()) // Mô tả kỳ thi
                .durationMinutes(exam.getDurationMinutes()) // Thời lượng (phút)
                .maxAttempts(exam.getMaxAttempts()) // Số lần thi tối đa
                .status(exam.getStatus())           // Trạng thái: Draft/Open/Closed/Hidden
                // Lấy courseId từ Course liên kết (ManyToOne) — kiểm tra null
                .courseId(exam.getCourse() != null ? exam.getCourse().getCourseId() : null)
                // Lấy tên khóa học — null nếu không có course
                .courseTitle(exam.getCourse() != null ? exam.getCourse().getTitle() : null)
                // Lấy username của giáo viên tạo kỳ thi — kiểm tra null
                .createdByUsername(exam.getCreatedBy() != null ? exam.getCreatedBy().getUsername() : null)
                .startTime(exam.getStartTime())     // Thời gian bắt đầu (có thể null)
                .endTime(exam.getEndTime())         // Thời gian kết thúc (có thể null)
                .createdAt(exam.getCreatedAt())     // Thời điểm tạo
                .updatedAt(exam.getUpdatedAt())     // Thời điểm cập nhật cuối
                .build();
    }

    // ==================== NOTIFICATION MANAGEMENT ====================

    /**
     * Admin tạo và gửi thông báo đến người dùng trong hệ thống
     * @Transactional: Đảm bảo toàn bộ thao tác trong 1 transaction
     * @param req           NotificationRequest chứa title, message, targetType, targetValue
     * @param adminUsername Username của admin gửi thông báo (lấy từ JWT SecurityContext)
     * @return NotificationResponse chứa thông tin thông báo vừa tạo
     */
    @Transactional
    public NotificationResponse createNotification(NotificationRequest req, String adminUsername) {
        // Validate dữ liệu đầu vào
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw new RuntimeException("Tiêu đề thông báo không được rỗng");
        }
        if (req.getMessage() == null || req.getMessage().isBlank()) {
            throw new RuntimeException("Nội dung thông báo không được rỗng");
        }

        // Tìm admin user theo username để ghi audit (createdBy)
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy admin"));

        // Tạo Notification entity mới
        // targetType: "ALL" = toàn hệ thống, "ROLE" = theo vai trò, "USER" = người cụ thể
        Notification notification = Notification.builder()
                .title(req.getTitle())            // Tiêu đề thông báo
                .message(req.getMessage())        // Nội dung thông báo
                .targetType(req.getTargetType() != null ? req.getTargetType() : "ALL") // Kiểu đối tượng nhận
                .targetValue(req.getTargetValue()) // Giá trị đối tượng (roleName / userId / null)
                .createdBy(admin)                 // Admin tạo thông báo (ManyToOne → users)
                .createdAt(LocalDateTime.now())   // Thời điểm tạo
                .build();

        // Lưu thông báo vào database
        notification = notificationRepository.save(notification);

        // Convert entity → DTO và trả về
        return toNotificationResponse(notification);
    }

    /**
     * Lấy toàn bộ lịch sử thông báo đã gửi (để admin xem lại)
     * @return Danh sách NotificationResponse của tất cả thông báo, mới nhất lên đầu
     */
    public List<NotificationResponse> getAllNotifications() {
        // findAllByOrderByCreatedAtDesc: lấy tất cả thông báo, sắp xếp mới nhất lên đầu
        return notificationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toNotificationResponse) // Convert từng entity → DTO
                .collect(Collectors.toList());
    }

    /**
     * Helper method: Convert Notification entity sang NotificationResponse DTO
     * @param n Notification entity từ database
     * @return NotificationResponse DTO để trả về client
     */
    private NotificationResponse toNotificationResponse(Notification n) {
        return NotificationResponse.builder()
                .notificationId(n.getNotificationId())    // ID thông báo
                .title(n.getTitle())                      // Tiêu đề
                .message(n.getMessage())                  // Nội dung
                .targetType(n.getTargetType())            // Kiểu đối tượng nhận
                .targetValue(n.getTargetValue())          // Giá trị đối tượng
                // Username admin tạo thông báo — kiểm tra null tránh NPE
                .createdByUsername(n.getCreatedBy() != null ? n.getCreatedBy().getUsername() : null)
                .createdAt(n.getCreatedAt())              // Thời điểm tạo
                .build();
    }

    // ==================== TRANSACTION MANAGEMENT (ADM-10) ====================

    /**
     * Lấy toàn bộ giao dịch thanh toán trong hệ thống để admin theo dõi
     * ADM-10: Quản lý giao dịch và thanh toán
     * @return Danh sách TransactionAdminResponse, giao dịch mới nhất lên đầu
     */
    public List<TransactionAdminResponse> getAllTransactions() {
        // findAllByOrderByCreatedAtDesc: lấy tất cả giao dịch, sắp xếp mới nhất lên đầu
        return transactionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toTransactionAdminResponse) // Convert từng Transaction entity → DTO
                .collect(Collectors.toList());
    }

    /**
     * Helper method: Convert Transaction entity sang TransactionAdminResponse DTO
     * @param t Transaction entity từ database
     * @return TransactionAdminResponse DTO để trả về client
     */
    private TransactionAdminResponse toTransactionAdminResponse(Transaction t) {
        // Lấy thông tin user thực hiện giao dịch (ManyToOne — lazy load)
        User user = t.getUser();

        return TransactionAdminResponse.builder()
                .transactionId(t.getTransactionId())   // ID giao dịch
                // Lấy userId từ user liên kết — kiểm tra null
                .userId(user != null ? user.getUserId() : null)
                // Lấy username — hiển thị trong bảng admin thay vì userId số
                .username(user != null ? user.getUsername() : null)
                // Lấy email — dùng khi admin cần liên hệ người dùng
                .email(user != null ? user.getEmail() : null)
                .targetType(t.getTargetType())         // "COURSE" hoặc "EXAM"
                .targetId(t.getTargetId())             // ID của khóa học hoặc kỳ thi
                // targetName: tên dễ đọc thay cho targetId — lookup theo targetType
                // Nếu targetType = "COURSE" → tìm trong courseRepository
                // Nếu targetType = "EXAM"   → tìm trong examRepository
                .targetName(resolveTargetName(t.getTargetType(), t.getTargetId()))
                .amount(t.getAmount())                 // Số tiền giao dịch
                .status(t.getStatus())                 // "PENDING"/"SUCCESS"/"FAILED"
                .createdAt(t.getCreatedAt())           // Thời điểm tạo giao dịch
                .updatedAt(t.getUpdatedAt())           // Thời điểm cập nhật cuối
                .build();
    }

    /**
     * Helper method: Resolve tên đối tượng mua từ targetType và targetId
     * Dùng để hiển thị tên khóa học / kỳ thi thay vì ID số trong bảng giao dịch
     *
     * @param targetType "COURSE" hoặc "EXAM"
     * @param targetId   ID của đối tượng (courseId hoặc examId)
     * @return Tên đối tượng, hoặc "#targetId" nếu không tìm thấy
     */
    private String resolveTargetName(String targetType, Long targetId) {
        if (targetId == null) return null;

        // Nếu là giao dịch mua khóa học → tìm tên khóa học theo courseId
        if ("COURSE".equals(targetType)) {
            return courseRepository.findById(targetId)
                    .map(c -> c.getTitle()) // Lấy title của Course entity
                    .orElse("[Khóa học #" + targetId + "]"); // Fallback nếu không tìm thấy
        }

        // Nếu là giao dịch mua kỳ thi → tìm tên kỳ thi theo examId
        if ("EXAM".equals(targetType)) {
            return examRepository.findById(targetId)
                    .map(e -> e.getTitle()) // Lấy title của Exam entity
                    .orElse("[Kỳ thi #" + targetId + "]"); // Fallback nếu không tìm thấy
        }

        // Loại giao dịch chưa xác định
        return "[Không xác định #" + targetId + "]";
    }

    // ==================== COURSE REVIEW MANAGEMENT (ADM-11) ====================

    /**
     * Lấy toàn bộ đánh giá khóa học trong hệ thống để admin kiểm duyệt
     * ADM-11: Quản lý bình luận và đánh giá
     * @return Danh sách CourseReviewResponse đã map từ entity, mới nhất lên đầu
     */
    public List<CourseReviewResponse> getAllCourseReviews() {
        // findAllByOrderByCreatedAtDesc: lấy tất cả đánh giá, sắp xếp mới nhất lên đầu
        return courseReviewRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toCourseReviewResponse) // Convert từng CourseReview entity → DTO
                .collect(Collectors.toList());
    }

    /**
     * Admin xóa một đánh giá khóa học vi phạm chính sách
     * ADM-11: Quản lý bình luận và đánh giá
     * @Transactional: Đảm bảo xóa trong 1 transaction
     * @param reviewId ID của đánh giá cần xóa
     */
    @Transactional
    public void deleteCourseReview(Long reviewId) {
        // Kiểm tra tồn tại trước khi xóa — ném lỗi nếu không tìm thấy
        if (!courseReviewRepository.existsById(reviewId)) {
            throw new RuntimeException("Không tìm thấy đánh giá");
        }
        // Xóa vĩnh viễn khỏi database (hard delete)
        // Admin chỉ xóa khi nội dung vi phạm chính sách — không cần soft delete
        courseReviewRepository.deleteById(reviewId);
    }

    /**
     * Helper method: Convert CourseReview entity sang CourseReviewResponse DTO
     * @param r CourseReview entity từ database
     * @return CourseReviewResponse DTO để trả về client
     */
    private CourseReviewResponse toCourseReviewResponse(CourseReview r) {
        return CourseReviewResponse.builder()
                .reviewId(r.getReviewId())              // ID đánh giá
                // courseId từ Course liên kết — kiểm tra null
                .courseId(r.getCourse() != null ? r.getCourse().getCourseId() : null)
                // userId của học viên đã đánh giá
                .userId(r.getUser() != null ? r.getUser().getUserId() : null)
                // Tên đầy đủ học viên — hiển thị trong bảng admin
                .fullName(r.getUser() != null ? r.getUser().getFullName() : null)
                // Avatar URL học viên
                .avatarUrl(r.getUser() != null ? r.getUser().getAvatarUrl() : null)
                .rating(r.getRating())                  // Số sao (1-5)
                .comment(r.getComment())                // Nội dung đánh giá
                .createdAt(r.getCreatedAt())            // Thời điểm tạo
                .updatedAt(r.getUpdatedAt())            // Thời điểm cập nhật cuối
                .build();
    }

    // ==================== CHANGE PASSWORD (ADM-15) ====================

    /**
     * Admin đổi mật khẩu tài khoản quản trị
     * ADM-15: Đổi mật khẩu quản trị
     * @Transactional: Đảm bảo findByUsername + save trong 1 transaction
     * @param username        Username của admin (lấy từ JWT SecurityContext)
     * @param oldPassword     Mật khẩu cũ — dùng BCrypt.matches() để xác thực
     * @param newPassword     Mật khẩu mới — sẽ được BCrypt encode trước khi lưu
     * @param confirmPassword Xác nhận mật khẩu mới — phải khớp với newPassword
     */
    @Transactional
    public void changeAdminPassword(String username, String oldPassword, String newPassword, String confirmPassword) {
        // Validate: Các trường bắt buộc không được rỗng
        if (oldPassword == null || oldPassword.isBlank()) {
            throw new RuntimeException("Vui lòng nhập mật khẩu hiện tại");
        }
        if (newPassword == null || newPassword.isBlank()) {
            throw new RuntimeException("Vui lòng nhập mật khẩu mới");
        }

        // Validate: newPassword và confirmPassword phải khớp nhau
        if (!newPassword.equals(confirmPassword)) {
            throw new RuntimeException("Mật khẩu mới và xác nhận mật khẩu không khớp");
        }

        // Validate: Mật khẩu mới tối thiểu 6 ký tự
        if (newPassword.length() < 6) {
            throw new RuntimeException("Mật khẩu mới phải có ít nhất 6 ký tự");
        }

        // Tìm admin user theo username (subject từ JWT)
        User admin = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản admin"));

        // Xác thực mật khẩu cũ bằng BCrypt
        // BCryptPasswordEncoder.matches(rawPassword, encodedPassword):
        //   - rawPassword: mật khẩu plain text người dùng nhập
        //   - encodedPassword: hash đã lưu trong DB (dạng $2a$10$...)
        //   - Trả về true nếu khớp, false nếu sai
        // Tại sao không so sánh trực tiếp? BCrypt dùng salt ngẫu nhiên → cùng password → hash khác nhau
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder =
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

        if (!encoder.matches(oldPassword, admin.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }

        // Mã hóa mật khẩu mới bằng BCrypt trước khi lưu
        // KHÔNG BAO GIỜ lưu mật khẩu plain text vào database
        // BCrypt tự thêm salt ngẫu nhiên mỗi lần encode → cùng password → hash khác nhau
        String encodedNewPassword = encoder.encode(newPassword);

        // Cập nhật mật khẩu đã mã hóa vào entity
        admin.setPassword(encodedNewPassword);
        // Cập nhật thời gian sửa đổi cuối (audit field)
        admin.setUpdatedAt(LocalDateTime.now());

        // Lưu vào database — JPA thực hiện UPDATE SQL
        userRepository.save(admin);
        // Không cần return gì — void method thành công = đổi mật khẩu xong
    }

    /**
     * Helper method: Convert Withdrawal entity sang WithdrawalResponse DTO
     * @param w Withdrawal entity từ database (có thể kèm TeacherBankAccount qua @ManyToOne)
     * @return WithdrawalResponse DTO để trả về client
     */
    private WithdrawalResponse toWithdrawalResponse(Withdrawal w) {
        // Lấy thông tin tài khoản ngân hàng liên kết (có thể null nếu tài khoản đã bị xóa)
        TeacherBankAccount bank = w.getBankAccount();

        // Build WithdrawalResponse từ Withdrawal entity + các entity liên quan
        return WithdrawalResponse.builder()
                .withdrawalId(w.getWithdrawalId())  // ID yêu cầu rút tiền
                // Lấy ID giáo viên — kiểm tra null vì Teacher là ManyToOne (có thể null)
                .teacherId(w.getTeacher() != null ? w.getTeacher().getUserId() : null)
                // Lấy tên đầy đủ của giáo viên
                .teacherName(w.getTeacher() != null ? w.getTeacher().getFullName() : null)
                // Lấy email của giáo viên
                .teacherEmail(w.getTeacher() != null ? w.getTeacher().getEmail() : null)
                // Lấy ID tài khoản ngân hàng — null nếu bank account đã bị xóa
                .bankAccountId(bank != null ? bank.getBankAccountId() : null)
                // Tên ngân hàng (vd: "Vietcombank", "BIDV")
                .bankName(bank != null ? bank.getBankName() : null)
                // Số tài khoản ngân hàng
                .accountNumber(bank != null ? bank.getAccountNumber() : null)
                // Tên chủ tài khoản (accountName trong entity)
                .accountHolder(bank != null ? bank.getAccountName() : null)
                .amount(w.getAmount())              // Số tiền yêu cầu rút
                .status(w.getStatus())              // Trạng thái: PENDING/PAID/REJECTED
                .proofImageUrl(w.getProofImageUrl()) // URL ảnh bằng chứng thanh toán (nếu có)
                .requestedAt(w.getRequestedAt())    // Thời điểm giáo viên gửi yêu cầu
                .reviewedAt(w.getReviewedAt())      // Thời điểm admin xét duyệt
                // ID admin đã xét duyệt — null nếu chưa được duyệt
                .reviewedBy(w.getReviewedBy() != null ? w.getReviewedBy().getUserId() : null)
                .rejectReason(w.getRejectReason())  // Lý do từ chối (nếu REJECTED)
                .paidAt(w.getPaidAt())              // Thời điểm thanh toán thực tế (nếu PAID)
                .build();
    }
}
