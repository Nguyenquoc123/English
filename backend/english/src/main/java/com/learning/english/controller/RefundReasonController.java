package com.learning.english.controller;

import com.learning.english.dto.response.RefundReasonOptionResponse;
import com.learning.english.service.RefundService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/refund-reasons")
public class RefundReasonController {

    @Autowired
    RefundService refundService;

    @GetMapping
    public ResponseEntity<List<RefundReasonOptionResponse>> listReasons() {
        return ResponseEntity.ok(refundService.listReasonOptions());
    }
}
