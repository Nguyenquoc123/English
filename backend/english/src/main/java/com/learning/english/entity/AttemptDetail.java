package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "attempt_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attemptdetailid")
    private Long attemptDetailId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attemptid", nullable = false)
    private Attempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "questionid", nullable = false)
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selectedoptionid")
    private QuestionOption selectedOption;

    @Column(name = "answertext", columnDefinition = "NVARCHAR(MAX)")
    private String answerText;

    @Column(name = "iscorrect")
    private Boolean isCorrect;

    @Column(name = "earnedpoint", precision = 5, scale = 2)
    private BigDecimal earnedPoint;

    @Column(name = "createdat", nullable = false)
    private LocalDateTime createdAt;
}