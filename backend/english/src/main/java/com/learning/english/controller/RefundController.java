package com.learning.english.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learning.english.dto.response.RefundRequestHistoryResponse;
import com.learning.english.service.RefundService;

@RestController
@RequestMapping("/refunds")
public class RefundController {
	@Autowired
	RefundService refundService;
	
	
	@GetMapping("/history")
    public ResponseEntity<List<RefundRequestHistoryResponse>> getMyRefundRequestHistory() {
        List<RefundRequestHistoryResponse> response =
        		refundService.getMyRefundRequestHistory();

        return ResponseEntity.ok(response);
    }
}
