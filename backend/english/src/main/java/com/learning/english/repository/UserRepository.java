package com.learning.english.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.User;

import java.util.List;
import java.util.Optional;

/**
 * UserRepository — Repository tầng truy cập dữ liệu cho entity User.
 *
 * @Repository:
 *   Đánh dấu interface này là một Spring Repository component.
 *   Ngoài việc kích hoạt component scan, annotation này còn bật tính năng
 *   chuyển đổi các exception của JPA/JDBC thành Spring DataAccessException,
 *   giúp xử lý lỗi database nhất quán hơn.
 *
 * extends JpaRepository<User, Long>:
 *   Kế thừa từ JpaRepository — interface cao nhất trong hệ thống Spring Data JPA.
 *   - Tham số thứ nhất <User>: Entity class mà repository này quản lý.
 *   - Tham số thứ hai <Long>: Kiểu dữ liệu của Primary Key (userId là Long/bigint).
 *
 *   JpaRepository tự động cung cấp sẵn các method CRUD mà không cần viết code:
 *     - save(user): INSERT hoặc UPDATE (nếu đã có id).
 *     - findById(id): SELECT WHERE userId = ? → trả về Optional<User>.
 *     - findAll(): SELECT * FROM users.
 *     - deleteById(id): DELETE WHERE userId = ?.
 *     - count(): SELECT COUNT(*) FROM users.
 *     - existsById(id): SELECT COUNT(*) > 0 WHERE userId = ?.
 *     - ... và nhiều method khác (findAll với phân trang, sort, v.v.)
 *
 * Spring Data JPA sẽ tự động tạo implementation (proxy class) cho interface này
 * lúc runtime — ta không cần viết class implement thủ công.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * findByUsername — Tìm user theo tên đăng nhập.
     *
     * Spring Data JPA tự động sinh SQL: SELECT * FROM users WHERE username = ?
     * Quy tắc đặt tên (Query Derivation / Method Name Convention):
     *   - "findBy" = SELECT ... WHERE
     *   - "Username" = tên field trong entity User (phải khớp chính xác, case-sensitive)
     *
     * Trả về Optional<User>:
     *   Optional là container có thể chứa hoặc không chứa giá trị.
     *   - Nếu tìm thấy: Optional.of(user)
     *   - Nếu không tìm thấy: Optional.empty() (không ném NullPointerException)
     *   Caller phải dùng .orElseThrow() hoặc .isPresent() để xử lý an toàn.
     */
    Optional<User> findByUsername(String username);

    /**
     * findByEmail — Tìm user theo địa chỉ email.
     * SQL tương đương: SELECT * FROM users WHERE email = ?
     * Dùng khi đăng nhập bằng email hoặc kiểm tra email đã tồn tại.
     */
    Optional<User> findByEmail(String email);

    /**
     * findByUsernameOrEmail — Tìm user khớp với username HOẶC email.
     *
     * Spring Data JPA sinh SQL: SELECT * FROM users WHERE username = ? OR email = ?
     * Quy tắc: "Or" nối hai điều kiện bằng SQL OR.
     * Hai tham số phải đặt đúng thứ tự: (username, email) — Spring map theo thứ tự.
     *
     * Dùng cho chức năng đăng nhập linh hoạt: user có thể nhập username hoặc
     * email vào cùng một ô input.
     */
    Optional<User> findByUsernameOrEmail(String username, String email);

    /**
     * existsByEmailAndUserIdNot — Kiểm tra email đã tồn tại ở user KHÁC.
     *
     * SQL tương đương: SELECT COUNT(*) > 0 FROM users WHERE email = ? AND userId <> ?
     * Quy tắc:
     *   - "existsBy" = SELECT COUNT(*) > 0 (trả về boolean)
     *   - "And" = kết hợp thêm điều kiện AND
     *   - "UserIdNot" = userId <> ? (Not = khác, không bằng)
     *
     * Dùng khi cập nhật profile: kiểm tra email mới đã thuộc về user khác chưa.
     * Nếu chỉ dùng existsByEmail thì sẽ bị lỗi khi user giữ nguyên email của họ
     * (email của họ rõ ràng đã tồn tại trong DB).
     */
    boolean existsByEmailAndUserIdNot(String email, Long userId);

    /**
     * existsByUsername — Kiểm tra username đã tồn tại trong hệ thống chưa.
     * SQL: SELECT COUNT(*) > 0 FROM users WHERE username = ?
     * Dùng khi đăng ký tài khoản: báo lỗi nếu username đã có người dùng.
     */
    boolean existsByUsername(String username);

    /**
     * existsByEmail — Kiểm tra email đã tồn tại chưa.
     * SQL: SELECT COUNT(*) > 0 FROM users WHERE email = ?
     * Dùng khi đăng ký: báo lỗi nếu email đã được đăng ký.
     */
    boolean existsByEmail(String email);

    /**
     * countByRole_RoleName — Đếm số user theo tên role.
     *
     * SQL tương đương:
     *   SELECT COUNT(*) FROM users u
     *   JOIN roles r ON u.roleId = r.roleId
     *   WHERE r.roleName = ?
     *
     * Quy tắc Query Derivation với navigation qua relationship:
     *   - "countBy" = SELECT COUNT(*)
     *   - "Role" = field "role" trong entity User (là @ManyToOne → Role entity)
     *   - "_" (gạch dưới) = phân tách giữa tên field liên kết và field của entity đó
     *   - "RoleName" = field "roleName" trong entity Role
     *
     *   Spring Data JPA tự động JOIN từ users sang roles.
     *
     * Dùng trong Admin Dashboard để hiển thị thống kê:
     *   - countByRole_RoleName("student") → tổng số học sinh
     *   - countByRole_RoleName("teacher") → tổng số giáo viên
     */
    long countByRole_RoleName(String roleName);

    /**
     * findAllByOrderByCreatedAtDesc — Lấy tất cả user, sắp xếp theo ngày tạo mới nhất.
     *
     * SQL tương đương: SELECT * FROM users ORDER BY createdAt DESC
     *
     * Quy tắc:
     *   - "findAllBy" = SELECT * (không có điều kiện WHERE, lấy tất cả)
     *   - "OrderBy" = ORDER BY trong SQL
     *   - "CreatedAt" = tên field trong entity User
     *   - "Desc" = giảm dần (DESC) — user mới đăng ký sẽ hiển thị trước
     *   (Ngược lại là "Asc" = tăng dần / ASC)
     *
     * Dùng trong Admin Panel để hiển thị danh sách user theo thứ tự đăng ký mới nhất.
     */
    List<User> findAllByOrderByCreatedAtDesc();

    /**
     * searchUsers — Tìm kiếm user theo từ khóa và/hoặc role, có sắp xếp.
     *
     * Đây là query phức tạp, không thể dùng Query Derivation → phải dùng @Query
     * với JPQL (Java Persistence Query Language).
     *
     * @Query:
     *   Cho phép viết JPQL tùy chỉnh thay vì để Spring tự sinh từ tên method.
     *   JPQL khác SQL ở chỗ: dùng tên Entity và field Java (không phải tên bảng/cột SQL).
     *   Ví dụ: "FROM User u" chứ không phải "FROM users u".
     *
     * Phân tích câu JPQL:
     *
     *   SELECT u FROM User u — Lấy toàn bộ User entity.
     *
     *   WHERE:
     *     (:keyword IS NULL OR ...):
     *       Kỹ thuật "optional parameter" trong JPQL.
     *       Nếu keyword = null (không truyền vào) → điều kiện (:keyword IS NULL) = TRUE
     *       → toàn bộ điều kiện OR trở thành TRUE → bỏ qua filter keyword.
     *       Nếu keyword có giá trị → kiểm tra tiếp điều kiện OR phía sau.
     *       Cách này giúp dùng cùng 1 query cho cả 2 trường hợp: có và không có keyword.
     *
     *     LOWER(u.username) LIKE LOWER(CONCAT('%',:keyword,'%')):
     *       - LOWER(): Chuyển cả hai về chữ thường trước khi so sánh → tìm kiếm
     *         case-insensitive (không phân biệt hoa/thường).
     *       - LIKE '%keyword%': Tìm username chứa keyword ở bất kỳ vị trí nào.
     *       - CONCAT('%',:keyword,'%'): Ghép ký tự % vào hai đầu keyword để tạo
     *         pattern cho LIKE.
     *
     *     Tương tự cho LOWER(u.email): Tìm theo email nếu không khớp username.
     *
     *     (:roleName IS NULL OR u.role.roleName = :roleName):
     *       Nếu roleName = null → bỏ qua filter role (hiển thị mọi role).
     *       Nếu có roleName → lọc chính xác theo role đó.
     *       u.role.roleName: Navigation qua quan hệ @ManyToOne từ User sang Role.
     *
     *   ORDER BY u.createdAt DESC: Sắp xếp kết quả, user mới nhất lên đầu.
     *
     * @Param("keyword"): Ánh xạ tham số Java "keyword" vào placeholder ":keyword"
     *   trong câu JPQL. Nếu không có @Param, Spring không biết map tên tham số.
     *   Bắt buộc khi dùng @Query với named parameters (:paramName).
     *
     * @Param("roleName"): Tương tự cho tham số roleName.
     */
    @Query("SELECT u FROM User u WHERE " +
           "(:keyword IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%',:keyword,'%')) " +
           " OR LOWER(u.email) LIKE LOWER(CONCAT('%',:keyword,'%')) " +
           " OR LOWER(u.fullName) LIKE LOWER(CONCAT('%',:keyword,'%'))) " +
           "AND (:roleName IS NULL OR u.role.roleName = :roleName) " +
           "AND (:status IS NULL OR u.status = :status) " +
           "ORDER BY u.createdAt DESC")
    List<User> searchUsers(@Param("keyword") String keyword,
                           @Param("roleName") String roleName,
                           @Param("status") String status);
}
