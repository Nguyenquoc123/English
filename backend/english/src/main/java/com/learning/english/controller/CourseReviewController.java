package com.learning.english.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learning.english.dto.request.CourseReviewRequest;

import com.learning.english.dto.response.CourseReviewResponse;
import com.learning.english.service.CourseReviewService;

@RequestMapping("/danh-gia")
@RestController
public class CourseReviewController {
	@Autowired
	CourseReviewService courseReviewService;

	@GetMapping("/ds-danh-gia/{courseId}")
	ResponseEntity<List<CourseReviewResponse>> dsDanhGia(@PathVariable Long courseId) {
		return ResponseEntity.ok(courseReviewService.layDanhGiaKhoaHoc(courseId));
	}

	@PostMapping("/them-danh-gia/{courseId}")
	public ResponseEntity<CourseReviewResponse> themDanhGia(@PathVariable Long courseId,
			@RequestBody CourseReviewRequest request) {
		return ResponseEntity.ok(courseReviewService.taoDanhGia(courseId, request));
	}
	
	@PutMapping("/sua-danh-gia/{courseId}/{courseReviewId}")
	public ResponseEntity<CourseReviewResponse> chinhSuaDanhGia(@PathVariable Long courseId, @PathVariable Long courseReviewId,
			@RequestBody CourseReviewRequest request) {
		return ResponseEntity.ok(courseReviewService.updateDanhGia(courseId, courseReviewId, request));
	}
}
