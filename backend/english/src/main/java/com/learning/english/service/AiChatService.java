package com.learning.english.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learning.english.entity.AiChatHistory;
import com.learning.english.entity.User;
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
            String summary = getLatestSummary(user.getUserId());

            List<AiChatHistory> recentMessages = getRecentMessages(user.getUserId());

            String prompt = buildMainPrompt(summary, recentMessages, question);

            String aiAnswer = callGemini(prompt);

            saveChatHistory(user.getUserId(), question, aiAnswer);

            updateSummaryIfNeeded(user.getUserId());

            return aiAnswer;

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xử lý AI chat: " + e.getMessage(), e);
        }
    }

    private String getLatestSummary(Long userId) {
        return aiChatHistoryRepository
                .findTopByUserIdAndUserMessageOrderByCreatedAtDesc(userId, SUMMARY_MESSAGE)
                .map(AiChatHistory::getAiResponse)
                .orElse("");
    }

    private List<AiChatHistory> getRecentMessages(Long userId) {
        List<AiChatHistory> messages =
                aiChatHistoryRepository.findTop5ByUserIdAndUserMessageNotOrderByCreatedAtDesc(
                        userId,
                        SUMMARY_MESSAGE
                );

        Collections.reverse(messages);

        return messages;
    }

    private List<AiChatHistory> getRecentMessagesForSummary(Long userId) {
        List<AiChatHistory> messages =
                aiChatHistoryRepository.findTop20ByUserIdAndUserMessageNotOrderByCreatedAtDesc(
                        userId,
                        SUMMARY_MESSAGE
                );

        Collections.reverse(messages);

        return messages;
    }

    private void saveChatHistory(Long userId, String question, String aiAnswer) {
        AiChatHistory history = AiChatHistory.builder()
        		.aiResponse(aiAnswer)
        		.userId(userId)
        		.userMessage(question)
        		.createdAt(LocalDateTime.now())
        		.build();
        aiChatHistoryRepository.save(history);
    }

    private void saveSummary(Long userId, String summary) {
        AiChatHistory summaryHistory = AiChatHistory.builder()
                .userId(userId)
                .userMessage("SUMMARY_MESSAGE")
                .aiResponse(summary)
                .createdAt(LocalDateTime.now()).build();
                
        

        aiChatHistoryRepository.save(summaryHistory);
    }

    private void updateSummaryIfNeeded(Long userId) throws Exception {
        long totalRealMessages = aiChatHistoryRepository.countByUserIdAndUserMessageNot(
                userId,
                SUMMARY_MESSAGE
        );

        // Cứ mỗi 10 lượt chat thật thì nén lại 1 lần
        if (totalRealMessages == 0 || totalRealMessages % 10 != 0) {
            return;
        }

        String oldSummary = getLatestSummary(userId);

        List<AiChatHistory> recentMessages = getRecentMessagesForSummary(userId);

        StringBuilder historyText = new StringBuilder();

        for (AiChatHistory item : recentMessages) {
            historyText.append("User: ")
                    .append(item.getUserMessage())
                    .append("\n");

            historyText.append("AI: ")
                    .append(item.getAiResponse())
                    .append("\n\n");
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
                """.formatted(
                oldSummary == null || oldSummary.isBlank() ? "Chưa có." : oldSummary,
                historyText.toString()
        );

        String newSummary = callGemini(summaryPrompt);

        saveSummary(userId, newSummary);
    }

    private String buildMainPrompt(
            String summary,
            List<AiChatHistory> recentMessages,
            String currentQuestion
    ) {
        StringBuilder historyText = new StringBuilder();

        for (AiChatHistory item : recentMessages) {
            historyText.append("User: ")
                    .append(item.getUserMessage())
                    .append("\n");

            historyText.append("AI: ")
                    .append(item.getAiResponse())
                    .append("\n\n");
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
                """.formatted(
                summary == null || summary.isBlank() ? "Chưa có ngữ cảnh trước đó." : summary,
                historyText.isEmpty() ? "Chưa có hội thoại gần đây." : historyText.toString(),
                currentQuestion
        );
    }

    private String callGemini(String prompt) throws Exception {
        Map<String, Object> textPart = Map.of(
                "text",
                prompt
        );

        Map<String, Object> content = Map.of(
                "parts",
                List.of(textPart)
        );

        Map<String, Object> requestBody = Map.of(
                "contents",
                List.of(content)
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(requestBody, headers);

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
}