package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "courseid")
    private Long courseId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacherid", nullable = false)
    private User teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "levelid")
    private Level level;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "shortdescription", length = 500)
    private String shortDescription;

    @Lob
    @Column(name = "description")
    private String description;

    @Column(name = "thumbnailurl", length = 500)
    private String thumbnailUrl;

    @Column(name = "price", nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    @Column(name = "coursetype", nullable = false, length = 50)
    @Builder.Default
    private String courseType = "FREE";

    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "DRAFT";

    @Column(name = "submittedat")
    private LocalDateTime submittedAt;

    @Column(name = "reviewedat")
    private LocalDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewedBy")
    private User reviewedBy;

    @Column(name = "rejectreason", length = 1000)
    private String rejectReason;

    @Column(name = "createdat", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updatedAt", nullable = false)
    private LocalDateTime updatedAt;
}