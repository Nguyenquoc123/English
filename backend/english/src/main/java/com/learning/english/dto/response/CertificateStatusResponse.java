package com.learning.english.dto.response;

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
public class CertificateStatusResponse {

    private Long courseId;
    private String courseTitle;
    private Boolean certificateEnabled;
    private Integer progressPercent;
    private Long totalItems;
    private Long completedItems;
    private Boolean eligible;
    private Boolean alreadyIssued;
    private String message;
    private CourseCertificateResponse certificate;
}
