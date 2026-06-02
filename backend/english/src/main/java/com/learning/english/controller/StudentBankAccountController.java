package com.learning.english.controller;

import com.learning.english.dto.request.StudentBankAccountRequest;
import com.learning.english.dto.response.StudentBankAccountResponse;
import com.learning.english.service.StudentBankAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student-bank-account")
public class StudentBankAccountController {

    @Autowired
    StudentBankAccountService studentBankAccountService;

    @GetMapping
    public ResponseEntity<List<StudentBankAccountResponse>> listMyAccounts() {
        return ResponseEntity.ok(studentBankAccountService.listMyAccounts());
    }

    @PostMapping
    public ResponseEntity<StudentBankAccountResponse> createAccount(
            @RequestBody StudentBankAccountRequest request
    ) {
        return ResponseEntity.ok(studentBankAccountService.createAccount(request));
    }

    @PutMapping("/{accountId}")
    public ResponseEntity<StudentBankAccountResponse> updateAccount(
            @PathVariable Long accountId,
            @RequestBody StudentBankAccountRequest request
    ) {
        return ResponseEntity.ok(studentBankAccountService.updateAccount(accountId, request));
    }

    @PatchMapping("/{accountId}/default")
    public ResponseEntity<Void> setDefault(@PathVariable Long accountId) {
        studentBankAccountService.setDefaultAccount(accountId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{accountId}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long accountId) {
        studentBankAccountService.deleteAccount(accountId);
        return ResponseEntity.ok().build();
    }
}
