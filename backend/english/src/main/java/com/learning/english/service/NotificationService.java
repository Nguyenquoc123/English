package com.learning.english.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.learning.english.constant.NotificationTargetType;
import com.learning.english.dto.request.NotificationRequest;
import com.learning.english.dto.response.NotificationResponse;
import com.learning.english.dto.response.UserNotificationResponse;
import com.learning.english.entity.Notification;
import com.learning.english.entity.NotificationReceiver;
import com.learning.english.entity.User;
import com.learning.english.repository.NotificationReceiverRepository;
import com.learning.english.repository.NotificationRepository;
import com.learning.english.repository.UserRepository;

@Service
public class NotificationService {

    @Autowired
    NotificationRepository notificationRepository;

    @Autowired
    NotificationReceiverRepository notificationReceiverRepository;

    @Autowired
    UserRepository userRepository;

    @Transactional
    public NotificationResponse createBroadcast(NotificationRequest req, String adminUsername) {
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw new RuntimeException("Tiêu đề thông báo không được rỗng");
        }
        if (req.getMessage() == null || req.getMessage().isBlank()) {
            throw new RuntimeException("Nội dung thông báo không được rỗng");
        }

        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy admin"));

        String targetType = normalizeTargetType(req.getTargetType());
        String targetValue = normalizeTargetValue(targetType, req.getTargetValue());

        Notification notification = Notification.builder()
                .title(req.getTitle().trim())
                .message(req.getMessage().trim())
                .targetType(targetType)
                .targetValue(targetValue)
                .createdBy(admin)
                .createdAt(LocalDateTime.now())
                .build();

        notification = notificationRepository.save(notification);
        int recipientCount = dispatchReceivers(notification);

        if (recipientCount == 0) {
            throw new RuntimeException(
                    "Không có người nhận phù hợp. Kiểm tra trạng thái tài khoản (pending/banned) hoặc vai trò/ID đã chọn.");
        }

