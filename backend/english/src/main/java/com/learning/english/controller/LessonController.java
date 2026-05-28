package com.learning.english.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.learning.english.dto.request.LessonRequest;
import com.learning.english.dto.request.LessonUpdateRequest;
import com.learning.english.dto.request.ReorderCourseItemsRequest;
import com.learning.english.dto.response.CourseLessonListResponse;
import com.learning.english.dto.response.LessonListResponse;
import com.learning.english.dto.response.LessonResponse;
import com.learning.english.dto.response.StudentLessonDetailResponse;
import com.learning.english.dto.response.StudentLessonResponse;
import com.learning.english.dto.response.TeacherLessonDetailResponse;
import com.learning.english.service.CourseItemService;
import com.learning.english.service.LessonService;

@RestController
@RequestMapping("/lesson")
public class LessonController {
	@Autowired
	LessonService lessonService;

	@Autowired
	CourseItemService courseItemService;

	@GetMapping("/{courseId}/teacher")
	public List<LessonListResponse> getLessonsByCourse(@PathVariable Long courseId,
			@RequestParam(required = false) String keyword, @RequestParam(required = false) String status) {
		return lessonService.layDanhSachNoiDungKhoaHoc(courseId, keyword, status);
	}

	@PutMapping("/{courseId}/teacher/reorder")
	public Map<String, Object> reorderCourseItems(@PathVariable Long courseId,
			@RequestBody ReorderCourseItemsRequest request) {
		courseItemService.capNhatThuTuNoiDungKhoaHoc(courseId, request);

		return Map.of("success", true, "message", "Đã lưu thứ tự thành công");
	}

	@GetMapping("/{courseId}/teacher/lessons/{lessonId}")
	public TeacherLessonDetailResponse getTeacherLessonDetail(@PathVariable Long courseId,
			@PathVariable Long lessonId) {
		return lessonService.getTeacherLessonDetail(courseId, lessonId);
	}
	
	@GetMapping("/teacher/lessons/{lessonId}")
	public LessonResponse getLessonDetail(
			@PathVariable Long lessonId) {
		return lessonService.layChiTietLessonChoTeacher(lessonId);
	}

	@GetMapping("/{courseId}/admin/lessons/{lessonId}")
	public TeacherLessonDetailResponse getTeacherLessonDetailByAdmin(@PathVariable Long courseId,
			@PathVariable Long lessonId) {
		return lessonService.getTeacherLessonDetailByAdmin(courseId, lessonId);
	}

	@GetMapping("/course/{courseId}")
	public ResponseEntity<List<LessonResponse>> dsLessonCuaKhoaHoc(@PathVariable Long courseId) {
		return ResponseEntity.ok(lessonService.dsLessonCuaKhoaHoc(courseId));
	}

	@GetMapping("/course/{courseId}/status")
	public ResponseEntity<List<LessonResponse>> dsLessonCuaKhoaHoc_Status(@PathVariable Long courseId,
			@RequestParam String status) {
		return ResponseEntity.ok(lessonService.dsLessonCuaKhoaHoc_Status(courseId, status));
	}

	@PostMapping("/them-lesson")
	public ResponseEntity<LessonResponse> themLesson(@RequestBody LessonRequest request) {
		return ResponseEntity.ok(lessonService.themLesson(request));
	}

	@PutMapping("/update-lesson")
	public ResponseEntity<LessonResponse> updateLesson(@RequestBody LessonUpdateRequest request) {
		return ResponseEntity.ok(lessonService.updateLesson(request));
	}

	@GetMapping("/all-lesson/{courseId}")
	public List<StudentLessonResponse> layDanhSachBaiHocChoHocVien(@PathVariable Long courseId) {
		return lessonService.layNoiDungKhoaHocChoStudent(courseId);
	}

	@GetMapping("/{lessonId}/student-detail")
	public StudentLessonDetailResponse layChiTietLessonChoHocVien(@PathVariable Long lessonId) {
		return lessonService.layChiTietLessonChoHocVien(lessonId);
	}
}