package com.learning.english.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "course_certificates",
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_course_certificates_user_course", columnNames = { "userid", "courseid" }),
                @UniqueConstraint(name = "UK_course_certificates_code", columnNames = { "certificatecode" })
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseCertificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "certificateid")
    private Long certificateId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "userid", nullable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "courseid", nullable = false)
    private Course course;

    @Column(name = "student_name_on_certificate", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String studentNameOnCertificate;

    @Column(name = "course_title_snapshot", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String courseTitleSnapshot;

    @Column(name = "certificatecode", nullable = false, length = 64)
    private String certificateCode;

    @Column(name = "issuedat", nullable = false)
    private LocalDateTime issuedAt;

    @Column(name = "createdat", nullable = false)
    private LocalDateTime createdAt;
}
