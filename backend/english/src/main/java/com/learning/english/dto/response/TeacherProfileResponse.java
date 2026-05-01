package com.learning.english.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherProfileResponse {
    private Long teacherProfileId;
    private Long userId;
    private String approvalStatus;
    private String rejectReason;
    private String bio;
    private String experience;
    private LocalDateTime createdAt;
    private List<TeacherCertificateResponse> certificates;
}