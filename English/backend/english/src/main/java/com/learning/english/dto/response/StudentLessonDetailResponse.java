package com.learning.english.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * StudentLessonDetailResponse — DTO chi tiết bài học dành cho học viên.
 *
 * Trả về khi student gọi GET /lesson/{lessonId}/student-detail.
 * Yêu cầu: học viên phải đã đăng ký (có hasCourseAccess=true) hoặc khóa học miễn phí.
 * Nếu không có quyền truy cập → LessonService ném RuntimeException trước khi map DTO này.
 *
 * Cấu trúc tương tự TeacherLessonDetailResponse — bao gồm toàn bộ nội dung bài học:
 *   videos, vocabularies, grammars, questions để frontend render trang học.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentLessonDetailResponse {

    /** ID của bài học */
    private Long lessonId;

    /** ID khóa học chứa bài học này — map từ lesson.course.courseId */
    private Long courseId;

    /** Tên khóa học — map từ lesson.course.title */
    private String courseTitle;

    /** Tiêu đề bài học */
    private String title;

    /** Mô tả bài học */
    private String description;

    /** Thứ tự bài học trong khóa học */
    private Integer lessonOrder;

    /** Trạng thái bài học (chỉ PUBLISHED mới được student xem qua LessonService) */
    private String status;

    /** Thời gian tạo bài học */
    private LocalDateTime createdAt;

    /** Thời gian cập nhật gần nhất */
    private LocalDateTime updatedAt;

    /** Danh sách video của bài học */
    private List<LessonVideoResponse> videos;

    /** Danh sách từ vựng của bài học */
    private List<LessonVocabularyResponse> vocabularies;

    /** Danh sách bài ngữ pháp của bài học */
    private List<LessonGrammarResponse> grammars;

    /** Danh sách câu hỏi trắc nghiệm của bài học */
    private List<LessonQuestionResponse> questions;
}
