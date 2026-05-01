package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "exam_questions",
    uniqueConstraints = {
        @UniqueConstraint(name = "UQ_exam_questions", columnNames = {"examid", "questionid"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "examquestionid")
    private Long examQuestionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "examid", nullable = false)
    private Exam exam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "questionid", nullable = false)
    private Question question;

    @Column(name = "questionorder", nullable = false)
    private Integer questionOrder;

    @Column(name = "point", nullable = false, precision = 5, scale = 2)
    private BigDecimal point;

    @Column(name = "createdat", nullable = false)
    private LocalDateTime createdAt;
}