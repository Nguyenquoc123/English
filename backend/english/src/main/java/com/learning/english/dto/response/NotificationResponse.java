// Khai báo package — DTO response nằm trong tầng truyền dữ liệu về client
package com.learning.english.dto.response;

// Import Lombok annotations — tự động sinh getter, setter, constructor, builder
import lombok.*;

// Import LocalDateTime — kiểu ngày giờ Java 8+
import java.time.LocalDateTime;

// @Getter: Tự sinh getter cho tất cả field
@Getter
// @Setter: Tự sinh setter
@Setter
// @NoArgsConstructor: Constructor không tham số
@NoArgsConstructor
// @AllArgsConstructor: Constructor với tất cả tham số
@AllArgsConstructor
// @Builder: Builder pattern để tạo object linh hoạt
@Builder
public class NotificationResponse {

    // ID duy nhất của thông báo trong hệ thống
    private Long notificationId;

    // Tiêu đề thông báo
    private String title;

    // Nội dung thông báo
    private String message;

    // Kiểu đối tượng nhận: "ALL", "ROLE", hoặc "USER"
    private String targetType;

    // Giá trị đối tượng nhận (roleName hoặc userId tùy targetType)
    // null nếu targetType = "ALL"
    private String targetValue;

    // Username của admin đã tạo thông báo (audit field)
    private String createdByUsername;

    // Thời điểm thông báo được tạo và gửi
    private LocalDateTime createdAt;
}
