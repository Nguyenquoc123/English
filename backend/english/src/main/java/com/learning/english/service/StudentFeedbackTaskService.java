package com.learning.english.service;

import com.learning.english.dto.request.StudentFeedbackTaskCreateRequest;
import com.learning.english.dto.request.StudentFeedbackTaskReviewRequest;
import com.learning.english.dto.response.StudentFeedbackTaskResponse;
import com.learning.english.entity.StudentFeedbackTask;
import com.learning.english.entity.User;
import com.learning.english.repository.StudentFeedbackTaskRepository;
import com.learning.english.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class StudentFeedbackTaskService {

    @Autowired
    private StudentFeedbackTaskRepository studentFeedbackTaskRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public StudentFeedbackTaskResponse createFeedback(StudentFeedbackTaskCreateRequest request, String username) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new RuntimeException("Vui lòng nhập tiêu đề feedback");
        }
        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new RuntimeException("Vui lòng nhập nội dung feedback");
        }

        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        LocalDateTime now = LocalDateTime.now();
        StudentFeedbackTask task = StudentFeedbackTask.builder()
                .student(student)
                .title(request.getTitle().trim())
                .content(request.getContent().trim())
                .status("OPEN")
                .createdAt(now)
                .updatedAt(now)
                .build();

        return toResponse(studentFeedbackTaskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public List<StudentFeedbackTaskResponse> getFeedbackTasksForAdmin(String status) {
        if (status == null || status.isBlank()) {
            return studentFeedbackTaskRepository.findAllByOrderByCreatedAtDesc()
                    .stream()
                    .map(this::toResponse)
                    .toList();
        }
        return studentFeedbackTaskRepository.findByStatusOrderByCreatedAtDesc(status.trim().toUpperCase(Locale.ROOT))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public StudentFeedbackTaskResponse reviewFeedbackTask(
            Long feedbackTaskId,
            StudentFeedbackTaskReviewRequest request,
            String adminUsername
    ) {
        StudentFeedbackTask task = studentFeedbackTaskRepository.findById(feedbackTaskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy feedback"));
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy admin"));

        String status = request.getStatus() == null ? "IN_PROGRESS" : request.getStatus().trim().toUpperCase(Locale.ROOT);
        if (!List.of("OPEN", "IN_PROGRESS", "RESOLVED").contains(status)) {
            throw new RuntimeException("Trạng thái không hợp lệ");
        }

        task.setStatus(status);
        task.setAdminNote(request.getAdminNote() != null ? request.getAdminNote().trim() : null);
        task.setReviewedBy(admin);
        task.setReviewedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        return toResponse(studentFeedbackTaskRepository.save(task));
    }

    private StudentFeedbackTaskResponse toResponse(StudentFeedbackTask task) {
        User student = task.getStudent();
        return StudentFeedbackTaskResponse.builder()
                .feedbackTaskId(task.getFeedbackTaskId())
                .studentId(student != null ? student.getUserId() : null)
                .studentUsername(student != null ? student.getUsername() : null)
                .studentFullName(student != null ? student.getFullName() : null)
                .title(task.getTitle())
                .content(task.getContent())
                .status(task.getStatus())
                .adminNote(task.getAdminNote())
                .reviewedByUsername(task.getReviewedBy() != null ? task.getReviewedBy().getUsername() : null)
                .reviewedAt(task.getReviewedAt())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
