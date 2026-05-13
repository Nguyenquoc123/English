// Package khai báo — nằm trong tầng DTO response của ứng dụng
package com.learning.english.dto.response;

// Import Lombok annotations — tự động sinh getter, setter, constructor, builder
import lombok.*;

// Import BigDecimal — kiểu tiền tệ chính xác cao, tránh sai số float/double
import java.math.BigDecimal;

// Import LocalDateTime — kiểu ngày giờ Java 8+ không có timezone
import java.time.LocalDateTime;

/**
 * TransactionAdminResponse — DTO trả về thông tin giao dịch thanh toán cho trang Admin.
 *
 * Được dùng trong endpoint: GET /admin/transactions
 *
 * Mỗi giao dịch (Transaction) trong hệ thống ghi lại:
 *   - Ai mua (userId, username, email)
 *   - Mua gì (targetType = "COURSE" hoặc "EXAM", targetId)
 *   - Số tiền bao nhiêu (amount)
 *   - Kết quả giao dịch (status)
 *   - Thời điểm giao dịch (createdAt)
 *
 * Pattern: DTO (Data Transfer Object)
 *   - Không expose trực tiếp entity vào API response (tránh lộ dữ liệu nhạy cảm)
 *   - Chỉ chứa các field cần thiết cho UI Admin — không có password, internal fields
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionAdminResponse {

    // ID duy nhất của giao dịch — Primary Key trong bảng transactions
    private Long transactionId;

    // ID người dùng thực hiện giao dịch (học viên mua khóa học / kỳ thi)
    private Long userId;

    // Username của người dùng — hiển thị trong bảng admin
    private String username;

    // Email của người dùng — hiển thị trong bảng admin để liên hệ nếu cần
    private String email;

    // Loại đối tượng được mua:
    //   "COURSE" — mua khóa học
    //   "EXAM"   — mua quyền thi kỳ thi
    private String targetType;

    // ID của đối tượng được mua (courseId hoặc examId tùy theo targetType)
    private Long targetId;

    // Tên của đối tượng được mua (tên khóa học hoặc tên kỳ thi)
    // Được lookup bằng targetId + targetType để hiển thị tên thay vì ID số
    private String targetName;

    // Số tiền giao dịch (VNĐ) — BigDecimal đảm bảo độ chính xác tuyệt đối
    private BigDecimal amount;

    // Trạng thái giao dịch:
    //   "PENDING" — đang chờ thanh toán (webhook chưa về)
    //   "SUCCESS" — thanh toán thành công
    //   "FAILED"  — thanh toán thất bại
    private String status;

    // Thời điểm tạo giao dịch — ISO 8601, serialize thành string trong JSON
    private LocalDateTime createdAt;

    // Thời điểm cập nhật lần cuối (ví dụ: khi webhook về và cập nhật status)
    private LocalDateTime updatedAt;
}
