package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "lesson_practice_configs",
    uniqueConstraints = {
        @UniqueConstraint(name = "UQ_lesson_practice_configs", columnNames = {"lessonid", "practicetype"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonPracticeConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "practiceconfigid")
    private Long practiceConfigId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lessonid", nullable = false)
    private Lesson lesson;

    @Column(name = "practicetype", nullable = false, length = 50)
    private String practiceType;

    @Column(name = "questionlimit", nullable = false)
    private Integer questionLimit;

    @Column(name = "isactive", nullable = false)
    private Boolean isActive;

    @Column(name = "createdat", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updatedat", nullable = false)
    private LocalDateTime updatedAt;
}