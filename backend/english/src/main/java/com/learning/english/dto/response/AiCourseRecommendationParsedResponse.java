package com.learning.english.dto.response;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiCourseRecommendationParsedResponse {

    private String message;

    private List<RecommendedCourseResponse> courses;
}