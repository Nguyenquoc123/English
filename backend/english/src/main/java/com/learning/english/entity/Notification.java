package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notificationid")
    private Long notificationId;

    @Column(name = "title", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String message;

    @Column(name = "targettype", nullable = false, length = 50)
    private String targetType;

    @Column(name = "targetvalue", length = 255)
    private String targetValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "createdby", nullable = false)
    private User createdBy;

    @Column(name = "createdat", nullable = false)
    private LocalDateTime createdAt;
}