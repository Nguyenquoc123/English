// Khai báo package — repository nằm trong tầng data access của ứng dụng
package com.learning.english.repository;

// Import entity Notification — ánh xạ trực tiếp đến bảng notifications trong DB
import com.learning.english.entity.Notification;

// Import JpaRepository — cung cấp CRUD operations và query methods
import org.springframework.data.jpa.repository.JpaRepository;

// Import @Repository — đánh dấu đây là repository bean
import org.springframework.stereotype.Repository;

// Import List — kiểu dữ liệu danh sách
import java.util.List;

// @Repository: Spring Data JPA tự tạo implementation tại runtime
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Lấy tất cả thông báo đã tạo, sắp xếp mới nhất lên đầu
    // Spring Data JPA tự sinh: SELECT * FROM notifications ORDER BY created_at DESC
    // Admin dùng để xem lịch sử thông báo đã gửi
    List<Notification> findAllByOrderByCreatedAtDesc();
}
