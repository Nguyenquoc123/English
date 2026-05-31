package com.learning.english.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.AiChatHistory;

@Repository
public interface AiChatHistoryRepository extends JpaRepository<AiChatHistory, Long> {

    Optional<AiChatHistory> findTopByUserIdAndUserMessageOrderByCreatedAtDesc(
            Long userId,
            String userMessage
    );

    List<AiChatHistory> findTop5ByUserIdAndUserMessageNotOrderByCreatedAtDesc(
            Long userId,
            String userMessage
    );

    List<AiChatHistory> findTop20ByUserIdAndUserMessageNotOrderByCreatedAtDesc(
            Long userId,
            String userMessage
    );

    long countByUserIdAndUserMessageNot(Long userId, String userMessage);
}
