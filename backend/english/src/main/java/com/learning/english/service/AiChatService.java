package com.learning.english.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AiChatService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String url;

    private final RestTemplate restTemplate = new RestTemplate();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String askQuestion(String question) {
        String prompt = """
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

                Câu hỏi của học viên:
                """ + question;

        Map<String, Object> textPart = Map.of(
                "text", prompt
        );

        Map<String, Object> content = Map.of(
                "parts", List.of(textPart)
        );

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(content)
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(requestBody, headers);

        String fullUrl = url + "?key=" + apiKey;

        try {
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

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi gọi Gemini API: " + e.getMessage(), e);
        }
    }
}