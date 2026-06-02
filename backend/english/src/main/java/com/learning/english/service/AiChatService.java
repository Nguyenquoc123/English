package com.learning.english.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learning.english.dto.response.AiChatHistoryPageResponse;
import com.learning.english.dto.response.AiChatMessageResponse;
import com.learning.english.dto.response.AiCourseHistoryPageResponse;
import com.learning.english.dto.response.AiCourseRecommendationHistoryResponse;
import com.learning.english.entity.AiChatHistory;
import com.learning.english.entity.User;
import com.learning.english.mapper.AiChatHistoryMapper;
import com.learning.english.mapper.AiCourseHistoryMapper;
import com.learning.english.repository.AiChatHistoryRepository;
import com.learning.english.repository.UserRepository;

@Service
public class AiChatService {

	private static final String SUMMARY_MESSAGE = "__SUMMARY__";

	@Value("${gemini.api.key}")
	private String apiKey;

	@Value("${gemini.api.url}")
	private String url;

	private final RestTemplate restTemplate = new RestTemplate();

	private final ObjectMapper objectMapper = new ObjectMapper();

	@Autowired
	AiChatHistoryRepository aiChatHistoryRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private SystemSettingService systemSettingService;

	@Autowired
	AiChatHistoryMapper aiChatHistoryMapper;
	
	@Autowired
	AiCourseHistoryMapper aiCourseHistoryMapper;

	private static final String CHAT_TYPE = "chat";
	private static final int DEFAULT_LIMIT = 10;
	private static final int MAX_LIMIT = 50;
	private static final String COURSE_TYPE = "suggest";
	
	public AiCourseHistoryPageResponse getCourseHistory(Long beforeChatId, Integer limit) {
		User user = getCurrentUser();
        int safeLimit = normalizeLimit(limit);

        Pageable pageable = PageRequest.of(0, safeLimit + 1);

        List<AiChatHistory> histories;

        if (beforeChatId == null) {
            histories = aiChatHistoryRepository.findByUserIdAndTypeOrderByChatIdDesc(
                    user.getUserId(),
                    COURSE_TYPE,
                    pageable
            );
        } else {
            histories = aiChatHistoryRepository.findByUserIdAndTypeAndChatIdLessThanOrderByChatIdDesc(
                    user.getUserId(),
                    COURSE_TYPE,
                    beforeChatId,
                    pageable
            );
        }

        boolean hasMore = histories.size() > safeLimit;

        if (hasMore) {
            histories = histories.subList(0, safeLimit);
        }

        Collections.reverse(histories);

        List<AiCourseRecommendationHistoryResponse> messages =
                aiCourseHistoryMapper.toMessageResponses(histories);

        Long nextCursor = null;

        if (!histories.isEmpty()) {
            nextCursor = histories.get(0).getChatId();
        }

        return AiCourseHistoryPageResponse.builder()
                .messages(messages)
                .nextCursor(nextCursor)
                .hasMore(hasMore)
                .build();
    }

    
	public AiChatHistoryPageResponse getChatHistory(Long beforeChatId, Integer limit) {
		User user = getCurrentUser();
		int safeLimit = normalizeLimit(limit);

		Pageable pageable = PageRequest.of(0, safeLimit + 1);

		List<AiChatHistory> histories;

		if (beforeChatId == null) {
			histories = aiChatHistoryRepository.findByUserIdAndTypeOrderByChatIdDesc(user.getUserId(), CHAT_TYPE,
					pageable);
		} else {
			histories = aiChatHistoryRepository.findByUserIdAndTypeAndChatIdLessThanOrderByChatIdDesc(user.getUserId(),
					CHAT_TYPE, beforeChatId, pageable);
		}

		boolean hasMore = histories.size() > safeLimit;

		if (hasMore) {
			histories = histories.subList(0, safeLimit);
		}

		Collections.reverse(histories);

		List<AiChatMessageResponse> messages = aiChatHistoryMapper.toMessageResponses(histories);

		Long nextCursor = null;

		if (!histories.isEmpty()) {
			nextCursor = histories.get(0).getChatId();
		}

		return AiChatHistoryPageResponse.builder().messages(messages).nextCursor(nextCursor).hasMore(hasMore).build();
	}

