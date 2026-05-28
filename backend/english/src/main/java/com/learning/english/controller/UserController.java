package com.learning.english.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.learning.english.dto.request.ChangePasswordRequest;
import com.learning.english.dto.request.StudentBankAccountRequest;
import com.learning.english.dto.request.StudentUpdateRequest;
import com.learning.english.dto.response.StudentBankAccountResponse;
import com.learning.english.dto.response.StudentProfileResponse;
import com.learning.english.service.StudentBankAccountService;
import com.learning.english.service.UserService;

@RestController
@RequestMapping("/")
public class UserController {
	@Autowired
	UserService userService;

	@Autowired
	StudentBankAccountService studentBankAccountService;
	
	@GetMapping("/hosocanhan")
	ResponseEntity<StudentProfileResponse> getHoSoCaNhan(){
		return ResponseEntity.ok(userService.getHoSoCaNhan());
	}
	
	@PutMapping(value = "/hosocanhan", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<StudentProfileResponse> capNhatHoSoCaNhan(
	        @RequestPart("data") StudentUpdateRequest request,
	        @RequestPart(value = "avatarFile", required = false) MultipartFile avatarFile
	) throws IOException {
	    return ResponseEntity.ok(userService.updateHoSoCaNhan(request, avatarFile));
	}
	
	
	@PutMapping("/doi-mat-khau")
	public String doiMatKhau(@RequestBody ChangePasswordRequest request) {
	    userService.doiMatKhau(request);
	    return "Đổi mật khẩu thành công";
	}

	@GetMapping("/hosocanhan/bank-accounts")
	public ResponseEntity<List<StudentBankAccountResponse>> listMyBankAccounts() {
		return ResponseEntity.ok(studentBankAccountService.listMyAccounts());
	}

	@PostMapping("/hosocanhan/bank-accounts")
	public ResponseEntity<StudentBankAccountResponse> createBankAccount(
			@RequestBody StudentBankAccountRequest request
	) {
		return ResponseEntity.ok(studentBankAccountService.createAccount(request));
	}

	@PutMapping("/hosocanhan/bank-accounts/{accountId}")
	public ResponseEntity<StudentBankAccountResponse> updateBankAccount(
			@PathVariable Long accountId,
			@RequestBody StudentBankAccountRequest request
	) {
		return ResponseEntity.ok(studentBankAccountService.updateAccount(accountId, request));
	}

	@PatchMapping("/hosocanhan/bank-accounts/{accountId}/default")
	public ResponseEntity<Void> setDefaultBankAccount(@PathVariable Long accountId) {
		studentBankAccountService.setDefaultAccount(accountId);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/hosocanhan/bank-accounts/{accountId}")
	public ResponseEntity<Void> deleteBankAccount(@PathVariable Long accountId) {
		studentBankAccountService.deleteAccount(accountId);
		return ResponseEntity.ok().build();
	}
}
