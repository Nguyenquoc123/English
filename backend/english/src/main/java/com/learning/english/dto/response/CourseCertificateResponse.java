package com.learning.english.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseCertificateResponse {

    private Long certificateId;
    private Long courseId;
    private String studentNameOnCertificate;
    private String courseTitle;
    private String certificateCode;
    private LocalDateTime issuedAt;
    private String signerTitle;
    private String signerShortName;
    private String signerFullName;
}
