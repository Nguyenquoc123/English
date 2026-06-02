package com.learning.english.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiCourseHistoryPageResponse {

    private List<AiCourseRecommendationHistoryResponse> messages;

    private Long nextCursor;

    private Boolean hasMore;
}