	private int normalizeLimit(Integer limit) {
		if (limit == null || limit <= 0) {
			return DEFAULT_LIMIT;
		}

		return Math.min(limit, MAX_LIMIT);
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

	public String askQuestion(String question) {
		try {
			User user = getCurrentUser();

			checkAiDailyLimit(user);

			String summary = getLatestSummary(user.getUserId());

			List<AiChatHistory> recentMessages = getRecentMessages(user.getUserId());

			String prompt = buildMainPrompt(summary, recentMessages, question);

			String aiAnswer = callGemini(prompt);

			saveChatHistory(user.getUserId(), question, aiAnswer);

			updateSummaryIfNeeded(user.getUserId());

			return aiAnswer;

		} catch (Exception e) {
			throw new RuntimeException("Lỗi: " + e.getMessage(), e);
		}
	}

	private void checkAiDailyLimit(User user) {
		LocalDate today = LocalDate.now();

		LocalDateTime startOfDay = today.atStartOfDay();
		LocalDateTime endOfDay = today.plusDays(1).atStartOfDay().minusNanos(1);

		String roleName = user.getRole().getRoleName();

		int dailyLimit = systemSettingService.getAiDailyLimitByRole(roleName);

		long usedToday = aiChatHistoryRepository.countByUserIdAndUserMessageNotAndCreatedAtBetween(user.getUserId(),
				SUMMARY_MESSAGE, startOfDay, endOfDay);

		if (usedToday >= dailyLimit) {
			throw new RuntimeException("Bạn đã hết lượt sử dụng AI hôm nay.");
		}
	}

	private String getLatestSummary(Long userId) {
		return aiChatHistoryRepository.findTopByUserIdAndUserMessageOrderByCreatedAtDesc(userId, SUMMARY_MESSAGE)
				.map(AiChatHistory::getAiResponse).orElse("");
	}

	private List<AiChatHistory> getRecentMessages(Long userId) {
		List<AiChatHistory> messages = aiChatHistoryRepository.findTop5ByUserIdAndTypeOrderByCreatedAtDesc(userId,
				"chat");

		Collections.reverse(messages);

		return messages;
	}

	private List<AiChatHistory> getRecentMessagesForSummary(Long userId) {
		List<AiChatHistory> messages = aiChatHistoryRepository.findTop20ByUserIdAndTypeOrderByCreatedAtDesc(userId,
				"chat");

		Collections.reverse(messages);

		return messages;
	}

	private void saveChatHistory(Long userId, String question, String aiAnswer) {
		AiChatHistory history = AiChatHistory.builder().aiResponse(aiAnswer).userId(userId).userMessage(question)
				.createdAt(LocalDateTime.now()).type("chat").build();
		aiChatHistoryRepository.save(history);
	}

	private void saveSummary(Long userId, String summary) {
		AiChatHistory summaryHistory = AiChatHistory.builder().userId(userId).userMessage(SUMMARY_MESSAGE)
				.aiResponse(summary).createdAt(LocalDateTime.now()).build();

		aiChatHistoryRepository.save(summaryHistory);
	}

	private void updateSummaryIfNeeded(Long userId) throws Exception {
		long totalRealMessages = aiChatHistoryRepository.countByUserIdAndType(userId, "chat");

		// Cứ mỗi 10 lượt chat thật thì nén lại 1 lần
		if (totalRealMessages == 0 || totalRealMessages % 10 != 0) {
			return;
		}

		String oldSummary = getLatestSummary(userId);

		List<AiChatHistory> recentMessages = getRecentMessagesForSummary(userId);

		StringBuilder historyText = new StringBuilder();

		for (AiChatHistory item : recentMessages) {
			historyText.append("User: ").append(item.getUserMessage()).append("\n");

			historyText.append("AI: ").append(item.getAiResponse()).append("\n\n");
		}

		String summaryPrompt = """
				Hãy nén lịch sử hội thoại sau thành một bản tóm tắt ngắn gọn để AI dùng làm ngữ cảnh dài hạn.

				Yêu cầu:
				- Viết bằng tiếng Việt.
				- Chỉ giữ thông tin quan trọng cho việc học tiếng Anh.
				- Giữ chủ đề người học đang hỏi.
				- Giữ lỗi sai thường gặp của người học.
				- Giữ câu tiếng Anh quan trọng nếu cần.
				- Bỏ chào hỏi, cảm ơn, nội dung lặp lại.
				- Tối đa 1200 ký tự.
				- Không thêm thông tin không có trong hội thoại.

				Tóm tắt cũ:
				%s

				Hội thoại mới:
				%s

				Bản tóm tắt mới:
				""".formatted(oldSummary == null || oldSummary.isBlank() ? "Chưa có." : oldSummary,
				historyText.toString());

		String newSummary = callGemini(summaryPrompt);

		saveSummary(userId, newSummary);
	}

	private String buildMainPrompt(String summary, List<AiChatHistory> recentMessages, String currentQuestion) {
		StringBuilder historyText = new StringBuilder();

		for (AiChatHistory item : recentMessages) {
			historyText.append("User: ").append(item.getUserMessage()).append("\n");

			historyText.append("AI: ").append(item.getAiResponse()).append("\n\n");
		}

		return """
				Bạn là AI hỗ trợ học tiếng Anh cho website English Learning.

				Nhiệm vụ:
				- Trả lời các câu hỏi về tiếng Anh.
				- Giải thích ngữ pháp dễ hiểu.
				- Dịch câu Anh - Việt.
				- Giải thích từ vựng.
				- Đưa ví dụ đơn giản.
				- Hỗ trợ luyện viết và sửa lỗi tiếng Anh.

				Quy tắc:
				- Luôn trả lời bằng tiếng Việt.
				- Trình bày rõ ràng, dễ đọc.
				- Nếu có ví dụ thì xuống dòng.
				- Không trả lời các nội dung không liên quan đến học tiếng Anh.
				- Nếu người dùng hỏi ngoài phạm vi, hãy lịch sự từ chối.
				- Dùng ngữ cảnh trước đó khi người dùng nói: "câu đó", "ý trên", "nó", "tiếp tục", "ví dụ nữa".

				Tóm tắt ngữ cảnh trước đó:
				%s

				Hội thoại gần đây:
				%s

				Câu hỏi hiện tại của học viên:
				%s
				""".formatted(summary == null || summary.isBlank() ? "Chưa có ngữ cảnh trước đó." : summary,
				historyText.isEmpty() ? "Chưa có hội thoại gần đây." : historyText.toString(), currentQuestion);
	}

	private String callGemini(String prompt) throws Exception {
		Map<String, Object> textPart = Map.of("text", prompt);

		Map<String, Object> content = Map.of("parts", List.of(textPart));

		Map<String, Object> requestBody = Map.of("contents", List.of(content));

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);

		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

		String fullUrl = url + "?key=" + apiKey;

		ResponseEntity<String> response = restTemplate.exchange(fullUrl, HttpMethod.POST, entity, String.class);

		String responseBody = response.getBody();

		if (responseBody == null || responseBody.isBlank()) {
			throw new RuntimeException("Gemini không trả dữ liệu");
		}

		JsonNode body = objectMapper.readTree(responseBody);

		JsonNode candidates = body.path("candidates");

		if (!candidates.isArray() || candidates.isEmpty()) {
			throw new RuntimeException("Gemini không trả candidates: " + responseBody);
		}

		JsonNode parts = candidates.get(0).path("content").path("parts");

		if (!parts.isArray() || parts.isEmpty()) {
			throw new RuntimeException("Gemini không trả parts: " + responseBody);
		}

		JsonNode textNode = parts.get(0).path("text");

		if (textNode.isMissingNode() || textNode.asText().isBlank()) {
			throw new RuntimeException("Gemini không trả text: " + responseBody);
		}

		return textNode.asText();
	}
}