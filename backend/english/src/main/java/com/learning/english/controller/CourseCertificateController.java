package com.learning.english.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learning.english.dto.request.CertificateIssueRequest;
import com.learning.english.dto.response.CertificateStatusResponse;
import com.learning.english.dto.response.CourseCertificateResponse;
import com.learning.english.service.CourseCertificateService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/khoa-hoc")
public class CourseCertificateController {

    @Autowired
    private CourseCertificateService courseCertificateService;

    @GetMapping("/certificate-api-health")
    public ResponseEntity<java.util.Map<String, Object>> health() {
        return ResponseEntity.ok(java.util.Map.of(
                "ok", true,
                "message", "Course certificate API is loaded"));
    }

    @GetMapping("/{courseId}/certificate/status")
    public ResponseEntity<CertificateStatusResponse> getCertificateStatus(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseCertificateService.getStatus(courseId));
    }

    @GetMapping("/{courseId}/certificate")
    public ResponseEntity<CourseCertificateResponse> getMyCertificate(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseCertificateService.getMyCertificate(courseId));
    }

    @PostMapping("/{courseId}/certificate")
    public ResponseEntity<CourseCertificateResponse> issueCertificate(
            @PathVariable Long courseId,
            @Valid @RequestBody CertificateIssueRequest request) {
        return ResponseEntity.ok(courseCertificateService.issueCertificate(courseId, request));
    }
}
