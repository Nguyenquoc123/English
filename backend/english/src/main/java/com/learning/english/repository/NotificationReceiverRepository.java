package com.learning.english.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.NotificationReceiver;

@Repository
public interface NotificationReceiverRepository extends JpaRepository<NotificationReceiver, Long> {

    @Query("""
            SELECT nr FROM NotificationReceiver nr
            JOIN FETCH nr.notification n
            WHERE nr.user.userId = :userId
            ORDER BY n.createdAt DESC
            """)
    List<NotificationReceiver> findAllByUserIdWithNotification(@Param("userId") Long userId);

    @Query("""
            SELECT COUNT(nr) FROM NotificationReceiver nr
            WHERE nr.user.userId = :userId
            AND (nr.isRead = false OR nr.isRead IS NULL)
            """)
    long countUnreadByUserId(@Param("userId") Long userId);

    Optional<NotificationReceiver> findByNotificationReceiverIdAndUser_UserId(Long notificationReceiverId,
            Long userId);

    void deleteByNotification_NotificationId(Long notificationId);
}
