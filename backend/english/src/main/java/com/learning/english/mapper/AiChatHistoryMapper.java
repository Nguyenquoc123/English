package com.learning.english.mapper;

import java.util.ArrayList;
import java.util.List;

import org.mapstruct.Mapper;

import com.learning.english.dto.response.AiChatMessageResponse;
import com.learning.english.entity.AiChatHistory;

@Mapper(componentModel = "spring")
public interface AiChatHistoryMapper {

    default List<AiChatMessageResponse> toMessageResponses(List<AiChatHistory> histories) {
        if (histories == null || histories.isEmpty()) {
            return List.of();
        }

        List<AiChatMessageResponse> messages = new ArrayList<>();

        for (AiChatHistory history : histories) {
            messages.add(toUserMessage(history));
            messages.add(toAiMessage(history));
        }

        return messages;
    }

    default AiChatMessageResponse toUserMessage(AiChatHistory history) {
        if (history == null) {
            return null;
        }

        return AiChatMessageResponse.builder()
                .chatId(history.getChatId())
                .role("user")
                .content(history.getUserMessage())
                .createdAt(history.getCreatedAt())
                .build();
    }

    default AiChatMessageResponse toAiMessage(AiChatHistory history) {
        if (history == null) {
            return null;
        }

        return AiChatMessageResponse.builder()
                .chatId(history.getChatId())
                .role("ai")
                .content(history.getAiResponse())
                .createdAt(history.getCreatedAt())
                .build();
    }
}