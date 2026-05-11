package com.learning.english.controller;

import com.learning.english.dto.request.TeacherDuyetRequest;
import com.learning.english.dto.request.TeacherRegisterRequest;
import com.learning.english.dto.response.TeacherProfileResponse;
import com.learning.english.service.TeacherProfileService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/teacher-profile")

public class TeacherProfileController {

	@Autowired
	TeacherProfileService teacherProfileService;

	@PostMapping(value = "/register")
	public ResponseEntity<TeacherProfileResponse> dangKyLamGiaoVien(@RequestPart("data") TeacherRegisterRequest request,
			@RequestPart(value = "certificateFiles", required = false) List<MultipartFile> certificateFiles)
			throws IOException {

		return ResponseEntity.ok(teacherProfileService.dangKyLamGiaoVien(request, certificateFiles));
	}
	
	@GetMapping("/profile-register")
	public ResponseEntity<TeacherProfileResponse> getProfileTeacher() {
		return ResponseEntity.ok(teacherProfileService.getProfileDangKy());
	}
	
	@GetMapping("/profile-registered")
	public ResponseEntity<Boolean> checkProfileTeacher() {
		return ResponseEntity.ok(teacherProfileService.daDangKyLamGiaoVien());
	}

	@PutMapping("/{teacherProfileId}/approve")
	public ResponseEntity<TeacherProfileResponse> duyetDangKyLamGiaoVien(@PathVariable Long teacherProfileId,
			@RequestBody TeacherDuyetRequest request) {
		return ResponseEntity.ok(teacherProfileService.duyetDangKyLamGiaoVien(teacherProfileId,
				request.getApprovalStatus(), request.getRejectReason()));
	}
}