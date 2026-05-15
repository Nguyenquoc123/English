package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "teacher_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "teacherprofileid")
    private Long teacherProfileId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userid", nullable = false, unique = true)
    private User user;

    @Column(name = "bio", columnDefinition = "NVARCHAR(2000)")
    private String bio;

    @Column(name = "experience", columnDefinition = "NVARCHAR(MAX)")
    private String experience;

    @Column(name = "approvalstatus", nullable = false, length = 50)
    private String approvalStatus;

    @Column(name = "reviewedat")
    private LocalDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewedby")
    private User reviewedBy;

    @Column(name = "rejectreason", columnDefinition = "NVARCHAR(1000)")
    private String rejectReason;

    @Column(name = "createdat", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updatedat", nullable = false)
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "teacherProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TeacherCertificate> certificates = new ArrayList<>();
}