// Khai báo package — đây là lớp nằm trong tầng controller (tầng API) của ứng dụng
package com.learning.english.controller;

// Import DTO request — dữ liệu nhận từ client khi admin gửi lên
import com.learning.english.dto.request.UserStatusRequest;
import com.learning.english.dto.request.UserRoleRequest;
import com.learning.english.dto.request.WithdrawalReviewRequest;
import com.learning.english.dto.request.NotificationRequest;
// Import DTO request đổi mật khẩu admin — dùng cho endpoint PUT /admin/change-password (ADM-15)
import com.learning.english.dto.request.AdminChangePasswordRequest;
// Import DTO request tạo người dùng mới — dùng cho endpoint POST /admin/users
import com.learning.english.dto.request.AdminCreateUserRequest;

// Import DTO response — dữ liệu trả về cho client
import com.learning.english.dto.response.*;
// Import DTO TransactionAdminResponse — dùng cho endpoint GET /admin/transactions
import com.learning.english.dto.response.TransactionAdminResponse;
// Import DTO CourseReviewResponse — dùng cho endpoint GET /admin/reviews
import com.learning.english.dto.response.CourseReviewResponse;

// Import AdminService — tầng service chứa logic nghiệp vụ
import com.learning.english.service.AdminService;

// Import @Autowired — annotation để Spring tự động inject dependency
import org.springframework.beans.factory.annotation.Autowired;

// Import ResponseEntity — wrapper HTTP response cho phép tuỳ chỉnh status code, header, body
import org.springframework.http.ResponseEntity;

// Import Authentication — interface Spring Security, đại diện cho thông tin người đang đăng nhập
import org.springframework.security.core.Authentication;

// Import SecurityContextHolder — lớp lưu trữ SecurityContext (thông tin bảo mật) cho request hiện tại
// Pattern: ThreadLocal — mỗi thread request có SecurityContext riêng
import org.springframework.security.core.context.SecurityContextHolder;

// Import các annotation REST — @RestController, @RequestMapping, @GetMapping, v.v.
import org.springframework.web.bind.annotation.*;

// Import List — kiểu dữ liệu danh sách
import java.util.List;

// @RestController: Kết hợp @Controller + @ResponseBody
// Mọi method đều tự động serialize kết quả thành JSON và ghi vào HTTP response body
@RestController

// @RequestMapping("/admin"): Tất cả endpoint trong controller này đều có prefix "/admin"
// Ví dụ: getDashboard() → GET /admin/dashboard
@RequestMapping("/admin")
public class AdminController {

    // @Autowired: Spring inject AdminService bean vào đây (Dependency Injection)
    // AdminService chứa toàn bộ logic nghiệp vụ của admin
    @Autowired
    AdminService adminService;

    // ==================== DASHBOARD ====================

