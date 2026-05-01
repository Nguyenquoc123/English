package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "notification_receivers",
    uniqueConstraints = {
        @UniqueConstraint(name = "UQ_notification_receivers", columnNames = {"notificationid", "userid"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationReceiver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notificationreceiverid")
    private Long notificationReceiverId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notificationid", nullable = false)
    private Notification notification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userid", nullable = false)
    private User user;

    @Column(name = "isread", nullable = false)
    private Boolean isRead;

    @Column(name = "readat")
    private LocalDateTime readAt;
}