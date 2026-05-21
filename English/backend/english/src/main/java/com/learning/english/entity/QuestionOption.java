package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "question_options")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "optionid")
    private Long optionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "questionid", nullable = false)
    private Question question;

    @Column(name = "optiontext", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String optionText;

    @Column(name = "iscorrect", nullable = false)
    private Boolean isCorrect;

    @Column(name = "createdat", nullable = false)
    private LocalDateTime createdAt;
    
   
}