package com.learning.english.repository;

import com.learning.english.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * TransactionRepository — Repository tầng truy cập dữ liệu cho entity Transaction (Giao dịch).
 *
 * @Repository:
 *   Đánh dấu interface là Spring Repository component.
 *   Spring tự tạo proxy implementation khi khởi động.
 *   Chuyển đổi exception JPA/JDBC sang Spring DataAccessException.
 *
 * extends JpaRepository<Transaction, Long>:
 *   - Transaction: Entity ánh xạ với bảng "transactions" trong database.
 *   - Long: Kiểu dữ liệu của Primary Key (transactionId là Long/bigint).
 *
 *   Các method CRUD có sẵn:
 *     - save(transaction): Lưu giao dịch mới.
 *     - findById(id): Tìm giao dịch theo ID.
 *     - findAll(): Lấy tất cả giao dịch.
 *
 * Giao dịch (Transaction) trong hệ thống:
 *   Lưu lịch sử thanh toán của học sinh khi mua khóa học hoặc đề thi.
 *   Các field quan trọng:
 *     - amount: Số tiền giao dịch (BigDecimal để tránh sai số float/double).
 *     - status: Trạng thái ("PENDING", "SUCCESS", "FAILED", v.v.).
 *     - targetType: Loại mục tiêu thanh toán ("COURSE", "EXAM").
 *     - targetId: ID của khóa học hoặc đề thi được thanh toán.
 *     - user: User thực hiện giao dịch.
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * findFirstByUserUserIdAndTargetTypeAndTargetIdAndStatusOrderByCreatedAtDesc
     * — Tìm giao dịch gần nhất của user cho một target cụ thể với status nhất định.
     *
     * SQL tương đương:
     *   SELECT TOP 1 * FROM transactions
     *   WHERE user_userId = ?
     *     AND targetType = ?
     *     AND targetId = ?
     *     AND status = ?
     *   ORDER BY createdAt DESC
     *
     * Quy tắc Query Derivation chi tiết:
     *   - "findFirst" = SELECT TOP 1 (chỉ lấy 1 record đầu tiên sau khi sort).
     *     Khác với "findBy" có thể trả về nhiều record.
     *   - "By" = WHERE
     *   - "UserUserId" = navigation qua field "user" (User entity) → lấy "userId"
     *     (chuỗi "User" + "UserId" = user.userId trong Java = user_userId trong SQL)
     *   - "And" = AND
     *   - "TargetType" = field targetType (loại: "COURSE" hoặc "EXAM")
     *   - "And" = AND
     *   - "TargetId" = field targetId (ID của khóa học hoặc đề thi)
     *   - "And" = AND
     *   - "Status" = field status của giao dịch
     *   - "OrderByCreatedAtDesc" = ORDER BY createdAt DESC (mới nhất lên đầu)
     *
     * Trả về Optional<Transaction>:
     *   - Optional.of(transaction) nếu tìm thấy.
     *   - Optional.empty() nếu user chưa có giao dịch nào khớp điều kiện.
     *
     * Dùng trong: Kiểm tra xem user đã thanh toán thành công cho một khóa học chưa,
     * hoặc lấy giao dịch đang pending mới nhất để kiểm tra trạng thái webhook.
     * Ví dụ: findFirst...(userId, "COURSE", courseId, "SUCCESS") →
     *   Nếu có kết quả → user đã mua khóa học này rồi.
     */
    Optional<Transaction> findFirstByUserUserIdAndTargetTypeAndTargetIdAndStatusOrderByCreatedAtDesc(
            Long userId,
            String targetType,
            Long targetId,
            String status
    );

    /**
     * findByTransactionIdAndTargetType — Tìm giao dịch theo ID và loại target.
     *
     * SQL tương đương:
     *   SELECT * FROM transactions WHERE transactionId = ? AND targetType = ?
     *
     * Quy tắc Query Derivation:
     *   - "findBy" = SELECT ... WHERE
     *   - "TransactionId" = PK của transaction
     *   - "And" = AND
     *   - "TargetType" = loại mục tiêu ("COURSE" hoặc "EXAM")
     *
     * Tại sao cần cả transactionId VÀ targetType?
     *   transactionId đã là unique → tìm theo mình nó là đủ về mặt kỹ thuật.
     *   Nhưng thêm targetType là để đảm bảo an toàn: xác nhận giao dịch này
     *   đúng là loại ta mong đợi (tránh nhầm giao dịch EXAM với COURSE).
     *   Đây là pattern defensive programming — giảm bug logic.
     *
     * Dùng trong: Webhook handler (SePay gửi callback) — tìm giao dịch cần cập nhật
     * trạng thái sau khi nhận thanh toán, đồng thời xác nhận loại giao dịch đúng.
     */
    Optional<Transaction> findByTransactionIdAndTargetType(
            Long transactionId,
            String targetType
    );

    /**
     * findAllByOrderByCreatedAtDesc — Lấy TẤT CẢ giao dịch, sắp xếp mới nhất lên đầu.
     *
     * Dùng trong: Admin endpoint GET /admin/transactions (ADM-10 theo SRS)
     * Admin cần theo dõi toàn bộ lịch sử thanh toán của học viên mua khóa học / kỳ thi.
     *
     * Spring Data JPA query derivation:
     *   - findAll                 = SELECT * FROM transactions
     *   - By                      = (không có điều kiện WHERE)
     *   - OrderByCreatedAtDesc    = ORDER BY created_at DESC
     *
     * SQL tương đương:
     *   SELECT * FROM transactions ORDER BY created_at DESC
     *
     * Tại sao sắp xếp DESC?
     *   Admin thường muốn xem giao dịch mới nhất trước (recent activity).
     *   Sắp xếp tăng dần (ASC) sẽ hiển thị giao dịch cũ nhất trên cùng.
     *
     * @return Danh sách tất cả Transaction, mới nhất lên đầu
     */
    List<Transaction> findAllByOrderByCreatedAtDesc();

    /**
     * sumSuccessAmount — Tính tổng doanh thu từ tất cả giao dịch thành công.
     *
     * @Query với JPQL:
     *   Dùng @Query thay vì Query Derivation vì cần hàm SUM aggregate —
     *   Spring Data JPA không hỗ trợ aggregate function trong method name.
     *
     * Phân tích JPQL:
     *   SELECT SUM(t.amount) FROM Transaction t WHERE t.status = 'SUCCESS'
     *
     *   SUM(t.amount):
     *     Hàm tổng hợp (aggregate function) — tính tổng tất cả giá trị amount.
     *     Tương tự SQL SUM(), nhưng dùng tên field Java (amount) thay vì tên cột SQL.
     *
     *   FROM Transaction t:
     *     Lấy từ entity Transaction (không phải bảng "transactions" — đây là JPQL).
     *
     *   WHERE t.status = 'SUCCESS':
     *     Điều kiện cứng: Chỉ tính những giao dịch đã hoàn thành thành công.
     *     Loại bỏ: PENDING (chưa xong), FAILED (thất bại), REFUNDED (hoàn tiền).
     *     Đây là điều kiện quan trọng nhất để tính doanh thu chính xác.
     *
     * Trả về BigDecimal:
     *   Tại sao dùng BigDecimal thay vì double hay float?
     *     - double/float có sai số làm tròn do biểu diễn nhị phân (binary floating-point).
     *       Ví dụ: 0.1 + 0.2 = 0.30000000000000004 với double.
     *     - BigDecimal biểu diễn số thập phân chính xác tuyệt đối.
     *     - Với tiền tệ, sai số dù nhỏ cũng không thể chấp nhận.
     *     - BigDecimal là standard Java type cho mọi tính toán tài chính.
     *
     *   Lưu ý: Nếu không có giao dịch nào với status = 'SUCCESS', SUM() trả về NULL.
     *   Service layer cần xử lý: result != null ? result : BigDecimal.ZERO.
     *
     * Dùng trong Admin Dashboard: Hiển thị tổng doanh thu của toàn hệ thống.
     */
    @org.springframework.data.jpa.repository.Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.status = 'SUCCESS'")
    java.math.BigDecimal sumSuccessAmount();
}
