// Khai báo package — DTO request nằm trong tầng nhận dữ liệu từ client
package com.learning.english.dto.request;

// Import Lombok annotations — tự động sinh getter, setter, constructor, builder
import lombok.*;

// @Getter: Lombok tự sinh getter cho tất cả field
@Getter
// @Setter: Lombok tự sinh setter cho tất cả field
@Setter
// @NoArgsConstructor: Sinh constructor không tham số (Jackson dùng để deserialize JSON)
@NoArgsConstructor
// @AllArgsConstructor: Sinh constructor với tất cả tham số
@AllArgsConstructor
// @Builder: Sinh Builder pattern cho object creation
@Builder
public class NotificationRequest {

    // Tiêu đề thông báo — bắt buộc nhập, tối đa 255 ký tự
    // Ví dụ: "Thông báo bảo trì hệ thống"
    private String title;

    // Nội dung chi tiết của thông báo
    // Ví dụ: "Hệ thống sẽ bảo trì vào 22:00 ngày 15/05/2025"
    private String message;

    // Kiểu đối tượng nhận thông báo
    // Các giá trị hợp lệ: "ALL" (toàn hệ thống), "ROLE" (theo vai trò), "USER" (người dùng cụ thể)
    private String targetType;

    // Giá trị đối tượng nhận — ý nghĩa phụ thuộc vào targetType:
    // targetType = "ALL"  → targetValue = null (không cần)
    // targetType = "ROLE" → targetValue = roleName (ví dụ: "student", "teacher")
    // targetType = "USER" → targetValue = userId dưới dạng String (ví dụ: "42")
    private String targetValue;
}
