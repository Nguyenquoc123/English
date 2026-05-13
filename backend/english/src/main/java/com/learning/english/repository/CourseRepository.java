package com.learning.english.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.Course;

/**
 * CourseRepository — Repository tầng truy cập dữ liệu cho entity Course (Khóa học).
 *
 * @Repository:
 *   Đánh dấu interface là Spring Repository component, kích hoạt component scan
 *   và chuyển đổi exception JPA sang Spring DataAccessException.
 *
 * extends JpaRepository<Course, Long>:
 *   - Course: Entity ánh xạ với bảng "courses" trong database.
 *   - Long: Kiểu dữ liệu của Primary Key (courseId là Long/bigint).
 *
 *   Các method CRUD có sẵn từ JpaRepository:
 *     - save(course): Tạo mới hoặc cập nhật khóa học.
 *     - findById(id): Tìm khóa học theo ID.
 *     - findAll(): Lấy tất cả khóa học.
 *     - deleteById(id): Xóa khóa học.
 *     - count(): Tổng số khóa học.
 *
 * Khóa học có các trạng thái (status):
 *   - "Draft": Giáo viên đang soạn thảo, chưa gửi duyệt.
 *   - "Pending": Đã gửi duyệt, chờ admin xét duyệt.
 *   - "Published": Admin đã duyệt, học sinh có thể đăng ký.
 *   - "Rejected": Admin từ chối, giáo viên cần chỉnh sửa.
 *   - "Deleted": Đã xóa mềm (soft delete) — không hiển thị nhưng vẫn còn trong DB.
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    /**
     * findAllByStatusNot — Lấy tất cả khóa học KHÔNG có status nhất định.
     *
     * SQL tương đương: SELECT * FROM courses WHERE status <> ?
     *
     * Quy tắc Query Derivation:
     *   - "findAllBy" = SELECT * (không điều kiện giới hạn khác)
     *   - "Status" = field "status" trong entity Course
     *   - "Not" = điều kiện phủ định (<> hoặc != trong SQL)
     *
     * Dùng phổ biến: findAllByStatusNot("Deleted")
     *   → Lấy tất cả khóa học chưa bị xóa (soft delete pattern).
     *   Thay vì xóa thật record khỏi DB, ta chỉ đổi status = "Deleted",
     *   giúp bảo toàn dữ liệu lịch sử và dễ khôi phục.
     */
    List<Course> findAllByStatusNot(String status);

    /**
     * searchCourses — Tìm kiếm khóa học với nhiều bộ lọc kết hợp.
     *
     * Đây là query phức tạp với JOIN và nhiều điều kiện optional → dùng @Query JPQL.
     *
     * @Query với JPQL (Java Persistence Query Language):
     *   Text block (""" ... """) là cú pháp Java 13+ cho phép viết chuỗi nhiều dòng
     *   mà không cần nối chuỗi bằng +, giúp câu query dễ đọc hơn.
     *
     * Phân tích câu JPQL:
     *
     *   SELECT c FROM Course c:
     *     Chọn toàn bộ Course entity (không chỉ một số field).
     *
     *   LEFT JOIN FETCH c.teacher t:
     *     - JOIN FETCH: Tải dữ liệu liên quan (teacher) trong cùng một câu SQL,
     *       tránh vấn đề N+1 query (nếu dùng lazy loading, mỗi lần truy cập
     *       c.teacher sẽ phát sinh thêm 1 câu SQL).
     *     - LEFT JOIN: Giữ lại Course ngay cả khi không có teacher liên kết.
     *
     *   LEFT JOIN FETCH c.level l:
     *     Tải thông tin level (Beginner/Intermediate/Advanced) cùng lúc.
     *
     *   WHERE c.status <> 'Deleted':
     *     Luôn loại bỏ khóa học đã xóa mềm khỏi kết quả — đây là điều kiện cứng.
     *
     *   (:username IS NULL OR t.username = :username):
     *     Optional filter: nếu username = null → bỏ qua (teacher search tất cả course
     *     của mọi người), nếu có username → chỉ lấy course của teacher đó.
     *     Giúp dùng chung query cho cả Admin (xem tất cả) và Teacher (xem của mình).
     *
     *   (:status IS NULL OR c.status = :status):
     *     Optional filter theo trạng thái: null = mọi trạng thái, có giá trị = lọc cụ thể.
     *
     *   (:keyword IS NULL OR LOWER(c.title) LIKE ...):
     *     Tìm full-text không phân biệt hoa/thường trên 4 field:
     *       - c.title: Tên khóa học
     *       - c.description: Mô tả khóa học
     *       - t.fullName: Tên đầy đủ của giáo viên
     *       - t.username: Username của giáo viên
     *     LOWER() + LIKE '%keyword%' cho phép tìm kiếm linh hoạt, không phân biệt
     *     chữ hoa/thường, và tìm ở bất kỳ vị trí trong chuỗi.
     *
     *   (:levelId IS NULL OR l.levelId = :levelId):
     *     Optional filter theo cấp độ: null = mọi cấp độ, có giá trị = lọc cụ thể.
     *
     *   ORDER BY c.createdAt DESC:
     *     Sắp xếp khóa học mới tạo lên đầu — phục vụ UX hiển thị nội dung mới.
     *
     * @Param: Ánh xạ tham số Java vào named parameter (:name) trong JPQL.
     */
    @Query("""
			    SELECT c
			    FROM Course c
			    LEFT JOIN FETCH c.teacher t
			    LEFT JOIN FETCH c.level l
			    WHERE c.status <> 'Deleted'

			      AND (:username IS NULL OR t.username = :username)

			      AND (:status IS NULL OR c.status = :status)

			      AND (
			            :keyword IS NULL
			            OR LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
			            OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
			            OR LOWER(t.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
			            OR LOWER(t.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
			      )

			      AND (:levelId IS NULL OR l.levelId = :levelId)

			    ORDER BY c.createdAt DESC
			""")
    List<Course> searchCourses(@Param("username") String username, @Param("status") String status,
            @Param("keyword") String keyword, @Param("levelId") Long levelId);

    /**
     * findByTeacher_UserIdAndStatusNot — Lấy danh sách khóa học của một giáo viên,
     * loại trừ những khóa có status nhất định.
     *
     * SQL tương đương:
     *   SELECT * FROM courses WHERE teacher_userId = ? AND status <> ?
     *
     * Quy tắc Query Derivation với navigation qua relationship:
     *   - "findBy" = SELECT ... WHERE
     *   - "Teacher_UserId" = navigation qua field "teacher" (User entity) → lấy "userId"
     *     (dấu _ phân tách entity liên kết và field của nó)
     *   - "And" = kết hợp thêm điều kiện
     *   - "StatusNot" = status <> ?
     *
     * Dùng khi giáo viên xem danh sách khóa học của mình (trừ những khóa đã xóa):
     *   findByTeacher_UserIdAndStatusNot(currentTeacherId, "Deleted")
     */
    List<Course> findByTeacher_UserIdAndStatusNot(Long teacherId, String status);

    /**
     * chiTietKhoaHoc — Lấy chi tiết đầy đủ của một khóa học, bao gồm các thống kê
     * tổng hợp (số bài học, số học sinh, số đề thi, đánh giá, doanh thu).
     *
     * Đây là Native Query (nativeQuery = true): Viết bằng SQL thuần (SQL Server dialect),
     * không phải JPQL. Dùng khi:
     *   1. Cần tính năng SQL đặc thù của database (ISNULL của SQL Server).
     *   2. Query phức tạp với nhiều sub-query mà JPQL không hỗ trợ tốt.
     *   3. Cần tối ưu hiệu suất với query viết tay.
     *
     * Phân tích SQL:
     *
     *   LEFT JOIN levels, users: Lấy thông tin cấp độ và thông tin giáo viên.
     *
     *   Sub-query lessonStats (COUNT bài học):
     *     Đếm số bài học chưa xóa của mỗi khóa học.
     *     WHERE status <> 'Deleted': Loại bỏ bài học đã xóa mềm.
     *
     *   Sub-query enrollmentStats (COUNT học sinh):
     *     Đếm số học sinh đã đăng ký và có quyền truy cập (hascourseaccess = 1).
     *     hascourseaccess = 1: Phân biệt học sinh đã thanh toán (có access)
     *     với học sinh chỉ xem preview (chưa có access).
     *
     *   Sub-query examStats (COUNT đề thi):
     *     Đếm số đề thi chưa xóa của khóa học.
     *
     *   Sub-query reviewStats (AVG đánh giá):
     *     Tính điểm đánh giá trung bình từ bảng course_reviews.
     *     AVG(CAST(rating AS FLOAT)): Ép kiểu rating sang FLOAT để tính trung bình
     *     chính xác (tránh integer division).
     *
     *   Sub-query revenueStats (SUM doanh thu):
     *     Tổng doanh thu từ bảng transactions, chỉ tính giao dịch trạng thái 'Paid'.
     *     targetId: ID của khóa học được thanh toán cho.
     *
     *   ISNULL(value, 0): Hàm SQL Server, trả về 0 nếu giá trị là NULL.
     *     Đảm bảo kết quả luôn là số, không phải null — tránh NPE phía Java.
     *
     * Trả về List<Object[]>:
     *   Native query không map vào entity → trả về mảng các Object.
     *   Service layer sẽ cast từng phần tử về đúng kiểu dữ liệu.
     *   Mỗi Object[] là một row kết quả, các index tương ứng với thứ tự SELECT.
     */
    @Query(value = """
            SELECT
                c.courseid AS courseId,
                c.title AS title,
                c.description AS description,
                c.thumbnailurl AS thumbnailUrl,

                l.levelname AS levelName,

                c.coursetype AS accessType,
                c.price AS price,
                c.examprice AS practicePrice,
                c.status AS status,

                ISNULL(lessonStats.lessonCount, 0) AS lessonCount,
                ISNULL(enrollmentStats.studentCount, 0) AS studentCount,
                ISNULL(examStats.examCount, 0) AS examCount,
                ISNULL(reviewStats.rating, 0) AS rating,
                ISNULL(revenueStats.revenue, 0) AS revenue,

                c.createdat AS createdAt,
                c.updatedat AS updatedAt,
                c.submittedat AS submittedAt,
                c.reviewedat AS approvedAt,
                c.rejectreason AS rejectReason,

                u.fullname AS teacherName,
                l.levelId AS levelId

            FROM courses c

            LEFT JOIN levels l
                ON c.levelid = l.levelid

            LEFT JOIN users u
                ON c.teacherid = u.userid

            LEFT JOIN (
                SELECT
                    courseid,
                    COUNT(*) AS lessonCount
                FROM lessons
                WHERE status <> 'Deleted'
                GROUP BY courseid
            ) lessonStats
                ON c.courseid = lessonStats.courseid

            LEFT JOIN (
                SELECT
                    courseid,
                    COUNT(*) AS studentCount
                FROM enrollments
                WHERE hascourseaccess = 1
                GROUP BY courseid
            ) enrollmentStats
                ON c.courseid = enrollmentStats.courseid

            LEFT JOIN (
                SELECT
                    courseid,
                    COUNT(*) AS examCount
                FROM exams
                WHERE status <> 'Deleted'
                GROUP BY courseid
            ) examStats
                ON c.courseid = examStats.courseid

            LEFT JOIN (
                SELECT
                    courseid,
                    AVG(CAST(rating AS FLOAT)) AS rating
                FROM course_reviews
                GROUP BY courseid
            ) reviewStats
                ON c.courseid = reviewStats.courseid

            LEFT JOIN (
                SELECT
                    targetId,
                    SUM(amount) AS revenue
                FROM transactions
                WHERE status = 'Paid'
                  AND targetId IS NOT NULL
                GROUP BY targetId
            ) revenueStats
                ON c.courseid = revenueStats.targetId

            WHERE c.courseid = :courseId
              AND c.status <> 'Deleted'
            """, nativeQuery = true)
    List<Object[]> chiTietKhoaHoc(@Param("courseId") Long courseId);

    /**
     * findCourseOfTeacher — Tìm khóa học theo ID, xác minh khóa học thuộc về giáo viên cụ thể.
     *
     * JPQL với JOIN FETCH để tải eager cả teacher và kiểm tra ownership trong cùng 1 query.
     *
     * Điều kiện:
     *   - c.courseId = :courseId: Tìm đúng khóa học theo ID.
     *   - t.username = :username: Xác minh giáo viên đang request là chủ khóa học.
     *     (Authorization check — tránh giáo viên A xem/sửa khóa học của giáo viên B)
     *   - c.status <> 'Deleted': Bỏ qua khóa học đã xóa mềm.
     *
     * JOIN FETCH (không phải LEFT JOIN FETCH): Khóa học phải có teacher — nếu không
     * có teacher thì khóa học này không hợp lệ, không trả về kết quả.
     *
     * Dùng trong: Teacher xem/chỉnh sửa khóa học của mình — đảm bảo chỉ thấy
     * khóa học họ sở hữu.
     */
    @Query("""
			    SELECT c
			    FROM Course c
			    JOIN FETCH c.teacher t
			    WHERE c.courseId = :courseId
			      AND t.username = :username
			      AND c.status <> 'Deleted'
			""")
    Optional<Course> findCourseOfTeacher(@Param("courseId") Long courseId, @Param("username") String username);

    /**
     * findCourseForAdminReview — Tìm khóa học cho admin kiểm duyệt.
     *
     * Giống findCourseOfTeacher nhưng KHÔNG có điều kiện username:
     *   Admin có thể xem bất kỳ khóa học nào, không bị giới hạn theo chủ sở hữu.
     *
     * LEFT JOIN FETCH: Đảm bảo load đầy đủ thông tin teacher và level để admin
     * có thể xem toàn bộ thông tin khi kiểm duyệt.
     *
     * Chỉ loại bỏ khóa học đã xóa mềm (status <> 'Deleted'), cho phép xem
     * cả khóa học Pending, Draft, Rejected.
     *
     * Dùng trong: Admin xem chi tiết khóa học trước khi duyệt hoặc từ chối.
     */
    @Query("""
			    SELECT c
			    FROM Course c
			    LEFT JOIN FETCH c.teacher t
			    LEFT JOIN FETCH c.level l
			    WHERE c.courseId = :courseId
			      AND c.status <> 'Deleted'
			""")
    Optional<Course> findCourseForAdminReview(@Param("courseId") Long courseId);

    /**
     * findPublishedCourseDetail — Tìm chi tiết khóa học đã được published.
     *
     * Điều kiện: c.status = 'Published' (chỉ khóa học đã được admin duyệt).
     * Khác với findCourseForAdminReview: chỉ trả về khóa học đang hoạt động.
     *
     * Dùng trong: Student xem chi tiết khóa học trước khi đăng ký mua.
     * Đảm bảo student chỉ thấy khóa học đã được phê duyệt, không thấy draft/pending.
     */
    @Query("""
			    SELECT c
			    FROM Course c
			    LEFT JOIN FETCH c.teacher t
			    LEFT JOIN FETCH c.level l
			    WHERE c.courseId = :courseId
			      AND c.status = 'Published'
			""")
    Optional<Course> findPublishedCourseDetail(@Param("courseId") Long courseId);

    /**
     * countPublishedCourseByTeacher — Đếm số khóa học đã published của một giáo viên.
     *
     * JPQL:
     *   SELECT COUNT(c) FROM Course c
     *   WHERE c.teacher.userId = :teacherId AND c.status = 'Published'
     *
     *   COUNT(c): Đếm số lượng Course entity (không phải COUNT(*) — đây là JPQL).
     *   c.teacher.userId: Navigation qua quan hệ @ManyToOne từ Course sang User,
     *   lấy field userId của teacher.
     *
     * Dùng trong: Hiển thị thống kê số khóa học đang hoạt động của giáo viên
     * trên trang hồ sơ giáo viên hoặc Admin Dashboard.
     */
    @Query("""
			    SELECT COUNT(c)
			    FROM Course c
			    WHERE c.teacher.userId = :teacherId
			      AND c.status = 'Published'
			""")
    Long countPublishedCourseByTeacher(@Param("teacherId") Long teacherId);

    /**
     * findByCourseIdAndStatus — Tìm khóa học theo ID và status cụ thể.
     *
     * SQL tương đương: SELECT * FROM courses WHERE courseId = ? AND status = ?
     *
     * Quy tắc Query Derivation:
     *   - "findBy" = SELECT ... WHERE
     *   - "CourseId" = điều kiện theo PK
     *   - "And" = AND trong SQL
     *   - "Status" = điều kiện theo status
     *
     * Dùng trong: Kiểm tra xem khóa học có tồn tại VÀ đang ở trạng thái cụ thể không.
     * Ví dụ: findByCourseIdAndStatus(id, "Published") → tìm khóa học đã duyệt.
     */
    Optional<Course> findByCourseIdAndStatus(Long courseId, String status);

    /**
     * countByStatus — Đếm số khóa học theo trạng thái.
     *
     * SQL tương đương: SELECT COUNT(*) FROM courses WHERE status = ?
     *
     * Quy tắc: "countBy" + "Status" = COUNT(*) WHERE status = ?
     *
     * Dùng trong Admin Dashboard để hiển thị thống kê nhanh:
     *   - countByStatus("Pending") → số khóa học chờ duyệt.
     *   - countByStatus("Published") → số khóa học đang hoạt động.
     *   - countByStatus("Rejected") → số khóa học bị từ chối.
     */
    long countByStatus(String status);

    /**
     * findByStatusOrderByCreatedAtDesc — Lấy danh sách khóa học theo status,
     * sắp xếp mới nhất lên đầu.
     *
     * SQL tương đương:
     *   SELECT * FROM courses WHERE status = ? ORDER BY createdAt DESC
     *
     * Quy tắc kết hợp filter và sort:
     *   - "findBy" = SELECT ... WHERE
     *   - "Status" = lọc theo status
     *   - "OrderBy" = ORDER BY
     *   - "CreatedAt" = field sắp xếp
     *   - "Desc" = DESC (mới nhất trước)
     *
     * Dùng trong Admin Panel:
     *   findByStatusOrderByCreatedAtDesc("Pending"): Danh sách chờ duyệt, mới nhất trước.
     */
    List<Course> findByStatusOrderByCreatedAtDesc(String status);

    /**
     * findAllByOrderByCreatedAtDesc — Lấy tất cả khóa học, mới nhất lên đầu.
     *
     * SQL tương đương: SELECT * FROM courses ORDER BY createdAt DESC
     *
     * Quy tắc: "findAllBy" (không có WHERE) + "OrderByCreatedAtDesc" (ORDER BY).
     *
     * Dùng trong: Admin xem toàn bộ danh sách khóa học của hệ thống, bao gồm
     * mọi trạng thái (Draft, Pending, Published, Rejected) — trừ "Deleted"
     * nên dùng thêm filter ở Service layer nếu cần.
     */
    List<Course> findAllByOrderByCreatedAtDesc();
}
