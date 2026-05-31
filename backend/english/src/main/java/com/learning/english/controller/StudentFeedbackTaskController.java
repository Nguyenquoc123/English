package com.learning.english.controller;

import com.learning.english.dto.request.StudentFeedbackTaskCreateRequest;
import com.learning.english.dto.request.StudentFeedbackTaskReviewRequest;
import com.learning.english.dto.response.StudentFeedbackTaskResponse;
import com.learning.english.service.StudentFeedbackTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class StudentFeedbackTaskController {

    @Autowired
    private StudentFeedbackTaskService studentFeedbackTaskService;

    @PostMapping("/student-feedbacks")
    public ResponseEntity<StudentFeedbackTaskResponse> createFeedback(
            @RequestBody StudentFeedbackTaskCreateRequest request
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(studentFeedbackTaskService.createFeedback(request, auth.getName()));
    }

    @GetMapping("/admin/student-feedbacks")
    public ResponseEntity<List<StudentFeedbackTaskResponse>> getAllFeedbacks(
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(studentFeedbackTaskService.getFeedbackTasksForAdmin(status));
    }

    @PutMapping("/admin/student-feedbacks/{feedbackTaskId}/review")
    public ResponseEntity<StudentFeedbackTaskResponse> reviewFeedback(
            @PathVariable Long feedbackTaskId,
            @RequestBody StudentFeedbackTaskReviewRequest request
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(studentFeedbackTaskService.reviewFeedbackTask(feedbackTaskId, request, auth.getName()));
    }
}
