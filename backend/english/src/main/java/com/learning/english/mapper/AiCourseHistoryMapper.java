package com.learning.english.mapper;

import java.util.ArrayList;
import java.util.List;

import org.mapstruct.Mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learning.english.dto.response.AiCourseRecommendationHistoryResponse;
import com.learning.english.dto.response.AiCourseRecommendationParsedResponse;
import com.learning.english.entity.AiChatHistory;

@Mapper(componentModel = "spring")
public interface AiCourseHistoryMapper {

    ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    default List<AiCourseRecommendationHistoryResponse> toMessageResponses(
            List<AiChatHistory> histories
    ) {
        if (histories == null || histories.isEmpty()) {
            return List.of();
        }

        List<AiCourseRecommendationHistoryResponse> messages = new ArrayList<>();

        for (AiChatHistory history : histories) {
            messages.add(toUserMessage(history));
            messages.add(toAiMessage(history));
        }

        return messages;
    }

    default AiCourseRecommendationHistoryResponse toUserMessage(AiChatHistory history) {
        if (history == null) {
            return null;
        }

        return AiCourseRecommendationHistoryResponse.builder()
                .chatId(history.getChatId())
                .role("user")
                .content(history.getUserMessage())
                .courses(List.of())
                .createdAt(history.getCreatedAt())
                .build();
    }

    default AiCourseRecommendationHistoryResponse toAiMessage(AiChatHistory history) {
        if (history == null) {
            return null;
        }

        AiCourseRecommendationParsedResponse parsedResponse =
                parseAiResponse(history.getAiResponse());

        if (parsedResponse != null) {
            return AiCourseRecommendationHistoryResponse.builder()
                    .chatId(history.getChatId())
                    .role("ai")
                    .content(parsedResponse.getMessage())
                    .courses(
                            parsedResponse.getCourses() == null
                                    ? List.of()
                                    : parsedResponse.getCourses()
                    )
                    .createdAt(history.getCreatedAt())
                    .build();
        }

        return AiCourseRecommendationHistoryResponse.builder()
                .chatId(history.getChatId())
                .role("ai")
                .content(history.getAiResponse())
                .courses(List.of())
                .createdAt(history.getCreatedAt())
                .build();
    }

    default AiCourseRecommendationParsedResponse parseAiResponse(String aiResponse) {
        if (aiResponse == null || aiResponse.isBlank()) {
            return null;
        }

        String trimmed = aiResponse.trim();

        if (!trimmed.startsWith("{")) {
            return null;
        }

        try {
            return OBJECT_MAPPER.readValue(
                    trimmed,
                    AiCourseRecommendationParsedResponse.class
            );
        } catch (Exception e) {
            return null;
        }
    }
}