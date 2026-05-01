package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "vocabularies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vocabulary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vocabularyid")
    private Long vocabularyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lessonid", nullable = false)
    private Lesson lesson;

    @Column(name = "word", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String word;

    @Column(name = "pronunciation", columnDefinition = "NVARCHAR(255)")
    private String pronunciation;

    @Column(name = "meaning", nullable = false, columnDefinition = "NVARCHAR(500)")
    private String meaning;

    @Column(name = "examplesentence", columnDefinition = "NVARCHAR(MAX)")
    private String exampleSentence;

    @Column(name = "audiourl", length = 500)
    private String audioUrl;

    @Column(name = "imageurl", length = 500)
    private String imageUrl;

    @Column(name = "displayorder", nullable = false)
    private Integer displayOrder;

    @Column(name = "createdat", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updatedat", nullable = false)
    private LocalDateTime updatedAt;
}