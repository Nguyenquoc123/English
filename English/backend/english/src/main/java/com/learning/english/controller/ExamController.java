package com.learning.english.controller;

import com.learning.english.dto.request.ExamCreateRequest;
import com.learning.english.dto.response.ExamListResponse;
import com.learning.english.dto.response.ExamResponse;
import com.learning.english.dto.response.StudentExamListResponse;
import com.learning.english.service.ExamService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/exams")
public class ExamController {

	@Autowired
	private ExamService examService;

	@GetMapping("/all-bai-thi-teacher")
	public ResponseEntity<List<ExamListResponse>> layDanhSachBaiThiByTeacher(
			@RequestParam(name = "keyword", required = false) String keyword,
			@RequestParam(name = "status", required = false) String status,
			@RequestParam(name = "courseId", required = false) Long courseId) {
		return ResponseEntity.ok(examService.layDanhSachBaiThiByTeacher(courseId, keyword, status));
	}

	@GetMapping("/all-bai-thi")
	public ResponseEntity<List<StudentExamListResponse>> layDanhSachBaiThiChoHocVien(@RequestParam(required = false) String keyword,
			@RequestParam(required = false) String status, @RequestParam(required = false) Long courseId) {
		return ResponseEntity.ok(examService.layDanhSachBaiThiChoHocVien(courseId, keyword, status));
	}

	@PostMapping("/create")
	public ResponseEntity<ExamResponse> taoBaiThi(@RequestBody ExamCreateRequest request) {
		return ResponseEntity.ok(examService.taoBaiThi(request));
	}
}