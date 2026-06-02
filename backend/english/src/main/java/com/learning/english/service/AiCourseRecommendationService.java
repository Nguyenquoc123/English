package com.learning.english.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learning.english.dto.response.CourseRecommendationResponse;
import com.learning.english.dto.response.CourseRecommendationResponse.RecommendedCourseItem;
import com.learning.english.entity.AiChatHistory;
import com.learning.english.entity.Course;
import com.learning.english.entity.User;
import com.learning.english.repository.AiChatHistoryRepository;
import com.learning.english.repository.CourseRepository;
import com.learning.english.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiCourseRecommendationService {

    private static final String SUMMARY_MESSAGE = "__SUMMARY__";
    private static final String SUGGEST_TYPE = "suggest";

    private static final int MAX_DB_CANDIDATES = 60;
    private static final int MAX_AI_CANDIDATES = 20;
    private static final int MAX_RESULTS = 5;
    private static final int MIN_RELEVANT_SCORE = 18;

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final AiChatHistoryRepository aiChatHistoryRepository;
    private final SystemSettingService systemSettingService;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String url;

    @Transactional
    public CourseRecommendationResponse recommendCourses(String userMessage) {
        try {
            User user = getCurrentUser();

            checkAiDailyLimit(user);

            if (userMessage == null || userMessage.isBlank()) {
                CourseRecommendationResponse response = emptyResponse(
                        "Bạn hãy mô tả nhu cầu học, ví dụ: khóa miễn phí, khóa dưới 100k, mất gốc, giao tiếp, TOEIC, IELTS, ngữ pháp..."
                );

                

                return response;
            }

            CourseSearchIntent intent = extractIntentByAi(userMessage);

            if (!intent.courseRecommendationRequest()) {
                CourseRecommendationResponse response = emptyResponse(
                        "Mình chỉ hỗ trợ gợi ý khóa học tiếng Anh trên hệ thống. Bạn hãy nhập nhu cầu như: khóa miễn phí, học ngữ pháp, giao tiếp, mất gốc, TOEIC, IELTS hoặc khóa dưới một mức giá cụ thể."
                );

                saveSuggestHistory(user.getUserId(), userMessage, response);

                return response;
            }

            List<Course> hardFilteredCourses = findCoursesByHardFilters(intent);

            if (hardFilteredCourses.isEmpty()) {
                CourseRecommendationResponse response = emptyResponse(buildNoCourseMessage(intent));

                saveSuggestHistory(user.getUserId(), userMessage, response);

                return response;
            }

            List<ScoredCourse> relevantCandidates = scoreAndFilterCourses(
                    hardFilteredCourses,
                    intent,
                    userMessage
            );

            if (relevantCandidates.isEmpty()) {
                CourseRecommendationResponse response = emptyResponse(buildNoCourseMessage(intent));

                saveSuggestHistory(user.getUserId(), userMessage, response);

                return response;
            }

            List<ScoredCourse> aiCandidates = relevantCandidates.stream()
                    .limit(MAX_AI_CANDIDATES)
                    .toList();

            List<AiSelectedCourse> aiSelectedCourses = selectBestCoursesByAi(
                    userMessage,
                    intent,
                    aiCandidates
            );

            List<RecommendedCourseItem> finalCourses = mapAiSelectedCourses(
                    aiSelectedCourses,
                    aiCandidates
            );

            if (finalCourses.isEmpty()) {
                finalCourses = aiCandidates.stream()
                        .limit(MAX_RESULTS)
                        .map(item -> toRecommendedCourseItem(
                                item.course(),
                                item.score(),
                                buildBackendReason(item.course(), intent)
                        ))
                        .toList();
            }

            CourseRecommendationResponse response = finalCourses.isEmpty()
                    ? emptyResponse(buildNoCourseMessage(intent))
                    : CourseRecommendationResponse.builder()
                    .message("Mình đã tìm được " + finalCourses.size() + " khóa học phù hợp nhất với nhu cầu của bạn.")
                    .courses(finalCourses)
                    .build();

            saveSuggestHistory(user.getUserId(), userMessage, response);

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Lỗi gợi ý khóa học: " + e.getMessage(), e);
        }
    }

    private void checkAiDailyLimit(User user) {
        LocalDate today = LocalDate.now();

        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay().minusNanos(1);

        String roleName = user.getRole().getRoleName();

        int dailyLimit = systemSettingService.getAiDailyLimitByRole(roleName);

        long usedToday = aiChatHistoryRepository
                .countByUserIdAndUserMessageNotAndCreatedAtBetween(
                        user.getUserId(),
                        SUMMARY_MESSAGE,
                        startOfDay,
                        endOfDay
                );

        if (usedToday >= dailyLimit) {
            throw new RuntimeException("Bạn đã hết lượt sử dụng AI hôm nay.");
        }
    }

    private CourseSearchIntent extractIntentByAi(String userMessage) throws Exception {
        String prompt = """
                Bạn là AI phân tích nhu cầu gợi ý khóa học tiếng Anh.

                Nhiệm vụ:
                - Đọc câu hỏi của học viên.
                - Xác định câu hỏi có phải đang muốn tìm/gợi ý khóa học tiếng Anh không.
                - Trích xuất từ khóa tìm kiếm.
                - Xác định loại khóa học FREE/PAID nếu có.
                - Xác định mức giá min/max nếu học viên hỏi giá.
                - Xác định level nếu có.
                - Xác định mục tiêu học nếu có.

                Chỉ trả về JSON hợp lệ.
                Không markdown.
                Không giải thích.
                Không thêm text ngoài JSON.

                Format:
                {
                  "courseRecommendationRequest": true,
                  "keywords": ["ngữ pháp", "grammar"],
                  "level": "Sơ cấp | Trung cấp | Cao cấp | null",
                  "goal": "ngữ pháp | giao tiếp | nghe | viết | từ vựng | TOEIC | IELTS | null",
                  "courseType": "FREE | PAID | null",
                  "minPrice": null,
                  "maxPrice": 5000
                }

                Quy tắc nhận diện:
                - Nếu học viên hỏi về khóa học, lớp học, course, học tiếng Anh, gợi ý khóa học thì courseRecommendationRequest = true.
                - Nếu học viên hỏi thời tiết, ăn gì, viết code, tin tức, toán học, chuyện không liên quan khóa học tiếng Anh thì courseRecommendationRequest = false.
                - Nếu hỏi free, miễn phí, 0 đồng, không mất tiền thì courseType = "FREE", maxPrice = 0.
                - Nếu hỏi trả phí, premium, có phí thì courseType = "PAID".
                - Nếu hỏi "dưới 5k", "dưới 5 nghìn", "nhỏ hơn 5000" thì maxPrice = 5000.
                - Nếu hỏi "dưới 100k", "dưới 100 nghìn" thì maxPrice = 100000.
                - Nếu hỏi "từ 50k đến 200k" thì minPrice = 50000, maxPrice = 200000.
                - Nếu không nhắc giá thì minPrice = null, maxPrice = null.
                - Nếu học viên nói mất gốc, mới bắt đầu, beginner, cơ bản thì level = "Sơ cấp".
                - Nếu học viên nói trung cấp, intermediate thì level = "Trung cấp".
                - Nếu học viên nói nâng cao, advanced thì level = "Cao cấp".
                - Nếu nói ngữ pháp thì keywords phải có "ngữ pháp", "grammar".
                - Nếu nói giao tiếp thì keywords phải có "giao tiếp", "speaking", "communication".
                - Nếu nói nghe thì keywords phải có "nghe", "listening".
                - Nếu nói viết thì keywords phải có "viết", "writing".
                - Nếu nói từ vựng thì keywords phải có "từ vựng", "vocabulary".
                - Nếu nói TOEIC hoặc IELTS thì keywords phải có đúng từ đó.
                - Keywords phải ngắn, đúng ý, có thể dùng để so với title/description khóa học.
                - Không bịa nhu cầu nếu học viên không nói.

                Câu hỏi học viên:
                "%s"
                """.formatted(userMessage);

        String aiResponse = callGemini(prompt);

        JsonNode root = parseJsonFromAi(aiResponse);

        boolean courseRecommendationRequest = root.path("courseRecommendationRequest").asBoolean(false);

        List<String> keywords = new ArrayList<>();
        JsonNode keywordNode = root.path("keywords");

        if (keywordNode.isArray()) {
            for (JsonNode item : keywordNode) {
                String keyword = item.asText(null);

                if (keyword != null && !keyword.isBlank()) {
                    keywords.add(keyword.trim());
                }
            }
        }

        String level = cleanNullableText(root.path("level").asText(null));
        String goal = cleanNullableText(root.path("goal").asText(null));
        String courseType = normalizeCourseType(root.path("courseType").asText(null));

        BigDecimal minPrice = getNullableBigDecimal(root.path("minPrice"));
        BigDecimal maxPrice = getNullableBigDecimal(root.path("maxPrice"));

        if ("FREE".equalsIgnoreCase(courseType)) {
            maxPrice = BigDecimal.ZERO;
        }

        return new CourseSearchIntent(
                courseRecommendationRequest,
                normalizeKeywords(keywords),
                level,
                goal,
                courseType,
                minPrice,
                maxPrice
        );
    }

    private List<Course> findCoursesByHardFilters(CourseSearchIntent intent) {
        return courseRepository.findPublishedCoursesByExactFilters(
                intent.courseType(),
                intent.level(),
                intent.minPrice(),
                intent.maxPrice(),
                PageRequest.of(0, MAX_DB_CANDIDATES)
        );
    }

    private List<ScoredCourse> scoreAndFilterCourses(
            List<Course> courses,
            CourseSearchIntent intent,
            String userMessage
    ) {
        boolean hasMeaningfulKeywords = intent.keywords() != null && !intent.keywords().isEmpty();
        boolean hasGoal = intent.goal() != null && !intent.goal().isBlank();

        List<ScoredCourse> scoredCourses = new ArrayList<>();

        for (Course course : courses) {
            int score = scoreCourse(course, intent, userMessage);

            boolean onlyHardFilterRequest = !hasMeaningfulKeywords && !hasGoal;

            if (onlyHardFilterRequest || score >= MIN_RELEVANT_SCORE) {
                scoredCourses.add(new ScoredCourse(course, score));
            }
        }

        return scoredCourses.stream()
                .sorted((a, b) -> Integer.compare(b.score(), a.score()))
                .toList();
    }

    private int scoreCourse(
            Course course,
            CourseSearchIntent intent,
            String userMessage
    ) {
        String title = normalize(course.getTitle());
        String shortDescription = normalize(course.getShortDescription());
        String description = normalize(course.getDescription());
        String courseType = normalize(course.getCourseType());
        String levelName = course.getLevel() != null
                ? normalize(course.getLevel().getLevelName())
                : "";

        String allText = title + " " + shortDescription + " " + description + " " + courseType + " " + levelName;

        int score = 0;

        if (intent.courseType() != null
                && course.getCourseType() != null
                && intent.courseType().equalsIgnoreCase(course.getCourseType())) {
            score += 25;
        }

        if (intent.level() != null
                && course.getLevel() != null
                && normalize(course.getLevel().getLevelName()).contains(normalize(intent.level()))) {
            score += 20;
        }

        for (String keyword : intent.keywords()) {
            String kw = normalize(keyword);

            if (kw.isBlank()) {
                continue;
            }

            if (title.contains(kw)) {
                score += 30;
            }

            if (shortDescription.contains(kw)) {
                score += 22;
            }

            if (description.contains(kw)) {
                score += 14;
            }

            if (levelName.contains(kw)) {
                score += 10;
            }

            for (String token : kw.split("\\s+")) {
                if (token.length() >= 3) {
                    if (title.contains(token)) {
                        score += 8;
                    }

                    if (shortDescription.contains(token)) {
                        score += 5;
                    }

                    if (description.contains(token)) {
                        score += 3;
                    }
                }
            }
        }

        if (intent.goal() != null) {
            String goal = normalize(intent.goal());

            if (allText.contains(goal)) {
                score += 20;
            }

            for (String token : goal.split("[,\\s]+")) {
                if (token.length() >= 3 && allText.contains(token)) {
                    score += 6;
                }
            }
        }

        return Math.min(Math.max(score, 1), 100);
    }

    private List<AiSelectedCourse> selectBestCoursesByAi(
            String userMessage,
            CourseSearchIntent intent,
            List<ScoredCourse> candidates
    ) {
        try {
            if (candidates.isEmpty()) {
                return List.of();
            }

            String candidateText = candidates.stream()
                    .map(item -> buildCourseCandidateText(item.course(), item.score()))
                    .collect(Collectors.joining("\n---\n"));

            String prompt = """
                    Bạn là AI đánh giá khóa học tiếng Anh phù hợp.

                    Nhiệm vụ:
                    - Dựa trên yêu cầu học viên và danh sách khóa học ứng viên đã được backend lọc.
                    - Chọn tối đa %d khóa học phù hợp nhất.
                    - Chỉ được chọn courseId có trong danh sách ứng viên.
                    - Nếu không có khóa nào thật sự phù hợp thì trả courses = [].
                    - Không bịa courseId.
                    - Không chọn khóa sai loại FREE/PAID hoặc sai giá.
                    - Không chọn khóa không liên quan đến mục tiêu học.
                    - Trả về JSON hợp lệ.
                    - Không markdown.
                    - Không giải thích ngoài JSON.

                    Yêu cầu học viên:
                    "%s"

                    Điều kiện đã phân tích:
                    - keywords: %s
                    - goal: %s
                    - level: %s
                    - courseType: %s
                    - minPrice: %s
                    - maxPrice: %s

                    Danh sách khóa học ứng viên:
                    %s

                    Format:
                    {
                      "courses": [
                        {
                          "courseId": 1,
                          "matchScore": 95,
                          "reason": "Lý do phù hợp ngắn gọn bằng tiếng Việt"
                        }
                      ]
                    }

                    Quy tắc:
                    - matchScore từ 50 đến 100.
                    - Nếu học viên hỏi "dưới 5k học ngữ pháp", chỉ chọn khóa có giá <= 5000 và có nội dung ngữ pháp.
                    - Nếu học viên hỏi FREE, chỉ chọn khóa FREE.
                    - Nếu học viên hỏi PAID, chỉ chọn khóa PAID.
                    - Nếu mục tiêu là ngữ pháp, không chọn khóa chỉ nói giao tiếp nếu không có nội dung ngữ pháp.
                    - Nếu mục tiêu là giao tiếp, không chọn khóa chỉ nói ngữ pháp nếu không có nội dung giao tiếp.
                    """.formatted(
                    MAX_RESULTS,
                    userMessage,
                    intent.keywords(),
                    intent.goal() == null ? "Không rõ" : intent.goal(),
                    intent.level() == null ? "Không rõ" : intent.level(),
                    intent.courseType() == null ? "Không rõ" : intent.courseType(),
                    intent.minPrice() == null ? "Không rõ" : intent.minPrice(),
                    intent.maxPrice() == null ? "Không rõ" : intent.maxPrice(),
                    candidateText
            );

            String aiResponse = callGemini(prompt);

            JsonNode root = parseJsonFromAi(aiResponse);

            JsonNode coursesNode = root.path("courses");

            if (!coursesNode.isArray()) {
                return List.of();
            }

            Set<Long> allowedIds = candidates.stream()
                    .map(item -> item.course().getCourseId())
                    .collect(Collectors.toSet());

            List<AiSelectedCourse> selectedCourses = new ArrayList<>();

            for (JsonNode item : coursesNode) {
                Long courseId = item.path("courseId").isNumber()
                        ? item.path("courseId").asLong()
                        : null;

                if (courseId == null || !allowedIds.contains(courseId)) {
                    continue;
                }

                int matchScore = item.path("matchScore").asInt(70);
                String reason = item.path("reason").asText("Phù hợp với nhu cầu học của bạn.");

                selectedCourses.add(new AiSelectedCourse(
                        courseId,
                        Math.min(Math.max(matchScore, 50), 100),
                        reason
                ));
            }

            return selectedCourses.stream()
                    .sorted((a, b) -> Integer.compare(b.matchScore(), a.matchScore()))
                    .limit(MAX_RESULTS)
                    .toList();

        } catch (Exception e) {
            return List.of();
        }
    }

    private List<RecommendedCourseItem> mapAiSelectedCourses(
            List<AiSelectedCourse> selectedCourses,
            List<ScoredCourse> candidates
    ) {
        Map<Long, ScoredCourse> courseMap = candidates.stream()
                .collect(Collectors.toMap(
                        item -> item.course().getCourseId(),
                        item -> item,
                        (oldValue, newValue) -> oldValue
                ));

        List<RecommendedCourseItem> result = new ArrayList<>();

        for (AiSelectedCourse selected : selectedCourses) {
            ScoredCourse scoredCourse = courseMap.get(selected.courseId());

            if (scoredCourse == null) {
                continue;
            }

            result.add(toRecommendedCourseItem(
                    scoredCourse.course(),
                    selected.matchScore(),
                    selected.reason()
            ));
        }

        return result;
    }

    private RecommendedCourseItem toRecommendedCourseItem(
            Course course,
            int matchScore,
            String reason
    ) {
        return RecommendedCourseItem.builder()
                .courseId(course.getCourseId())
                .title(course.getTitle())
                .shortDescription(
                        course.getShortDescription() != null && !course.getShortDescription().isBlank()
                                ? course.getShortDescription()
                                : course.getDescription()
                )
                .thumbnailUrl(course.getThumbnailUrl())
                .levelName(course.getLevel() != null ? course.getLevel().getLevelName() : null)
                .price(course.getPrice())
                .courseType(course.getCourseType())
                .matchScore(matchScore)
                .reason(reason)
                .build();
    }

    private String buildCourseCandidateText(Course course, int backendScore) {
        return """
                courseId: %s
                backendScore: %s
                title: %s
                level: %s
                courseType: %s
                price: %s
                shortDescription: %s
                description: %s
                """.formatted(
                course.getCourseId(),
                backendScore,
                safe(course.getTitle()),
                course.getLevel() != null ? safe(course.getLevel().getLevelName()) : "Không rõ",
                safe(course.getCourseType()),
                course.getPrice() != null ? course.getPrice() : BigDecimal.ZERO,
                limitText(safe(course.getShortDescription()), 300),
                limitText(safe(course.getDescription()), 700)
        );
    }

    private String buildBackendReason(Course course, CourseSearchIntent intent) {
        if ("FREE".equalsIgnoreCase(intent.courseType())) {
            return "Đây là khóa học miễn phí, phù hợp với yêu cầu của bạn.";
        }

        if ("PAID".equalsIgnoreCase(intent.courseType())) {
            return "Đây là khóa học trả phí, phù hợp với yêu cầu của bạn.";
        }

        if (intent.maxPrice() != null) {
            return "Khóa học nằm trong mức giá bạn yêu cầu.";
        }

        if (intent.level() != null && course.getLevel() != null) {
            return "Khóa học phù hợp với trình độ " + course.getLevel().getLevelName() + ".";
        }

        if (intent.goal() != null) {
            return "Khóa học có nội dung liên quan đến mục tiêu: " + intent.goal() + ".";
        }

        return "Khóa học phù hợp với nhu cầu học bạn mô tả.";
    }

    private String buildNoCourseMessage(CourseSearchIntent intent) {
        if ("FREE".equalsIgnoreCase(intent.courseType())) {
            return "Hiện chưa có khóa học miễn phí phù hợp với yêu cầu của bạn.";
        }

        if ("PAID".equalsIgnoreCase(intent.courseType())) {
            return "Hiện chưa có khóa học trả phí phù hợp với yêu cầu của bạn.";
        }

        if (intent.maxPrice() != null && intent.goal() != null) {
            return "Hiện chưa có khóa học phù hợp với mục tiêu \"" + intent.goal()
                    + "\" trong mức giá bạn yêu cầu.";
        }

        if (intent.maxPrice() != null) {
            return "Hiện chưa có khóa học phù hợp trong mức giá bạn yêu cầu.";
        }

        if (intent.goal() != null) {
            return "Hiện chưa có khóa học phù hợp với mục tiêu \"" + intent.goal() + "\".";
        }

        return "Hiện chưa tìm thấy khóa học phù hợp. Bạn thử mô tả rõ hơn mục tiêu học, trình độ hoặc mức giá mong muốn nhé.";
    }

    private void saveSuggestHistory(
            Long userId,
            String userMessage,
            CourseRecommendationResponse response
    ) {
        AiChatHistory history = AiChatHistory.builder()
                .userId(userId)
                .userMessage(userMessage == null ? "" : userMessage)
                .aiResponse(toJsonString(response))
                .createdAt(LocalDateTime.now())
                .type(SUGGEST_TYPE)
                .build();

        aiChatHistoryRepository.save(history);
    }

    private String toJsonString(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return String.valueOf(value);
        }
    }

    private CourseRecommendationResponse emptyResponse(String message) {
        return CourseRecommendationResponse.builder()
                .message(message)
                .courses(List.of())
                .build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Người dùng chưa đăng nhập");
        }

        String username = authentication.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    private String callGemini(String prompt) throws Exception {
        Map<String, Object> textPart = Map.of("text", prompt);

        Map<String, Object> content = Map.of("parts", List.of(textPart));

        Map<String, Object> requestBody = Map.of("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        String fullUrl = url + "?key=" + apiKey;

        ResponseEntity<String> response = restTemplate.exchange(
                fullUrl,
                HttpMethod.POST,
                entity,
                String.class
        );

        String responseBody = response.getBody();

        if (responseBody == null || responseBody.isBlank()) {
            throw new RuntimeException("Gemini không trả dữ liệu");
        }

        JsonNode body = objectMapper.readTree(responseBody);

        JsonNode candidates = body.path("candidates");

        if (!candidates.isArray() || candidates.isEmpty()) {
            throw new RuntimeException("Gemini không trả candidates: " + responseBody);
        }

        JsonNode parts = candidates
                .get(0)
                .path("content")
                .path("parts");

        if (!parts.isArray() || parts.isEmpty()) {
            throw new RuntimeException("Gemini không trả parts: " + responseBody);
        }

        JsonNode textNode = parts.get(0).path("text");

        if (textNode.isMissingNode() || textNode.asText().isBlank()) {
            throw new RuntimeException("Gemini không trả text: " + responseBody);
        }

        return textNode.asText();
    }

    private JsonNode parseJsonFromAi(String aiResponse) throws Exception {
        return objectMapper.readTree(extractJson(aiResponse));
    }

    private String extractJson(String text) {
        if (text == null || text.isBlank()) {
            return "{}";
        }

        String cleaned = text.trim();

        if (cleaned.startsWith("```")) {
            cleaned = cleaned
                    .replaceFirst("^```json", "")
                    .replaceFirst("^```", "")
                    .replaceFirst("```$", "")
                    .trim();
        }

        int start = cleaned.indexOf("{");
        int end = cleaned.lastIndexOf("}");

        if (start >= 0 && end > start) {
            return cleaned.substring(start, end + 1);
        }

        return cleaned;
    }

    private BigDecimal getNullableBigDecimal(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }

        if (node.isNumber()) {
            return node.decimalValue();
        }

        String text = node.asText(null);

        if (text == null || text.isBlank() || text.equalsIgnoreCase("null")) {
            return null;
        }

        try {
            return new BigDecimal(text.trim());
        } catch (Exception e) {
            return null;
        }
    }

    private String normalizeCourseType(String value) {
        String cleaned = cleanNullableText(value);

        if (cleaned == null) {
            return null;
        }

        if (cleaned.equalsIgnoreCase("FREE")) {
            return "FREE";
        }

        if (cleaned.equalsIgnoreCase("PAID")) {
            return "PAID";
        }

        return null;
    }

    private List<String> normalizeKeywords(List<String> keywords) {
        return keywords.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .map(item -> limitText(item, 80))
                .distinct()
                .limit(12)
                .toList();
    }

    private String cleanNullableText(String value) {
        if (value == null) {
            return null;
        }

        String cleaned = value.trim();

        if (cleaned.isBlank()
                || cleaned.equalsIgnoreCase("null")
                || cleaned.equalsIgnoreCase("không rõ")
                || cleaned.equalsIgnoreCase("none")) {
            return null;
        }

        return cleaned;
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }

        return value.trim().toLowerCase(Locale.ROOT);
    }

    private String limitText(String value, int maxLength) {
        if (value == null) {
            return "";
        }

        if (value.length() <= maxLength) {
            return value;
        }

        return value.substring(0, maxLength);
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private record CourseSearchIntent(
            boolean courseRecommendationRequest,
            List<String> keywords,
            String level,
            String goal,
            String courseType,
            BigDecimal minPrice,
            BigDecimal maxPrice
    ) {
    }

    private record ScoredCourse(
            Course course,
            int score
    ) {
    }

    private record AiSelectedCourse(
            Long courseId,
            int matchScore,
            String reason
    ) {
    }
}