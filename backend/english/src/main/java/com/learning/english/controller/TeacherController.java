package com.learning.english.controller;

import com.learning.english.dto.request.WithdrawalCreateRequest;
import com.learning.english.dto.response.TeacherDashboardResponse;
import com.learning.english.dto.response.TeacherWithdrawalSummaryResponse;
import com.learning.english.dto.response.WithdrawalResponse;
import com.learning.english.service.TeacherDashboardService;
import com.learning.english.service.WithdrawalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teacher")
public class TeacherController {

    @Autowired
    TeacherDashboardService teacherDashboardService;

    @Autowired
    WithdrawalService withdrawalService;

//    @GetMapping("/dashboard")
//    public ResponseEntity<TeacherDashboardResponse> getDashboard() {
//        return ResponseEntity.ok(teacherDashboardService.getDashboard());
//    }

    @GetMapping("/withdrawals/summary")
    public ResponseEntity<TeacherWithdrawalSummaryResponse> getWithdrawalSummary() {
        return ResponseEntity.ok(withdrawalService.getMySummary());
    }

    @GetMapping("/withdrawals")
    public ResponseEntity<List<WithdrawalResponse>> getMyWithdrawals() {
        return ResponseEntity.ok(withdrawalService.getMyWithdrawals());
    }

    @PostMapping("/withdrawals")
    public ResponseEntity<WithdrawalResponse> createWithdrawal(
            @RequestBody WithdrawalCreateRequest request
    ) {
        return ResponseEntity.ok(withdrawalService.createWithdrawal(request));
    }
}
