package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "enrollments",
    uniqueConstraints = {
        @UniqueConstraint(name = "UQ_enrollments", columnNames = {"userid", "courseid"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "enrollmentid")
    private Long enrollmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userid", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "courseid", nullable = false)
    private Course course;

    @Column(name = "hascourseaccess", nullable = false)
    private Boolean hasCourseAccess;

    @Column(name = "hasexamaccess", nullable = false)
    private Boolean hasExamAccess;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coursetransactionid")
    private Transaction courseTransaction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "examaccesstransactionid")
    private Transaction examAccessTransaction;

    @Column(name = "createdat", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updatedat", nullable = false)
    private LocalDateTime updatedAt;
}