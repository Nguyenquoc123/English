package com.learning.english.dto.response;

import java.math.BigDecimal;
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
public class CourseRecommendationResponse {

    private String message;
    private List<RecommendedCourseItem> courses;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecommendedCourseItem {
        private Long courseId;
        private String title;
        private String shortDescription;
        private String thumbnailUrl;
        private String levelName;
        private BigDecimal price;
        private String courseType;
        private Integer matchScore;
        private String reason;
    }
}
