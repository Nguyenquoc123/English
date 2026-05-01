package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "questionid")
    private Long questionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lessonid")
    private Lesson lesson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "courseid")
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "createdby", nullable = false)
    private User createdBy;

    @Column(name = "questiontype", nullable = false, length = 50)
    private String questionType;

    @Column(name = "content", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String content;

    @Column(name = "mediaurl", length = 500)
    private String mediaUrl;

    @Column(name = "correcttext", columnDefinition = "NVARCHAR(MAX)")
    private String correctText;

    @Column(name = "explanation", columnDefinition = "NVARCHAR(MAX)")
    private String explanation;

    @Column(name = "defaultpoint", nullable = false, precision = 5, scale = 2)
    private BigDecimal defaultPoint;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "sourcetype", nullable = false, length = 50)
    private String sourceType;

    @Column(name = "createdat", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updatedat", nullable = false)
    private LocalDateTime updatedAt;
    
    @OneToMany(
            mappedBy = "question",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<QuestionOption> options = new ArrayList<>();
    
    public void addOption(QuestionOption option) {
        options.add(option);
        option.setQuestion(this);
    }
}