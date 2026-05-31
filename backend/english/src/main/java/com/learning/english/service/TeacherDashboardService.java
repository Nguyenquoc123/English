package com.learning.english.service;

import com.learning.english.dto.response.CourseResponse;
import com.learning.english.dto.response.TeacherDashboardResponse;
import com.learning.english.dto.response.TeacherEarningItemResponse;
import com.learning.english.entity.Course;
import com.learning.english.entity.TeacherEarning;
import com.learning.english.entity.User;
import com.learning.english.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TeacherDashboardService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    CourseRepository courseRepository;

    @Autowired
    EnrollmentRepository enrollmentRepository;

    @Autowired
    QuestionRepository questionRepository;

    @Autowired
    TeacherEarningRepository teacherEarningRepository;

    @Autowired
    WithdrawalRepository withdrawalRepository;

    @Autowired
    LessonRepository lessonRepository;

    @Autowired
    ExamRepository examRepository;

    @Autowired
    CourseReviewRepository courseReviewRepository;

    @Transactional(readOnly = true)
    public TeacherDashboardResponse getDashboard() {
        User teacher = getCurrentUser();
        Long teacherId = teacher.getUserId();

        long totalCourses = courseRepository.countByTeacher_UserId(teacherId);
        long publishedCourses = courseRepository.countByTeacher_UserIdAndStatus(teacherId, "Published");
        long pendingCourses = courseRepository.countByTeacher_UserIdAndStatus(teacherId, "Pending");
        long rejectedCourses = courseRepository.countByTeacher_UserIdAndStatus(teacherId, "Rejected");
        long totalStudents = enrollmentRepository.countStudentsByTeacherId(teacherId);
        long totalQuestions = questionRepository.countByCreatedBy_UserIdAndStatusNot(teacherId, "Deleted");
        long totalLessons = lessonRepository.countLessonsByTeacherId(teacherId);
        long totalExams = examRepository.countExamsByTeacherId(teacherId);
        long totalReviews = courseReviewRepository.countReviewsByTeacherId(teacherId);
        double averageRating = courseReviewRepository.getAverageRatingByTeacherId(teacherId);
        long pendingWithdrawals = withdrawalRepository.countByTeacher_UserIdAndStatus(teacherId, "PENDING");

        BigDecimal totalRevenue = teacherEarningRepository.sumTotalRevenueByTeacherId(teacherId);
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        BigDecimal availableGross = teacherEarningRepository.sumAvailableRevenueByTeacherId(teacherId);
        if (availableGross == null) {
            availableGross = BigDecimal.ZERO;
        }

        BigDecimal pendingAmount = withdrawalRepository.sumPendingAmountByTeacherId(teacherId);
        if (pendingAmount == null) {
            pendingAmount = BigDecimal.ZERO;
        }

        BigDecimal availableRevenue = availableGross.subtract(pendingAmount);
        if (availableRevenue.compareTo(BigDecimal.ZERO) < 0) {
            availableRevenue = BigDecimal.ZERO;
        }

        List<CourseResponse> recentCourses = courseRepository
                .findRecentCoursesByTeacherId(teacherId, PageRequest.of(0, 5))
                .stream()
                .map(this::toCourseResponse)
                .toList();

        List<TeacherEarningItemResponse> recentEarnings = teacherEarningRepository
                .findRecentEarningsByTeacherId(teacherId, PageRequest.of(0, 5))
                .stream()
                .map(this::toEarningResponse)
                .toList();

        return TeacherDashboardResponse.builder()
                .totalCourses(totalCourses)
                .publishedCourses(publishedCourses)
                .totalStudents(totalStudents)
                .totalQuestions(totalQuestions)
                .totalRevenue(totalRevenue)
                .availableRevenue(availableRevenue)
                .pendingCourses(pendingCourses)
                .rejectedCourses(rejectedCourses)
                .pendingWithdrawals(pendingWithdrawals)
                .totalLessons(totalLessons)
                .totalExams(totalExams)
                .totalReviews(totalReviews)
                .averageRating(averageRating)
                .recentCourses(recentCourses)
                .recentEarnings(recentEarnings)
                .build();
    }

    private CourseResponse toCourseResponse(Course course) {
        return CourseResponse.builder()
                .courseId(course.getCourseId())
                .title(course.getTitle())
                .thumbnailUrl(course.getThumbnailUrl())
                .courseType(course.getCourseType())
                .price(course.getPrice())
                .status(course.getStatus())
                .levelName(course.getLevel() != null ? course.getLevel().getLevelName() : null)
                .createdAt(course.getCreatedAt())
                .build();
    }

    private TeacherEarningItemResponse toEarningResponse(TeacherEarning earning) {
        return TeacherEarningItemResponse.builder()
                .earningId(earning.getEarningId())
                .courseTitle(earning.getCourse() != null ? earning.getCourse().getTitle() : null)
                .netAmount(earning.getNetAmount())
                .status(earning.getStatus())
                .createdAt(earning.getCreatedAt())
                .build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new RuntimeException("Người dùng chưa đăng nhập");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }
}
