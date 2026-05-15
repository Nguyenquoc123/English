package com.learning.english.repository;

import com.learning.english.entity.CourseReview;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseReviewRepository extends JpaRepository<CourseReview, Long> {

    /**
     * findAllByOrderByCreatedAtDesc — Lấy TẤT CẢ đánh giá trong hệ thống, sắp xếp mới nhất lên đầu.
     *
     * Dùng trong: Admin endpoint GET /admin/reviews
     * Admin cần xem toàn bộ đánh giá từ học viên để kiểm duyệt nội dung (ADM-11).
     *
     * Spring Data JPA query derivation:
     *   - findAll         = SELECT * FROM course_reviews (không WHERE)
     *   - By              = (bỏ qua — không có điều kiện lọc)
     *   - OrderByCreatedAtDesc = ORDER BY created_at DESC (mới nhất lên đầu)
     *
     * Lưu ý: Không có JOIN FETCH ở đây — nếu cần user/course data,
     * service sẽ access lazy-loaded fields (sẽ trigger thêm query).
     * Với số lượng đánh giá vừa phải, đây là cách đơn giản và đủ dùng cho admin.
     *
     * @return Danh sách tất cả CourseReview, sắp xếp theo createdAt giảm dần
     */
    List<CourseReview> findAllByOrderByCreatedAtDesc();

    @Query("""
        SELECT r
        FROM CourseReview r
        JOIN FETCH r.user u
        WHERE r.course.courseId = :courseId
        ORDER BY r.createdAt DESC
    """)
    List<CourseReview> findReviewsByCourseId(
            @Param("courseId") Long courseId
    );

    Optional<CourseReview> findByCourseCourseIdAndUserUserId(
            Long courseId,
            Long userId
    );

    @Query("""
        SELECT COALESCE(AVG(r.rating), 0)
        FROM CourseReview r
        WHERE r.course.courseId = :courseId
    """)
    Double avgRatingByCourseId(
            @Param("courseId") Long courseId
    );

    @Query("""
        SELECT COUNT(r)
        FROM CourseReview r
        WHERE r.course.courseId = :courseId
    """)
    Long countReviewsByCourseId(
            @Param("courseId") Long courseId
    );
}