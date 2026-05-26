package com.learning.english.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
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
import com.learning.english.dto.request.MultiCoursePaymentRequest;
import com.learning.english.dto.request.TeacherDuyetRequest;
import com.learning.english.dto.response.CourseComboboxResponse;
import com.learning.english.dto.response.CourseDetailResponse;
import com.learning.english.dto.response.CoursePaymentResponse;
import com.learning.english.dto.response.CourseResponse;
import com.learning.english.dto.response.StudentCourseDetailResponse;
import com.learning.english.dto.response.TeacherProfileResponse;
import com.learning.english.service.CoursePaymentService;
import com.learning.english.service.CourseService;

import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/khoa-hoc")
public class CourseController {
	@Autowired
	CourseService courseService;
	
	@Autowired
	CoursePaymentService coursePaymentService;
	
	
	
	@GetMapping("/danh-sach-khoa-hoc-public")
	public Page<CourseResponse> dsKhoaHocPublic(
	        @RequestParam(required = false) String keyword,
	        @RequestParam(required = false) Long levelId,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size
	) {
	    return courseService.dsAllKhoaHocPublic(keyword, levelId, page, 12);
	}
	
	@GetMapping("/danh-sach-khoa-hoc-da-mua")
	public Page<CourseResponse> dsKhoaHocDaMua(
	        @RequestParam(required = false) String keyword,
	        @RequestParam(required = false) Long levelId,
	        @RequestParam(required = false) Integer page
	) {
	    return courseService.dsKhoaHocDaMua(keyword, levelId, page, 12);
//	    return courseService.dsAllKhoaHocPublic(keyword, levelId, page, size);
	}
	
	@PostMapping("/dang-ky-khoa-hoc-free/{courseId}")
	public ResponseEntity<?> dangKyKhoaHocFree(@PathVariable Long courseId){
		courseService.dangKyKhoaHocFree(courseId);
		Map<String, String> kq = new HashMap<String, String>();
		kq.put("message", "Đăng ký khóa học thành công!");
		return ResponseEntity.ok(kq);
	}
	
	@GetMapping("/danh-sach-khoa-hoc-teacher")
	public Page<CourseResponse> dsKhoaHocCuaGiaoVien(
			@RequestParam(required = false) String status,
	        @RequestParam(required = false) String keyword,
	        @RequestParam(required = false) Long levelId,
	        @RequestParam(required = false) Integer page
	) {
	    return courseService.dsAllKhoaHocCuaTeacherPhanTrang(status, keyword, levelId, page, 12);
	}
	
	@GetMapping("/danh-sach-khoa-hoc-teacher-combobox")
	public List<CourseComboboxResponse> dsKhoaHocCuaGiaoVienCombobox(
	) {
	    return courseService.dsAllKhoaHocCuaTeacher();
	}
	
	@GetMapping("/danh-sach-khoa-hoc")
	public Page<CourseResponse> dsKhoaHoc(
			@RequestParam(required = false) String status,
	        @RequestParam(required = false) String keyword,
	        @RequestParam(required = false) Long levelId,
	        @RequestParam(required = false) Integer page
	) {
	    return courseService.dsAllKhoaHoc(status, keyword, levelId, page, 12);
	}
	
	@GetMapping("/chi-tiet-khoa-hoc-teacher/{courseId}")
	public ResponseEntity<CourseDetailResponse> getCourseDetail(@PathVariable("courseId") Long courseId) {
	    return ResponseEntity.ok(courseService.chiTietKhoaHoc(courseId));
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
	
	@PutMapping(
            value = "/cap-nhat-khoa-hoc/{courseId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<CourseResponse> updateKhoaHoc(
    		@PathVariable("courseId") Long courseId,
            @RequestPart("data") String data,
            @RequestPart(value = "thumbnailFile", required = false) MultipartFile thumbnailFile
    ) throws IOException {
		System.out.println("Đã chạy");
        ObjectMapper objectMapper = new ObjectMapper();

        CourseRequest request = objectMapper.readValue(data, CourseRequest.class);

        return ResponseEntity.ok(courseService.capNhatKhoaHoc(courseId, request, thumbnailFile));
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

//	@GetMapping("/danh-sach-khoa-hoc-da-mua")
//	public List<CourseResponse> dsKhoaHocDaMua() {
//		return courseService.dsKhoaHocDaMua();
//	}
    
    
    @PostMapping("/{courseId}/tao-thanh-toan")
    public CoursePaymentResponse taoThanhToanKhoaHoc(
            @PathVariable Long courseId
    ) {
        return coursePaymentService.taoThanhToanKhoaHoc(courseId);
    }
    
    @PostMapping("/tao-thanh-toan")
    public CoursePaymentResponse taoThanhToanNhieuKhoaHoc(
            @RequestBody MultiCoursePaymentRequest multiCoursePaymentRequest
    ) {
        return coursePaymentService.taoThanhToanNhieuKhoaHoc(multiCoursePaymentRequest);
    }
    
    @GetMapping("/check-mua")
    public ResponseEntity<Boolean> checkMua(
            @RequestParam String transactionCode
    ) {

        boolean hasAccess = courseService
                .checkHasCourseAccess(transactionCode);

        return ResponseEntity.ok(hasAccess);
    }
}
