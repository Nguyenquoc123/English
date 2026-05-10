package com.learning.english.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.learning.english.dto.request.CourseDuyetRequest;
import com.learning.english.dto.request.CourseRejectRequest;
import com.learning.english.dto.request.CourseRequest;
import com.learning.english.dto.request.TeacherDuyetRequest;
import com.learning.english.dto.response.CourseDetailResponse;
import com.learning.english.dto.response.CoursePaymentResponse;
import com.learning.english.dto.response.CourseResponse;
import com.learning.english.dto.response.StudentCourseDetailResponse;
import com.learning.english.dto.response.TeacherProfileResponse;
import com.learning.english.service.CoursePaymentService;
import com.learning.english.service.CourseService;

import tools.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/khoa-hoc")
public class CourseController {
	@Autowired
	CourseService courseService;
	
	@Autowired
	CoursePaymentService coursePaymentService;
	
	@GetMapping("/danh-sach-khoa-hoc-public")
	public List<CourseResponse> dsKhoaHocPublic(
	        @RequestParam(required = false) String keyword,
	        @RequestParam(required = false) Long levelId
	) {
	    return courseService.dsAllKhoaHocPublic(keyword, levelId);
	}
	
	@GetMapping("/danh-sach-khoa-hoc-teacher")
	public List<CourseResponse> dsKhoaHocCuaGiaoVien(
			@RequestParam(required = false) String status,
	        @RequestParam(required = false) String keyword,
	        @RequestParam(required = false) Long levelId
	) {
	    return courseService.dsAllKhoaHocCuaTeacher(status, keyword, levelId);
	}
	
	@GetMapping("/danh-sach-khoa-hoc")
	public List<CourseResponse> dsKhoaHoc(
			@RequestParam(required = false) String status,
	        @RequestParam(required = false) String keyword,
	        @RequestParam(required = false) Long levelId
	) {
	    return courseService.dsAllKhoaHoc(status, keyword, levelId);
	}
	
	@GetMapping("/chi-tiet-khoa-hoc-teacher/{courseId}")
	public ResponseEntity<CourseDetailResponse> getCourseDetail(@PathVariable("courseId") Long courseId) {
	    return ResponseEntity.ok(courseService.getCourseDetail(courseId));
	}
	
	
	@PostMapping(
            value = "/tao-khoa-hoc",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<CourseResponse> taoKhoaHoc(
            @RequestPart("data") String data,
            @RequestPart(value = "thumbnailFile", required = false) MultipartFile thumbnailFile
    ) throws IOException {
		System.out.println("Đã chạy");
        ObjectMapper objectMapper = new ObjectMapper();

        CourseRequest request = objectMapper.readValue(data, CourseRequest.class);

        return ResponseEntity.ok(courseService.taoKhoaHoc(request, thumbnailFile));
    }
	
	
	
	@PutMapping("/{courseId}/gui-duyet")
	public CourseResponse guiDuyetKhoaHoc(
	        @PathVariable Long courseId
	) {
	    return courseService.guiDuyetKhoaHoc(courseId);
	}
	
	@PutMapping("/{courseId}/duyet")
    public CourseResponse duyetKhoaHoc(
            @PathVariable Long courseId
    ) {
        return courseService.duyetKhoaHoc(courseId);
    }

    @PutMapping("/{courseId}/tu-choi")
    public CourseResponse tuChoiKhoaHoc(
            @PathVariable Long courseId,
            @RequestBody CourseRejectRequest request
    ) {
        return courseService.tuChoiKhoaHoc(courseId, request);
    }
    
    
    @GetMapping("/chi-tiet-khoa-hoc-student/{courseId}")
	public ResponseEntity<StudentCourseDetailResponse> getCourseDetailStudent(@PathVariable("courseId") Long courseId) {
	    return ResponseEntity.ok(courseService.layChiTietKhoaHocChoHocVien(courseId));
	}
    
    
    @PostMapping("/{courseId}/tao-thanh-toan")
    public CoursePaymentResponse taoThanhToanKhoaHoc(
            @PathVariable Long courseId
    ) {
        return coursePaymentService.taoThanhToanKhoaHoc(courseId);
    }
}
