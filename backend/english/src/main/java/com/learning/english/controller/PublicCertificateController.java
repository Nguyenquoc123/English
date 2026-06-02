package com.learning.english.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learning.english.dto.response.CourseCertificateResponse;
import com.learning.english.service.CourseCertificateService;

@RestController
@RequestMapping("/certificates")
public class PublicCertificateController {

    @Autowired
    CourseCertificateService courseCertificateService;

    @GetMapping("/verify/{certificateCode}")
    public ResponseEntity<CourseCertificateResponse> verify(@PathVariable String certificateCode) {
        return ResponseEntity.ok(courseCertificateService.getByCodePublic(certificateCode));
    }
}
