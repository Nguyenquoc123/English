package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attemptid")
    private Long attemptId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userid", nullable = false)
    private User user;

    @Column(name = "attempttype", nullable = false, length = 50)
    private String attemptType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lessonid")
    private Lesson lesson;

    @Column(name = "practicetype", length = 50)
    private String practiceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "examid")
    private Exam exam;

    @Column(name = "startedat", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "submittedat")
    private LocalDateTime submittedAt;

    @Column(name = "score", precision = 5, scale = 2)
    private BigDecimal score;

    @Column(name = "totalcorrect")
    private Integer totalCorrect;

    @Column(name = "totalquestions")
    private Integer totalQuestions;

    @Column(name = "durationseconds")
    private Integer durationSeconds;

    @Column(name = "resultstatus", length = 50)
    private String resultStatus;

    @Column(name = "createdat", nullable = false)
    private LocalDateTime createdAt;
}