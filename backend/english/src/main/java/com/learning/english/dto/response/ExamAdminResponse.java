// Khai báo package — DTO response nằm trong tầng truyền dữ liệu
package com.learning.english.dto.response;

// Import Lombok annotations — tự động sinh getter, setter, constructor, builder
import lombok.*;

// Import LocalDateTime — kiểu ngày giờ Java 8+, dùng cho các trường thời gian
import java.time.LocalDateTime;

// @Getter: Lombok tự sinh getter cho tất cả field (getExamId(), getTitle(), ...)
@Getter
// @Setter: Lombok tự sinh setter cho tất cả field
@Setter
// @NoArgsConstructor: Tự sinh constructor không tham số (cần cho JSON deserialization)
@NoArgsConstructor
// @AllArgsConstructor: Tự sinh constructor với tất cả tham số
@AllArgsConstructor
// @Builder: Sinh Builder pattern — dùng ExamAdminResponse.builder().examId(...).build()
@Builder
public class ExamAdminResponse {

    // ID duy nhất của kỳ thi trong hệ thống
    private Long examId;

    // Tiêu đề kỳ thi (ví dụ: "Kỳ thi cuối khóa A1")
    private String title;

    // Mô tả chi tiết kỳ thi
    private String description;

    // Thời lượng làm bài tính bằng phút (ví dụ: 60)
    private Integer durationMinutes;

    // Số lần tối đa học viên được phép thi lại
    private Integer maxAttempts;

    // Trạng thái kỳ thi: "Draft", "Open", "Closed", "Hidden"
    // Draft: chưa mở; Open: đang mở cho học viên; Closed: đã đóng; Hidden: ẩn
    private String status;

    // ID khóa học chứa kỳ thi này
    private Long courseId;

    // Tên khóa học — để admin nhận biết kỳ thi thuộc khóa học nào
    private String courseTitle;

    // Tên đăng nhập của giáo viên đã tạo kỳ thi
    private String createdByUsername;

    // Thời gian bắt đầu kỳ thi (có thể null nếu chưa cấu hình)
    private LocalDateTime startTime;

    // Thời gian kết thúc kỳ thi (có thể null nếu chưa cấu hình)
    private LocalDateTime endTime;

    // Thời điểm kỳ thi được tạo trong hệ thống
    private LocalDateTime createdAt;

    // Thời điểm kỳ thi được cập nhật lần cuối
    private LocalDateTime updatedAt;
}
