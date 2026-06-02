package com.learning.english.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.AiChatHistory;

@Repository
public interface AiChatHistoryRepository extends JpaRepository<AiChatHistory, Long> {

    Optional<AiChatHistory> findTopByUserIdAndUserMessageOrderByCreatedAtDesc(
            Long userId,
            String userMessage
    );

    long countByUserIdAndUserMessageNotAndCreatedAtBetween(
            Long userId,
            String userMessage,
            LocalDateTime startOfDay,
            LocalDateTime endOfDay
    );

    List<AiChatHistory> findTop5ByUserIdAndTypeOrderByCreatedAtDesc(
            Long userId,
            String type
    );

    List<AiChatHistory> findTop20ByUserIdAndTypeOrderByCreatedAtDesc(
            Long userId,
            String type
    );

    long countByUserIdAndType(
            Long userId,
            String type
    );
    
    
    List<AiChatHistory> findByUserIdAndTypeOrderByChatIdDesc(
            Long userId,
            String type,
            Pageable pageable
    );

    List<AiChatHistory> findByUserIdAndTypeAndChatIdLessThanOrderByChatIdDesc(
            Long userId,
            String type,
            Long beforeChatId,
            Pageable pageable
    );
}
