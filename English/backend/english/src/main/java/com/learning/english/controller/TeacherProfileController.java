package com.learning.english.controller;

import com.learning.english.dto.request.TeacherDuyetRequest;
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

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TeacherProfileResponse> dangKyLamGiaoVien(
            @RequestParam("bio") String bio,
            @RequestParam("experience") String experience,
            @RequestParam(value = "certificateFiles", required = false) List<MultipartFile> certificateFiles
    ) throws IOException {

        return ResponseEntity.ok(teacherProfileService.dangKyLamGiaoVien(bio, experience, certificateFiles));
    }
    
    @PutMapping("/{teacherProfileId}/approve")
    public ResponseEntity<TeacherProfileResponse> duyetDangKyLamGiaoVien(
            @PathVariable Long teacherProfileId,
            @RequestBody TeacherDuyetRequest request
    ) {
        return ResponseEntity.ok(teacherProfileService.duyetDangKyLamGiaoVien(
                teacherProfileId,
                request.getApprovalStatus(),
                request.getRejectReason()
        ));
    }
}