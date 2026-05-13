package com.learning.english.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * TeacherProfileResponse — DTO (Data Transfer Object) dùng để trả dữ liệu hồ sơ giáo viên
 * về phía client (frontend React).
 *
 * DTO là gì?
 *   Data Transfer Object là object trung gian, tách biệt với Entity (đối tượng ánh xạ DB).
 *   Entity chứa toàn bộ dữ liệu DB (kể cả field nhạy cảm như password hash, internal flags).
 *   DTO chỉ chứa đúng những field cần thiết để trả về cho client — bảo mật và gọn hơn.
 *
 * Tại sao không trả Entity trực tiếp?
 *   1. Bảo mật: Entity User có field passwordHash — không muốn lộ ra ngoài.
 *   2. Kiểm soát: Dễ thêm/bớt field response mà không ảnh hưởng schema DB.
 *   3. Vòng lặp JSON: Entity có quan hệ 2 chiều (@OneToMany + @ManyToOne) có thể gây
 *      infinite recursion khi serialize thành JSON.
 *   4. Hiệu suất: Chỉ serialize field cần thiết, response nhỏ hơn.
 *
 * Lombok Annotations — Thư viện tự động sinh code boilerplate lúc compile:
 *
 * @Getter:
 *   Tự động tạo getter method cho tất cả field.
 *   Ví dụ: private String username → public String getUsername() { return username; }
 *   Jackson (JSON serializer) dùng getter để đọc giá trị khi serialize thành JSON.
 *
 * @Setter:
 *   Tự động tạo setter method cho tất cả field.
 *   Ví dụ: public void setUsername(String username) { this.username = username; }
 *   Jackson dùng setter khi deserialize JSON thành object (ít dùng cho Response DTO).
 *
 * @NoArgsConstructor:
 *   Tự động tạo constructor không tham số: public TeacherProfileResponse() {}
 *   Cần thiết cho Jackson: Jackson cần constructor mặc định để khởi tạo object
 *   trước khi gán giá trị qua setter khi deserialize JSON.
 *   Cũng cần khi dùng JPA projection hoặc framework nào đó tạo object bằng reflection.
 *
 * @AllArgsConstructor:
 *   Tự động tạo constructor với TẤT CẢ field làm tham số (theo thứ tự khai báo).
 *   Ví dụ: public TeacherProfileResponse(Long teacherProfileId, Long userId, String username, ...)
 *   Cần thiết cho @Builder: Builder pattern dùng AllArgsConstructor nội bộ.
 *
 * @Builder:
 *   Tự động tạo Builder pattern — cách khởi tạo object linh hoạt, dễ đọc:
 *
 *   Thay vì: new TeacherProfileResponse(1L, 2L, "john", "John Doe", ...)
 *   Dùng:    TeacherProfileResponse.builder()
 *                .teacherProfileId(1L)
 *                .userId(2L)
 *                .username("john")
 *                .fullName("John Doe")
 *                .approvalStatus("PENDING")
 *                .build();
 *
 *   Ưu điểm Builder:
 *     - Không cần nhớ thứ tự tham số.
 *     - Chỉ set những field cần thiết, field còn lại giữ null/default.
 *     - Code dễ đọc hơn (tên field rõ ràng).
 *     - Immutable-friendly: tạo xong không cần set thêm.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherProfileResponse {

    /**
     * teacherProfileId — ID của hồ sơ giáo viên trong bảng teacher_profiles.
     *
     * Nguồn gốc: TeacherProfile.teacherProfileId (PK của bảng teacher_profiles).
     * Dùng trong: Frontend cần ID này để gọi API duyệt/từ chối:
     *   PUT /teacher-profile/{teacherProfileId}/approve
     */
    private Long teacherProfileId;

    /**
     * userId — ID của user sở hữu hồ sơ giáo viên này.
     *
     * Nguồn gốc: TeacherProfile.user.userId (navigation qua quan hệ @ManyToOne → User).
     * Dùng trong: Liên kết với User entity nếu cần thao tác thêm phía frontend,
     * hoặc để admin nhanh chóng tìm user account tương ứng.
     */
    private Long userId;

    /**
     * username — Tên đăng nhập của giáo viên.
     *
     * Nguồn gốc: TeacherProfile.user.username (lấy từ entity User liên kết).
     *
     * Tại sao username lại có trong TeacherProfileResponse (không phải trong UserResponse)?
     *   Khi Admin xem danh sách đơn đăng ký giáo viên, cần xem cả thông tin cơ bản
     *   của user đó (username, fullName, email) trong cùng một response — tránh phải
     *   gọi thêm API riêng để lấy thông tin user.
     *   Đây là pattern "flattened DTO": gộp dữ liệu từ nhiều entity liên quan vào
     *   một DTO để giảm số lần round-trip giữa client và server.
     */
    private String username;

    /**
     * fullName — Tên đầy đủ của giáo viên.
     *
     * Nguồn gốc: TeacherProfile.user.fullName (lấy từ entity User liên kết).
     * Hiển thị trong: Trang quản lý hồ sơ giáo viên của Admin, thẻ giáo viên
     * trên danh sách khóa học.
     */
    private String fullName;

    /**
     * email — Địa chỉ email của giáo viên.
     *
     * Nguồn gốc: TeacherProfile.user.email (lấy từ entity User liên kết).
     * Dùng trong: Admin có thể liên hệ giáo viên qua email khi phê duyệt/từ chối,
     * hoặc hệ thống gửi email thông báo kết quả duyệt.
     */
    private String email;

    /**
     * avatarUrl — URL ảnh đại diện của giáo viên.
     *
     * Nguồn gốc: TeacherProfile.user.avatarUrl (lấy từ entity User liên kết).
     * Hiển thị ảnh đại diện trên trang hồ sơ giáo viên và danh sách đăng ký.
     */
    private String avatarUrl;

    /**
     * approvalStatus — Trạng thái duyệt hồ sơ giáo viên.
     *
     * Nguồn gốc: TeacherProfile.approvalStatus.
     * Các giá trị có thể:
     *   - "PENDING": Hồ sơ mới nộp, đang chờ admin xem xét.
     *   - "APPROVED": Admin đã phê duyệt, user được thăng lên role teacher.
     *   - "REJECTED": Admin từ chối với lý do (xem rejectReason).
     *
     * Frontend dùng field này để hiển thị badge trạng thái với màu sắc tương ứng
     * (vàng = pending, xanh = approved, đỏ = rejected).
     */
    private String approvalStatus;

    /**
     * rejectReason — Lý do từ chối hồ sơ (nếu có).
     *
     * Nguồn gốc: TeacherProfile.rejectReason.
     * Chỉ có giá trị khi approvalStatus = "REJECTED".
     * Khi "PENDING" hoặc "APPROVED" → null.
     *
     * Admin điền lý do từ chối để giáo viên biết cần cải thiện gì và nộp lại.
     * Ví dụ: "Chứng chỉ IELTS không đủ điều kiện (yêu cầu >= 6.5)"
     */
    private String rejectReason;

    /**
     * bio — Giới thiệu bản thân của giáo viên (Biography).
     *
     * Nguồn gốc: TeacherProfile.bio.
     * Nội dung giáo viên tự viết khi đăng ký: kinh nghiệm, phong cách dạy,
     * mục tiêu giảng dạy.
     * Hiển thị trên trang hồ sơ giáo viên công khai (nếu được duyệt).
     */
    private String bio;

    /**
     * experience — Kinh nghiệm giảng dạy của giáo viên.
     *
     * Nguồn gốc: TeacherProfile.experience.
     * Mô tả chi tiết: số năm kinh nghiệm, đã dạy ở đâu, chuyên môn gì.
     * Admin xem field này để đánh giá năng lực trước khi phê duyệt.
     */
    private String experience;

    /**
     * reviewedAt — Thời điểm admin xem xét hồ sơ (duyệt hoặc từ chối).
     *
     * Nguồn gốc: TeacherProfile.reviewedAt (LocalDateTime).
     *
     * Tại sao cần reviewedAt?
     *   - Audit trail: Lưu vết thời gian xử lý hồ sơ — quan trọng cho việc kiểm tra.
     *   - SLA tracking: Đo thời gian xử lý từ lúc nộp (createdAt) đến lúc duyệt.
     *   - Hiển thị cho giáo viên: "Hồ sơ của bạn đã được xem xét vào ngày ..."
     *   - null nếu hồ sơ còn PENDING (chưa được admin xem).
     *
     * LocalDateTime: Timestamp gồm date + time (không có timezone).
     * Phù hợp cho ứng dụng chỉ phục vụ một múi giờ (Vietnam UTC+7).
     */
    private LocalDateTime reviewedAt;

    /**
     * createdAt — Thời điểm giáo viên nộp hồ sơ đăng ký.
     *
     * Nguồn gốc: TeacherProfile.createdAt (tự động set khi INSERT, thường dùng
     * @CreationTimestamp của Hibernate hoặc @PrePersist của JPA).
     *
     * Dùng trong:
     *   - Admin xem danh sách hồ sơ theo thứ tự nộp (sort by createdAt).
     *   - Hiển thị "Nộp đơn ngày: ..." trên giao diện.
     */
    private LocalDateTime createdAt;

    /**
     * updatedAt — Thời điểm hồ sơ được cập nhật lần cuối.
     *
     * Nguồn gốc: TeacherProfile.updatedAt (tự động cập nhật khi UPDATE, thường dùng
     * @UpdateTimestamp của Hibernate hoặc @PreUpdate của JPA).
     *
     * Tại sao cần updatedAt?
     *   - Audit trail: Biết hồ sơ đã được sửa đổi khi nào.
     *   - Khi admin duyệt/từ chối: updatedAt được cập nhật → biết lần xử lý gần nhất.
     *   - Khi giáo viên chỉnh sửa và nộp lại sau khi bị từ chối: updatedAt thay đổi
     *     → admin biết đây là version mới của hồ sơ.
     *   - Có thể dùng để implement optimistic locking (tránh conflict khi nhiều người
     *     cùng sửa một record).
     */
    private LocalDateTime updatedAt;

    /**
     * certificates — Danh sách chứng chỉ của giáo viên.
     *
     * Nguồn gốc: TeacherProfile.certificates (quan hệ @OneToMany → TeacherCertificate).
     *
     * Mỗi TeacherCertificateResponse chứa:
     *   - certificateId: ID chứng chỉ.
     *   - certificateUrl: URL ảnh/file chứng chỉ (trỏ đến /certificates/filename).
     *   - certificateName: Tên chứng chỉ (IELTS, TOEFL, bằng đại học...).
     *
     * Admin xem danh sách chứng chỉ này để xác minh năng lực trước khi phê duyệt.
     * Sử dụng List<> vì một giáo viên có thể có nhiều chứng chỉ khác nhau.
     *
     * List<TeacherCertificateResponse> (không phải List<TeacherCertificate> entity):
     *   Tiếp tục nguyên tắc DTO — trả về DTO lồng nhau, không trả entity trực tiếp,
     *   tránh serialize toàn bộ entity với các quan hệ không cần thiết.
     */
    private List<TeacherCertificateResponse> certificates;
}
