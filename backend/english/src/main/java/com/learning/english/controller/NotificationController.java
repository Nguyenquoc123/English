package com.learning.english.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learning.english.dto.response.UserNotificationResponse;
import com.learning.english.service.NotificationService;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    NotificationService notificationService;

    @GetMapping("/my")
    public ResponseEntity<List<UserNotificationResponse>> getMyNotifications() {
        return ResponseEntity.ok(notificationService.getMyNotifications(currentUsername()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        long count = notificationService.getUnreadCount(currentUsername());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{notificationReceiverId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationReceiverId) {
        notificationService.markAsRead(notificationReceiverId, currentUsername());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead(currentUsername());
        return ResponseEntity.ok().build();
    }

    private String currentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Người dùng chưa đăng nhập");
        }
        return authentication.getName();
    }
}
