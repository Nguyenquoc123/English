package com.learning.english.controller;

import com.learning.english.dto.request.StudentBankAccountRequest;
import com.learning.english.dto.response.TeacherBankAccountResponse;
import com.learning.english.service.TeacherBankAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bank-account")
public class TeacherBankAccountController {

    @Autowired
    TeacherBankAccountService teacherBankAccountService;

    @GetMapping
    public ResponseEntity<List<TeacherBankAccountResponse>> listMyBankAccounts() {
        return ResponseEntity.ok(teacherBankAccountService.listMyAccounts());
    }

    @PostMapping
    public ResponseEntity<TeacherBankAccountResponse> createBankAccount(
            @RequestBody StudentBankAccountRequest request
    ) {
        return ResponseEntity.ok(teacherBankAccountService.createAccount(request));
    }

    @PutMapping("/{accountId}")
    public ResponseEntity<TeacherBankAccountResponse> updateBankAccount(
            @PathVariable Long accountId,
            @RequestBody StudentBankAccountRequest request
    ) {
        return ResponseEntity.ok(teacherBankAccountService.updateAccount(accountId, request));
    }

    @PatchMapping("/{accountId}/default")
    public ResponseEntity<Void> setDefaultBankAccount(@PathVariable Long accountId) {
        teacherBankAccountService.setDefaultAccount(accountId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{accountId}")
    public ResponseEntity<Void> deleteBankAccount(@PathVariable Long accountId) {
        teacherBankAccountService.deleteAccount(accountId);
        return ResponseEntity.ok().build();
    }
}
