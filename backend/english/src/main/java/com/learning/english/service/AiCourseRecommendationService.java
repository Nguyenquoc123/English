package com.learning.english.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.learning.english.dto.response.CourseRecommendationResponse;
import com.learning.english.dto.response.CourseRecommendationResponse.RecommendedCourseItem;
import com.learning.english.entity.Course;
import com.learning.english.repository.CourseRepository;

@Service
public class AiCourseRecommendationService {

    private static final int MAX_RESULTS = 5;

    @Autowired
    private CourseRepository courseRepository;

    public CourseRecommendationResponse recommendCourses(String userMessage) {
        String keyword = normalizeKeyword(userMessage);

        Page<Course> page = courseRepository.searchCourses(
                null,
                "Published",
                keyword,
                null,
                PageRequest.of(0, 20)
        );

        List<Course> ranked = new ArrayList<>(page.getContent());
        ranked.sort(Comparator.comparingInt(course -> -scoreCourse(course, userMessage)));

        List<RecommendedCourseItem> courses = ranked.stream()
                .limit(MAX_RESULTS)
                .map(course -> RecommendedCourseItem.builder()
                        .courseId(course.getCourseId())
                        .title(course.getTitle())
                        .shortDescription(
                                course.getShortDescription() != null
                                        ? course.getShortDescription()
                                        : course.getDescription()
                        )
                        .thumbnailUrl(course.getThumbnailUrl())
                        .levelName(course.getLevel() != null ? course.getLevel().getLevelName() : null)
                        .price(course.getPrice())
                        .courseType(course.getCourseType())
                        .matchScore(scoreCourse(course, userMessage))
                        .reason(buildReason(course, userMessage))
                        .build())
                .toList();

        String message = courses.isEmpty()
                ? "Hiện chưa tìm thấy khóa học phù hợp. Bạn thử mô tả rõ hơn trình độ hoặc mục tiêu học."
                : "Mình đã gợi ý " + courses.size() + " khóa học có thể phù hợp với nhu cầu của bạn.";

        return CourseRecommendationResponse.builder()
                .message(message)
                .courses(courses)
                .build();
    }

    private String normalizeKeyword(String userMessage) {
        if (userMessage == null || userMessage.isBlank()) {
            return null;
        }
        String trimmed = userMessage.trim();
        if (trimmed.length() <= 80) {
            return trimmed;
        }
        return trimmed.substring(0, 80);
    }

    private int scoreCourse(Course course, String userMessage) {
        if (userMessage == null || userMessage.isBlank()) {
            return 1;
        }

        String haystack = (
                safe(course.getTitle()) + " "
                        + safe(course.getShortDescription()) + " "
                        + safe(course.getDescription()) + " "
                        + (course.getLevel() != null ? safe(course.getLevel().getLevelName()) : "")
        ).toLowerCase(Locale.ROOT);

        String[] tokens = userMessage.toLowerCase(Locale.ROOT).split("\\s+");
        int score = 0;
        for (String token : tokens) {
            if (token.length() < 3) {
                continue;
            }
            if (haystack.contains(token)) {
                score += 2;
            }
        }
        return Math.max(score, 1);
    }

    private String buildReason(Course course, String userMessage) {
        if (userMessage == null || userMessage.isBlank()) {
            return "Khóa học đang được phát hành trên hệ thống.";
        }
        if (course.getLevel() != null && userMessage.toLowerCase(Locale.ROOT)
                .contains(course.getLevel().getLevelName().toLowerCase(Locale.ROOT))) {
            return "Phù hợp trình độ " + course.getLevel().getLevelName() + " bạn đề cập.";
        }
        return "Khớp với mô tả nhu cầu học của bạn.";
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
