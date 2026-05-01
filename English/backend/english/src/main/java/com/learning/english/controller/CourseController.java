package com.learning.english.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.learning.english.dto.request.CourseDuyetRequest;
import com.learning.english.dto.request.CourseRequest;
import com.learning.english.dto.request.TeacherDuyetRequest;
import com.learning.english.dto.response.CourseResponse;
import com.learning.english.dto.response.TeacherProfileResponse;
import com.learning.english.service.CourseService;

import tools.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/khoa-hoc")
public class CourseController {
	@Autowired
	CourseService courseService;
	
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
	
	@PutMapping("/{courseId}/approve")
    public ResponseEntity<CourseResponse> duyetDangKyLamGiaoVien(
            @PathVariable Long courseId,
            @RequestBody CourseDuyetRequest request
    ) {
        return ResponseEntity.ok(courseService.duyetKhoaHoc(
                courseId,
                request.getApprovalStatus(),
                request.getRejectReason()
        ));
    }
}
