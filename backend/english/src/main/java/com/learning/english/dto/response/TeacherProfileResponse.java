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
    private String username;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String approvalStatus;
    private String rejectReason;
    private String bio;
    private String experience;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TeacherCertificateResponse> certificates;
}