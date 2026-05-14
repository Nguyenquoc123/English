package com.learning.english.controller;

import com.learning.english.dto.request.UserStatusRequest;
import com.learning.english.dto.request.UserRoleRequest;
import com.learning.english.dto.request.WithdrawalReviewRequest;
import com.learning.english.dto.request.NotificationRequest;
import com.learning.english.dto.request.AdminChangePasswordRequest;
import com.learning.english.dto.request.AdminCreateUserRequest;

import com.learning.english.dto.response.*;
import com.learning.english.dto.response.TransactionAdminResponse;
import com.learning.english.dto.response.CourseReviewResponse;

import com.learning.english.service.AdminService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    AdminService adminService;

    // ==================== DASHBOARD ====================

    // GET /admin/dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    // ==================== USER MANAGEMENT ====================

    // GET /admin/users?keyword=...&roleName=...&status=...
    @GetMapping("/users")
    public ResponseEntity<List<UserAdminResponse>> getAllUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String roleName,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.getAllUsers(keyword, roleName, status));
    }

    // POST /admin/users
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody AdminCreateUserRequest request) {
        return ResponseEntity.ok(adminService.createUser(request));
    }

    // GET /admin/users/{userId}
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserDetail(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getUserDetail(userId));
    }

    // PUT /admin/users/{userId}/role
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long userId,
            @RequestBody UserRoleRequest request) {
        return ResponseEntity.ok(adminService.updateUserRole(userId, request.getRoleName()));
    }

    // PUT /admin/users/{userId}/status
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<UserAdminResponse> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody UserStatusRequest request) {
        return ResponseEntity.ok(adminService.updateUserStatus(userId, request.getStatus()));
    }

    // ==================== TEACHER APPROVAL ====================

    // GET /admin/teachers/pending
    @GetMapping("/teachers/pending")
    public ResponseEntity<List<TeacherProfileResponse>> getPendingTeachers() {
        return ResponseEntity.ok(adminService.getPendingTeachers());
    }

    // GET /admin/teachers
    @GetMapping("/teachers")
    public ResponseEntity<List<TeacherProfileResponse>> getAllTeacherProfiles() {
        return ResponseEntity.ok(adminService.getAllTeacherProfiles());
    }

    // ==================== COURSE APPROVAL ====================

    // GET /admin/courses/pending
    @GetMapping("/courses/pending")
    public ResponseEntity<List<CourseResponse>> getPendingCourses() {
        return ResponseEntity.ok(adminService.getPendingCourses());
    }

    // GET /admin/courses
    @GetMapping("/courses")
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        return ResponseEntity.ok(adminService.getAllCourses());
    }

    // ==================== WITHDRAWAL MANAGEMENT ====================

    // GET /admin/withdrawals/pending
    @GetMapping("/withdrawals/pending")
    public ResponseEntity<List<WithdrawalResponse>> getPendingWithdrawals() {
        return ResponseEntity.ok(adminService.getPendingWithdrawals());
    }

    // GET /admin/withdrawals
    @GetMapping("/withdrawals")
    public ResponseEntity<List<WithdrawalResponse>> getAllWithdrawals() {
        return ResponseEntity.ok(adminService.getAllWithdrawals());
    }

    // PUT /admin/withdrawals/{withdrawalId}/review
    @PutMapping("/withdrawals/{withdrawalId}/review")
    public ResponseEntity<WithdrawalResponse> reviewWithdrawal(
            @PathVariable Long withdrawalId,
            @RequestBody WithdrawalReviewRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return ResponseEntity.ok(adminService.reviewWithdrawalByUsername(
                withdrawalId,
                request.getStatus(),
                request.getRejectReason(),
                username
        ));
    }

    // ==================== LESSON FREE MANAGEMENT ====================

    // GET /admin/lessons/free
    @GetMapping("/lessons/free")
    public ResponseEntity<List<LessonResponse>> getFreeLessons() {
        return ResponseEntity.ok(adminService.getFreeLessons());
    }

    // POST /admin/lessons/free
    @PostMapping("/lessons/free")
    public ResponseEntity<LessonResponse> createFreeLesson(
            @RequestBody java.util.Map<String, String> body) {
        String title = body.get("title");
        String description = body.get("description");
        String status = body.get("status");
        return ResponseEntity.ok(adminService.createFreeLesson(title, description, status));
    }

    // PUT /admin/lessons/free/{lessonId}
    @PutMapping("/lessons/free/{lessonId}")
    public ResponseEntity<LessonResponse> updateFreeLesson(
            @PathVariable Long lessonId,
            @RequestBody java.util.Map<String, String> body) {
        String title = body.get("title");
        String description = body.get("description");
        String status = body.get("status");
        return ResponseEntity.ok(adminService.updateFreeLesson(lessonId, title, description, status));
    }

    // DELETE /admin/lessons/free/{lessonId}
    @DeleteMapping("/lessons/free/{lessonId}")
    public ResponseEntity<String> deleteFreeLesson(@PathVariable Long lessonId) {
        adminService.deleteFreeLesson(lessonId);
        return ResponseEntity.ok("Đã xóa bài học miễn phí");
    }

    // ==================== EXAM MANAGEMENT ====================

    // GET /admin/exams
    @GetMapping("/exams")
    public ResponseEntity<List<ExamAdminResponse>> getAllExams() {
        return ResponseEntity.ok(adminService.getAllExams());
    }

    // PUT /admin/exams/{examId}/status
    @PutMapping("/exams/{examId}/status")
    public ResponseEntity<ExamAdminResponse> updateExamStatus(
            @PathVariable Long examId,
            @RequestBody java.util.Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(adminService.updateExamStatus(examId, status));
    }

    // ==================== NOTIFICATION MANAGEMENT ====================

    // GET /admin/notifications
    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationResponse>> getAllNotifications() {
        return ResponseEntity.ok(adminService.getAllNotifications());
    }

    // POST /admin/notifications
    @PostMapping("/notifications")
    public ResponseEntity<NotificationResponse> createNotification(
            @RequestBody NotificationRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return ResponseEntity.ok(adminService.createNotification(request, username));
    }

    // ==================== TRANSACTION MANAGEMENT ====================

    // GET /admin/transactions
    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionAdminResponse>> getAllTransactions() {
        return ResponseEntity.ok(adminService.getAllTransactions());
    }

    // ==================== COURSE REVIEW MANAGEMENT ====================

    // GET /admin/reviews
    @GetMapping("/reviews")
    public ResponseEntity<List<CourseReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(adminService.getAllCourseReviews());
    }

    // DELETE /admin/reviews/{reviewId}
    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<String> deleteReview(@PathVariable Long reviewId) {
        adminService.deleteCourseReview(reviewId);
        return ResponseEntity.ok("Đã xóa đánh giá");
    }

    // ==================== CHANGE PASSWORD ====================

    // PUT /admin/change-password
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody AdminChangePasswordRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        adminService.changeAdminPassword(
                username,
                request.getOldPassword(),
                request.getNewPassword(),
                request.getConfirmPassword()
        );
        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }
}