    /**
     * GET /admin/dashboard — Lấy số liệu thống kê tổng quan cho trang Dashboard
     * Yêu cầu: JWT token có scope "admin" (kiểm tra bởi SecurityConfig)
     * @return ResponseEntity chứa AdminDashboardResponse với HTTP 200 OK
     */
    // @GetMapping("/dashboard"): Ánh xạ HTTP GET request đến /admin/dashboard vào method này
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        // Gọi service để lấy dữ liệu dashboard, bọc trong ResponseEntity.ok() = HTTP 200 OK
        return ResponseEntity.ok(adminService.getDashboard());
    }

    // ==================== USER MANAGEMENT ====================

    /**
     * GET /admin/users?keyword=...&roleName=... — Lấy danh sách người dùng có hỗ trợ tìm kiếm
     * Yêu cầu: JWT token có scope "admin"
     * @param keyword  Query param tùy chọn — tìm theo tên/email/username
     * @param roleName Query param tùy chọn — lọc theo vai trò
     * @return ResponseEntity chứa List<UserAdminResponse>
     */
    // @GetMapping("/users"): Ánh xạ GET /admin/users
    @GetMapping("/users")
    public ResponseEntity<List<UserAdminResponse>> getAllUsers(
            // @RequestParam(required = false): query param không bắt buộc — nếu không truyền thì null
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String roleName,
            @RequestParam(required = false) String status) {
        // Truyền keyword, roleName và status vào service
        return ResponseEntity.ok(adminService.getAllUsers(keyword, roleName, status));
    }

    /**
     * POST /admin/users — Admin tạo người dùng mới
     * Yêu cầu: JWT token có scope "admin"
     * @param request AdminCreateUserRequest chứa username, email, password, fullName, roleName, status
     * @return ResponseEntity chứa UserAdminResponse của người dùng vừa tạo
     */
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody AdminCreateUserRequest request) {
        return ResponseEntity.ok(adminService.createUser(request));
    }

    /**
     * GET /admin/users/{userId} — Lấy chi tiết một người dùng
     * Yêu cầu: JWT token có scope "admin"
     * @param userId Path variable — ID của user cần xem chi tiết
     * @return ResponseEntity chứa UserAdminResponse
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserDetail(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getUserDetail(userId));
    }

    /**
     * PUT /admin/users/{userId}/role — Đổi vai trò của người dùng
     * Yêu cầu: JWT token có scope "admin"
     * @param userId  Path variable — ID của user cần đổi role
     * @param request Request body chứa trường "roleName" (vd: "student"/"teacher")
     * @return ResponseEntity chứa UserAdminResponse sau khi cập nhật
     */
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long userId,
            @RequestBody UserRoleRequest request) {
        return ResponseEntity.ok(adminService.updateUserRole(userId, request.getRoleName()));
    }

    /**
     * PUT /admin/users/{userId}/status — Cập nhật trạng thái tài khoản (khoá/mở khoá)
     * Yêu cầu: JWT token có scope "admin"
     * @param userId  Path variable — ID của user cần cập nhật
     * @param request Request body chứa trường "status" (vd: "banned"/"active")
     * @return ResponseEntity chứa UserAdminResponse sau khi cập nhật
     */
    // @PutMapping("/users/{userId}/status"): Ánh xạ PUT /admin/users/{userId}/status
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<UserAdminResponse> updateUserStatus(
            // @PathVariable: lấy {userId} từ URL path và bind vào param Long userId
            @PathVariable Long userId,
            // @RequestBody: deserialize JSON body của request thành UserStatusRequest object
            @RequestBody UserStatusRequest request) {
        // Gọi service với userId và trạng thái mới từ request body
        return ResponseEntity.ok(adminService.updateUserStatus(userId, request.getStatus()));
    }

    // ==================== TEACHER APPROVAL ====================

    /**
     * GET /admin/teachers/pending — Lấy danh sách hồ sơ giáo viên đang chờ duyệt
     * Yêu cầu: JWT token có scope "admin"
     * @return ResponseEntity chứa List<TeacherProfileResponse> (chỉ các hồ sơ PENDING)
     */
    // @GetMapping("/teachers/pending"): Ánh xạ GET /admin/teachers/pending
    @GetMapping("/teachers/pending")
    public ResponseEntity<List<TeacherProfileResponse>> getPendingTeachers() {
        // Lấy danh sách hồ sơ giáo viên chờ duyệt từ service
        return ResponseEntity.ok(adminService.getPendingTeachers());
    }

    /**
     * GET /admin/teachers — Lấy toàn bộ hồ sơ giáo viên (tất cả trạng thái duyệt)
     * Yêu cầu: JWT token có scope "admin"
     * @return ResponseEntity chứa List<TeacherProfileResponse>
     */
    // @GetMapping("/teachers"): Ánh xạ GET /admin/teachers
    @GetMapping("/teachers")
    public ResponseEntity<List<TeacherProfileResponse>> getAllTeacherProfiles() {
        // Lấy tất cả hồ sơ giáo viên từ service
        return ResponseEntity.ok(adminService.getAllTeacherProfiles());
    }

    // ==================== COURSE APPROVAL ====================

    /**
     * GET /admin/courses/pending — Lấy danh sách khóa học đang chờ duyệt
     * Yêu cầu: JWT token có scope "admin"
     * @return ResponseEntity chứa List<CourseResponse> (chỉ các khóa học status PENDING)
     */
    // @GetMapping("/courses/pending"): Ánh xạ GET /admin/courses/pending
    @GetMapping("/courses/pending")
    public ResponseEntity<List<CourseResponse>> getPendingCourses() {
        // Lấy danh sách khóa học chờ duyệt từ service
        return ResponseEntity.ok(adminService.getPendingCourses());
    }

    /**
     * GET /admin/courses — Lấy toàn bộ khóa học (tất cả trạng thái)
     * Yêu cầu: JWT token có scope "admin"
     * @return ResponseEntity chứa List<CourseResponse>
     */
    // @GetMapping("/courses"): Ánh xạ GET /admin/courses
    @GetMapping("/courses")
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        // Lấy tất cả khóa học từ service
        return ResponseEntity.ok(adminService.getAllCourses());
    }

    // ==================== WITHDRAWAL MANAGEMENT ====================

    /**
     * GET /admin/withdrawals/pending — Lấy danh sách yêu cầu rút tiền đang chờ duyệt
     * Yêu cầu: JWT token có scope "admin"
     * @return ResponseEntity chứa List<WithdrawalResponse> (chỉ các yêu cầu PENDING)
     */
    // @GetMapping("/withdrawals/pending"): Ánh xạ GET /admin/withdrawals/pending
    @GetMapping("/withdrawals/pending")
    public ResponseEntity<List<WithdrawalResponse>> getPendingWithdrawals() {
        // Lấy danh sách yêu cầu rút tiền chờ duyệt từ service
        return ResponseEntity.ok(adminService.getPendingWithdrawals());
    }

    /**
     * GET /admin/withdrawals — Lấy toàn bộ yêu cầu rút tiền (tất cả trạng thái)
     * Yêu cầu: JWT token có scope "admin"
     * @return ResponseEntity chứa List<WithdrawalResponse>
     */
    // @GetMapping("/withdrawals"): Ánh xạ GET /admin/withdrawals
    @GetMapping("/withdrawals")
    public ResponseEntity<List<WithdrawalResponse>> getAllWithdrawals() {
        // Lấy tất cả yêu cầu rút tiền từ service
        return ResponseEntity.ok(adminService.getAllWithdrawals());
    }

    /**
     * PUT /admin/withdrawals/{withdrawalId}/review — Admin xét duyệt yêu cầu rút tiền
     * Yêu cầu: JWT token có scope "admin"
     * @param withdrawalId Path variable — ID của yêu cầu rút tiền cần xét duyệt
     * @param request      Request body chứa status ("PAID"/"REJECTED") và rejectReason
     * @return ResponseEntity chứa WithdrawalResponse sau khi cập nhật
     */
    // @PutMapping("/withdrawals/{withdrawalId}/review"): Ánh xạ PUT /admin/withdrawals/{id}/review
    @PutMapping("/withdrawals/{withdrawalId}/review")
    public ResponseEntity<WithdrawalResponse> reviewWithdrawal(
            // @PathVariable: lấy {withdrawalId} từ URL path
            @PathVariable Long withdrawalId,
            // @RequestBody: deserialize JSON body thành WithdrawalReviewRequest
            @RequestBody WithdrawalReviewRequest request) {

        // Lấy SecurityContext của request hiện tại — chứa thông tin JWT đã decode
        // SecurityContextHolder: ThreadLocal lưu context bảo mật theo từng request thread
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // auth.getName(): trả về "subject" của JWT token — Spring Security set subject = username
        // Username được dùng để lookup admin user trong database
        String username = auth.getName();

        // Gọi service với withdrawalId, status, rejectReason và username của admin
        // Service sẽ tìm admin user theo username để ghi audit log (reviewedBy)
        return ResponseEntity.ok(adminService.reviewWithdrawalByUsername(
                withdrawalId,            // ID yêu cầu rút tiền
                request.getStatus(),     // Trạng thái mới: "PAID" hoặc "REJECTED"
                request.getRejectReason(), // Lý do từ chối (null nếu PAID)
                username                 // Username admin từ JWT
        ));
    }

    // ==================== LESSON FREE MANAGEMENT ====================

    /**
     * GET /admin/lessons/free — Lấy danh sách bài học miễn phí để admin quản lý
     * Yêu cầu: JWT token có scope "admin"
     * @return ResponseEntity chứa List<LessonResponse> của tất cả lesson free
     */
    @GetMapping("/lessons/free")
    public ResponseEntity<List<LessonResponse>> getFreeLessons() {
        // Gọi service lấy tất cả lesson có lessonType = "Free"
        return ResponseEntity.ok(adminService.getFreeLessons());
    }

    /**
     * POST /admin/lessons/free — Admin tạo bài học miễn phí mới
     * Yêu cầu: JWT token có scope "admin"
     * @param body Request body dạng Map chứa title, description, status
     * @return ResponseEntity chứa LessonResponse của bài học vừa tạo
     */
    @PostMapping("/lessons/free")
    public ResponseEntity<LessonResponse> createFreeLesson(
            // @RequestBody: Jackson deserialize JSON body → Map<String, String>
            // Dùng Map thay vì DTO riêng để linh hoạt hơn cho endpoint đơn giản
            @RequestBody java.util.Map<String, String> body) {
        // Lấy các field từ body request
        String title = body.get("title");            // Tiêu đề bài học — bắt buộc
        String description = body.get("description"); // Mô tả — có thể null
        String status = body.get("status");           // Trạng thái: "Published" hoặc "Hidden"

        // Gọi service tạo lesson free với các thông tin từ request body
        return ResponseEntity.ok(adminService.createFreeLesson(title, description, status));
    }

    /**
     * PUT /admin/lessons/free/{lessonId} — Admin cập nhật bài học miễn phí
     * Yêu cầu: JWT token có scope "admin"
     * @param lessonId ID bài học cần cập nhật (từ URL path)
     * @param body     Request body chứa title, description, status (các field cần cập nhật)
     * @return ResponseEntity chứa LessonResponse sau khi cập nhật
     */
    @PutMapping("/lessons/free/{lessonId}")
    public ResponseEntity<LessonResponse> updateFreeLesson(
            // @PathVariable: lấy {lessonId} từ URL path
            @PathVariable Long lessonId,
            // @RequestBody: deserialize JSON body → Map
            @RequestBody java.util.Map<String, String> body) {
        // Lấy các field cần cập nhật (null = giữ nguyên giá trị cũ)
        String title = body.get("title");
        String description = body.get("description");
        String status = body.get("status");

        // Gọi service cập nhật lesson free
        return ResponseEntity.ok(adminService.updateFreeLesson(lessonId, title, description, status));
    }

    /**
     * DELETE /admin/lessons/free/{lessonId} — Admin xóa mềm bài học miễn phí
     * Yêu cầu: JWT token có scope "admin"
     * @param lessonId ID bài học cần xóa (từ URL path)
     * @return ResponseEntity với HTTP 200 OK và message xác nhận
     */
    @DeleteMapping("/lessons/free/{lessonId}")
    public ResponseEntity<String> deleteFreeLesson(@PathVariable Long lessonId) {
        // Gọi service xóa mềm (đổi status sang "deleted")
        adminService.deleteFreeLesson(lessonId);
        // Trả về message xác nhận xóa thành công
        return ResponseEntity.ok("Đã xóa bài học miễn phí");
    }

    // ==================== EXAM MANAGEMENT ====================

    /**
     * GET /admin/exams — Lấy toàn bộ kỳ thi trong hệ thống
     * Yêu cầu: JWT token có scope "admin"
     * @return ResponseEntity chứa List<ExamAdminResponse> của tất cả kỳ thi
     */
    @GetMapping("/exams")
    public ResponseEntity<List<ExamAdminResponse>> getAllExams() {
        // Lấy tất cả kỳ thi từ service
        return ResponseEntity.ok(adminService.getAllExams());
    }

    /**
     * PUT /admin/exams/{examId}/status — Admin cập nhật trạng thái kỳ thi
     * Yêu cầu: JWT token có scope "admin"
     * @param examId ID kỳ thi cần cập nhật (từ URL path)
     * @param body   Request body chứa trường "status"
     * @return ResponseEntity chứa ExamAdminResponse sau khi cập nhật
     */
    @PutMapping("/exams/{examId}/status")
    public ResponseEntity<ExamAdminResponse> updateExamStatus(
            @PathVariable Long examId,
            @RequestBody java.util.Map<String, String> body) {
        // Lấy status mới từ request body
        String status = body.get("status");
        // Gọi service cập nhật trạng thái kỳ thi
        return ResponseEntity.ok(adminService.updateExamStatus(examId, status));
    }

    // ==================== NOTIFICATION MANAGEMENT ====================

    /**
     * GET /admin/notifications — Lấy lịch sử thông báo đã gửi
     * Yêu cầu: JWT token có scope "admin"
     * @return ResponseEntity chứa List<NotificationResponse>
     */
    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationResponse>> getAllNotifications() {
        // Lấy tất cả thông báo đã tạo từ service
        return ResponseEntity.ok(adminService.getAllNotifications());
    }

    /**
     * POST /admin/notifications — Admin tạo và gửi thông báo
     * Yêu cầu: JWT token có scope "admin"
     * @param request NotificationRequest chứa title, message, targetType, targetValue
     * @return ResponseEntity chứa NotificationResponse của thông báo vừa tạo
     */
    @PostMapping("/notifications")
    public ResponseEntity<NotificationResponse> createNotification(
            @RequestBody NotificationRequest request) {
        // Lấy username admin từ JWT token qua SecurityContext (ThreadLocal)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        // Gọi service tạo thông báo với dữ liệu từ request và username admin
        return ResponseEntity.ok(adminService.createNotification(request, username));
    }

    // ==================== TRANSACTION MANAGEMENT (ADM-10) ====================

    /**
     * GET /admin/transactions — Lấy toàn bộ giao dịch thanh toán trong hệ thống
     *
     * ADM-10: Quản lý giao dịch và thanh toán
     * Cho phép admin theo dõi tất cả giao dịch: ai mua gì, bao nhiêu tiền, kết quả ra sao.
     * Dùng để kiểm soát tài chính hệ thống và phát hiện giao dịch bất thường.
     *
     * Yêu cầu: JWT token có scope "admin"
     * @return ResponseEntity chứa List<TransactionAdminResponse> — tất cả giao dịch, mới nhất lên đầu
     */
    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionAdminResponse>> getAllTransactions() {
        // Gọi service lấy tất cả giao dịch — Jackson tự serialize thành JSON array
        return ResponseEntity.ok(adminService.getAllTransactions());
    }

    // ==================== COURSE REVIEW MANAGEMENT (ADM-11) ====================

    /**
     * GET /admin/reviews — Lấy toàn bộ đánh giá khóa học để admin kiểm duyệt
     *
     * ADM-11: Quản lý bình luận và đánh giá
     * Admin xem tất cả đánh giá của học viên để phát hiện nội dung vi phạm chính sách.
     *
     * Yêu cầu: JWT token có scope "admin"
     * @return ResponseEntity chứa List<CourseReviewResponse> — tất cả đánh giá, mới nhất lên đầu
     */
    @GetMapping("/reviews")
    public ResponseEntity<List<CourseReviewResponse>> getAllReviews() {
        // Lấy tất cả đánh giá từ service
        return ResponseEntity.ok(adminService.getAllCourseReviews());
    }

    /**
     * DELETE /admin/reviews/{reviewId} — Admin xóa một đánh giá vi phạm chính sách
     *
     * ADM-11: Quản lý bình luận và đánh giá
     * Admin có quyền xóa bất kỳ đánh giá nào có nội dung không phù hợp.
     * Thao tác này là hard delete — không thể hoàn tác.
     *
     * Yêu cầu: JWT token có scope "admin"
     * @param reviewId ID của đánh giá cần xóa (từ URL path)
     * @return ResponseEntity với HTTP 200 OK và message xác nhận
     */
    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<String> deleteReview(@PathVariable Long reviewId) {
        // Gọi service xóa đánh giá theo ID
        adminService.deleteCourseReview(reviewId);
        // Trả về message xác nhận xóa thành công
        return ResponseEntity.ok("Đã xóa đánh giá");
    }

    // ==================== CHANGE PASSWORD (ADM-15) ====================

    /**
     * PUT /admin/change-password — Admin đổi mật khẩu tài khoản quản trị
     *
     * ADM-15: Đổi mật khẩu quản trị
     * Admin nhập mật khẩu cũ để xác thực, rồi nhập mật khẩu mới.
     * Backend verify oldPassword bằng BCrypt trước khi cho phép đổi.
     *
     * Yêu cầu: JWT token có scope "admin"
     * @param request ChangePasswordRequest chứa oldPassword, newPassword, confirmPassword
     * @return ResponseEntity với HTTP 200 OK và message xác nhận
     */
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody AdminChangePasswordRequest request) {
        // Lấy username admin từ JWT SecurityContext — ThreadLocal per-request
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        // Gọi service đổi mật khẩu với username từ JWT và data từ request body
        adminService.changeAdminPassword(
                username,                     // Username từ JWT subject
                request.getOldPassword(),     // Mật khẩu hiện tại (plain text — so sánh bằng BCrypt)
                request.getNewPassword(),     // Mật khẩu mới (plain text — sẽ được encode trước khi lưu)
                request.getConfirmPassword()  // Xác nhận mật khẩu mới
        );

        // Trả về message thành công — không cần trả về token mới
        // JWT cũ vẫn hợp lệ đến hết hạn (stateless JWT không tự expire khi đổi mật khẩu)
        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }
}
