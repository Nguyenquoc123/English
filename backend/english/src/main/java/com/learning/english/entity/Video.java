package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "videos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Video {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "videoid")
    private Long videoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lessonid", nullable = false)
    private Lesson lesson;

    @Column(name = "title", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String title;

    @Column(name = "videourl", nullable = false, length = 500)
    private String videoUrl;

    @Column(name = "durationseconds")
    private Integer durationSeconds;

    @Column(name = "thumbnailurl", length = 500)
    private String thumbnailUrl;

    @Column(name = "displayorder", nullable = false)
    private Integer displayOrder;

    @Column(name = "createdat", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updatedat", nullable = false)
    private LocalDateTime updatedAt;
}