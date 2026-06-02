package com.learning.english.controller;


import com.learning.english.dto.request.WithdrawalCreateRequest;
import com.learning.english.dto.response.TeacherWithdrawalResponse;
import com.learning.english.dto.response.WithdrawalResponse;
import com.learning.english.service.WithdrawalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/withdraw")
public class WithdrawalController {

    private final WithdrawalService withdrawalService;

    @PostMapping("/create")
    public WithdrawalResponse createWithdrawal(
            @RequestBody WithdrawalCreateRequest request
    ) {
        return withdrawalService.createWithdrawal(request);
    }
    
    @PutMapping("/approve")
    public WithdrawalResponse duyetWithdrawal(
            @RequestParam(name = "withdrawnId") Long withdrawnId
    ) {
        return withdrawalService.duyetWithdrawn(withdrawnId);
    }
}