        NotificationResponse response = toNotificationResponse(notification);
        response.setRecipientCount(recipientCount);
        return response;
    }

    @Transactional
    public void notifyUser(User recipient, String title, String message, User createdBy) {
        if (recipient == null) {
            return;
        }

        User sender = createdBy != null ? createdBy : recipient;

        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .targetType(NotificationTargetType.USER)
                .targetValue(String.valueOf(recipient.getUserId()))
                .createdBy(sender)
                .createdAt(LocalDateTime.now())
                .build();

        notification = notificationRepository.save(notification);

        notificationReceiverRepository.save(NotificationReceiver.builder()
                .notification(notification)
                .user(recipient)
                .isRead(false)
                .build());
    }

    @Transactional(readOnly = true)
    public List<UserNotificationResponse> getMyNotifications(String username) {
        User user = getCurrentUser(username);
        return notificationReceiverRepository.findAllByUserIdWithNotification(user.getUserId())
                .stream()
                .map(this::toUserNotificationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String username) {
        User user = getCurrentUser(username);
        return notificationReceiverRepository.countUnreadByUserId(user.getUserId());
    }

    @Transactional
    public void markAsRead(Long notificationReceiverId, String username) {
        User user = getCurrentUser(username);
        NotificationReceiver receiver = notificationReceiverRepository
                .findByNotificationReceiverIdAndUser_UserId(notificationReceiverId, user.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));

        if (!Boolean.TRUE.equals(receiver.getIsRead())) {
            receiver.setIsRead(true);
            receiver.setReadAt(LocalDateTime.now());
            notificationReceiverRepository.save(receiver);
        }
    }

    @Transactional
    public void markAllAsRead(String username) {
        User user = getCurrentUser(username);
        List<NotificationReceiver> unread = notificationReceiverRepository
                .findAllByUserIdWithNotification(user.getUserId())
                .stream()
                .filter(r -> !Boolean.TRUE.equals(r.getIsRead()))
                .toList();

        LocalDateTime now = LocalDateTime.now();
        for (NotificationReceiver receiver : unread) {
            receiver.setIsRead(true);
            receiver.setReadAt(now);
        }
        notificationReceiverRepository.saveAll(unread);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getAllBroadcasts() {
        return notificationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toNotificationResponse)
                .toList();
    }

    @Transactional
    public void deleteBroadcast(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));

        notificationReceiverRepository.deleteByNotification_NotificationId(notificationId);
        notificationRepository.delete(notification);
    }

    private int dispatchReceivers(Notification notification) {
        List<User> recipients = resolveRecipients(notification);
        List<NotificationReceiver> receivers = new ArrayList<>();

        for (User user : recipients) {
            receivers.add(NotificationReceiver.builder()
                    .notification(notification)
                    .user(user)
                    .isRead(false)
                    .build());
        }

        if (!receivers.isEmpty()) {
            notificationReceiverRepository.saveAll(receivers);
        }
        return receivers.size();
    }

    private List<User> resolveRecipients(Notification notification) {
        String targetType = notification.getTargetType();
        String targetValue = notification.getTargetValue();

        if (NotificationTargetType.ALL.equalsIgnoreCase(targetType)) {
            return userRepository.findEligibleNotificationRecipients();
        }

        if (NotificationTargetType.ROLE.equalsIgnoreCase(targetType)) {
            if (targetValue == null || targetValue.isBlank()) {
                throw new RuntimeException("Vui lòng chọn vai trò nhận thông báo");
            }
            String roleName = targetValue.trim().toLowerCase(Locale.ROOT);
            if (!List.of("student", "teacher", "admin").contains(roleName)) {
                throw new RuntimeException("Vai trò không hợp lệ. Chọn: student, teacher, admin");
            }
            return userRepository.findEligibleByRoleName(roleName);
        }

        if (NotificationTargetType.USER.equalsIgnoreCase(targetType)) {
            if (targetValue == null || targetValue.isBlank()) {
                throw new RuntimeException("Vui lòng nhập ID người dùng");
            }
            Long userId;
            try {
                userId = Long.parseLong(targetValue.trim());
            } catch (NumberFormatException e) {
                throw new RuntimeException("ID người dùng phải là số nguyên");
            }
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));
            if (isBlockedStatus(user.getStatus())) {
                throw new RuntimeException("Người dùng này chưa kích hoạt hoặc đã bị khóa, không thể nhận thông báo");
            }
            return List.of(user);
        }

        throw new RuntimeException("Loại đối tượng nhận không hợp lệ");
    }

    private boolean isBlockedStatus(String status) {
        if (status == null || status.isBlank()) {
            return false;
        }
        String lower = status.trim().toLowerCase(Locale.ROOT);
        return "pending".equals(lower) || "banned".equals(lower);
    }

    private String normalizeTargetType(String targetType) {
        if (targetType == null || targetType.isBlank()) {
            return NotificationTargetType.ALL;
        }
        return targetType.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeTargetValue(String targetType, String targetValue) {
        if (NotificationTargetType.ALL.equalsIgnoreCase(targetType)) {
            return null;
        }
        if (targetValue == null || targetValue.isBlank()) {
            throw new RuntimeException("Vui lòng nhập đối tượng nhận thông báo");
        }
        if (NotificationTargetType.ROLE.equalsIgnoreCase(targetType)) {
            return targetValue.trim().toLowerCase(Locale.ROOT);
        }
        return targetValue.trim();
    }

    private User getCurrentUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    private UserNotificationResponse toUserNotificationResponse(NotificationReceiver receiver) {
        Notification notification = receiver.getNotification();
        return UserNotificationResponse.builder()
                .notificationReceiverId(receiver.getNotificationReceiverId())
                .notificationId(notification.getNotificationId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(Boolean.TRUE.equals(receiver.getIsRead()))
                .createdAt(notification.getCreatedAt())
                .readAt(receiver.getReadAt())
                .build();
    }

    private NotificationResponse toNotificationResponse(Notification notification) {
        return NotificationResponse.builder()
                .notificationId(notification.getNotificationId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .targetType(notification.getTargetType())
                .targetValue(notification.getTargetValue())
                .createdByUsername(
                        notification.getCreatedBy() != null ? notification.getCreatedBy().getUsername() : null)
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
