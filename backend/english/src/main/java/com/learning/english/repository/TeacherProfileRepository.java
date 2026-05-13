package com.learning.english.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.TeacherProfile;
import com.learning.english.entity.User;

/**
 * TeacherProfileRepository — Repository tầng truy cập dữ liệu cho entity TeacherProfile.
 *
 * @Repository:
 *   Đánh dấu interface là Spring Repository component.
 *   Spring sẽ tự tạo proxy implementation khi khởi động ứng dụng.
 *   Các exception từ JPA được tự động chuyển thành Spring DataAccessException.
 *
 * extends JpaRepository<TeacherProfile, Long>:
 *   - TeacherProfile: Entity được quản lý (ánh xạ với bảng teacher_profiles).
 *   - Long: Kiểu dữ liệu của Primary Key (teacherProfileId là Long/bigint).
 *
 *   Các method CRUD có sẵn từ JpaRepository:
 *     - save(profile): Tạo mới hoặc cập nhật hồ sơ giáo viên.
 *     - findById(id): Tìm hồ sơ theo ID.
 *     - findAll(): Lấy tất cả hồ sơ.
 *     - deleteById(id): Xóa hồ sơ.
 *     - existsById(id): Kiểm tra hồ sơ có tồn tại không.
 *
 * TeacherProfile entity lưu thông tin đăng ký giáo viên của user:
 *   bio (giới thiệu bản thân), experience (kinh nghiệm), certificates (chứng chỉ),
 *   approvalStatus (trạng thái duyệt: PENDING/APPROVED/REJECTED).
 */
@Repository
public interface TeacherProfileRepository extends JpaRepository<TeacherProfile, Long> {

    /**
     * findByUser — Tìm hồ sơ giáo viên theo đối tượng User.
     *
     * SQL tương đương: SELECT * FROM teacher_profiles WHERE userId = ?
     * (Spring truyền user.userId vào câu query, không phải cả object User)
     *
     * Quy tắc Query Derivation:
     *   - "findBy" = SELECT ... WHERE
     *   - "User" = field "user" trong entity TeacherProfile (là @ManyToOne → User)
     *   Spring hiểu: WHERE user = :user → lấy PK của User để so sánh.
     *
     * Trả về Optional<TeacherProfile>:
     *   Một user chỉ có tối đa một hồ sơ giáo viên (quan hệ 1-1).
     *   Optional đảm bảo an toàn khi user chưa đăng ký làm giáo viên
     *   (trả về Optional.empty() thay vì null).
     *
     * Dùng trong: Kiểm tra trạng thái hồ sơ giáo viên của user đang đăng nhập.
     */
    Optional<TeacherProfile> findByUser(User user);

    /**
     * existsByUser — Kiểm tra user đã có hồ sơ giáo viên chưa.
     *
     * SQL tương đương: SELECT COUNT(*) > 0 FROM teacher_profiles WHERE userId = ?
     *
     * Quy tắc:
     *   - "existsBy" = SELECT COUNT(*) > 0 (trả về boolean: true/false)
     *   - "User" = field "user" trong TeacherProfile
     *
     * Dùng trong: Ngăn user đăng ký hồ sơ giáo viên lần thứ hai khi đã có rồi.
     * Thay vì gọi findByUser().isPresent(), existsByUser() hiệu quả hơn vì
     * chỉ cần COUNT(*) thay vì SELECT toàn bộ record.
     */
    boolean existsByUser(User user);

    /**
     * countByApprovalStatus — Đếm số hồ sơ giáo viên theo trạng thái duyệt.
     *
     * SQL tương đương: SELECT COUNT(*) FROM teacher_profiles WHERE approvalStatus = ?
     *
     * Quy tắc Query Derivation:
     *   - "countBy" = SELECT COUNT(*)
     *   - "ApprovalStatus" = field "approvalStatus" trong entity TeacherProfile
     *
     * Giá trị approvalStatus thường dùng:
     *   - "PENDING": Hồ sơ mới nộp, chờ admin xem xét.
     *   - "APPROVED": Admin đã duyệt, user trở thành teacher.
     *   - "REJECTED": Admin từ chối, user cần chỉnh sửa và nộp lại.
     *
     * Dùng trong Admin Dashboard để hiển thị thống kê nhanh:
     *   - countByApprovalStatus("PENDING") → số đơn đang chờ duyệt.
     *   - countByApprovalStatus("APPROVED") → tổng giáo viên được duyệt.
     */
    long countByApprovalStatus(String approvalStatus);

    /**
     * findByApprovalStatusOrderByCreatedAtDesc — Lấy danh sách hồ sơ theo trạng thái,
     * sắp xếp theo ngày tạo mới nhất lên đầu.
     *
     * SQL tương đương:
     *   SELECT * FROM teacher_profiles
     *   WHERE approvalStatus = ?
     *   ORDER BY createdAt DESC
     *
     * Quy tắc Query Derivation kết hợp filter và sort:
     *   - "findBy" = SELECT ... WHERE
     *   - "ApprovalStatus" = điều kiện lọc theo field approvalStatus
     *   - "OrderBy" = ORDER BY trong SQL
     *   - "CreatedAt" = field createdAt trong entity
     *   - "Desc" = giảm dần (DESC) — hồ sơ mới nhất lên đầu
     *
     * Spring Data JPA tự động kết hợp: WHERE approvalStatus = ? ORDER BY createdAt DESC
     * Không cần viết @Query riêng cho query đơn giản này.
     *
     * Dùng trong Admin Panel:
     *   - findByApprovalStatusOrderByCreatedAtDesc("PENDING"):
     *     Hiển thị danh sách hồ sơ đang chờ duyệt, mới nộp lên đầu — admin xử lý
     *     theo thứ tự FIFO (First In First Out).
     */
    List<TeacherProfile> findByApprovalStatusOrderByCreatedAtDesc(String approvalStatus);

    /**
     * findAllByOrderByCreatedAtDesc — Lấy tất cả hồ sơ giáo viên, mới nhất lên đầu.
     *
     * SQL tương đương: SELECT * FROM teacher_profiles ORDER BY createdAt DESC
     *
     * Quy tắc:
     *   - "findAllBy" = SELECT * (không có WHERE, lấy tất cả record)
     *   - "OrderBy" = ORDER BY
     *   - "CreatedAt" = field sắp xếp
     *   - "Desc" = DESC (mới nhất trước)
     *
     * Lưu ý: "findAllBy" và "findAll" khác nhau:
     *   - findAll() = method từ JpaRepository, không thể thêm sort vào method name.
     *   - findAllByOrderByCreatedAtDesc() = Query Derivation với sort tích hợp.
     *
     * Dùng trong: Admin xem toàn bộ hồ sơ giáo viên (cả PENDING, APPROVED, REJECTED)
     * để quản lý tổng thể.
     */
    List<TeacherProfile> findAllByOrderByCreatedAtDesc();
}
