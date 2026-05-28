package com.learning.english.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Long notificationId;

    private String title;

    private String message;

    private String targetType;

    private String targetValue;

    private String createdByUsername;

    private LocalDateTime createdAt;

    /** Số người nhận thực tế (bản ghi notification_receivers). */
    private Integer recipientCount;
}
