package com.learning.english.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learning.english.entity.Role;
import com.learning.english.entity.TeacherCertificate;
import com.learning.english.entity.TeacherProfile;
import com.learning.english.entity.User;
import com.learning.english.repository.RoleRepository;
import com.learning.english.repository.TeacherProfileRepository;
import com.learning.english.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TeacherAiReviewService {

    private final TeacherProfileRepository teacherProfileRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String ROOT_DIR = System.getProperty("user.dir") + "/uploads/";

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String url;

    @Transactional
    public void reviewTeacherProfileByAi(Long teacherProfileId) {
        TeacherProfile teacherProfile = teacherProfileRepository
                .findById(teacherProfileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ giáo viên"));

        if (!"PENDING".equalsIgnoreCase(teacherProfile.getApprovalStatus())) {
            return;
        }

        try {
            AiTeacherReviewResult aiResult = callAiReviewTeacherProfile(teacherProfile);

            applyAiResultToTeacherProfile(teacherProfile, aiResult);

        } catch (Exception e) {
            /*
             * Không reject khi AI lỗi.
             * Giữ PENDING để admin duyệt thủ công.
             */
            teacherProfile.setApprovalStatus("PENDING");
            teacherProfile.setRejectReason(null);
            teacherProfile.setUpdatedAt(LocalDateTime.now());

            teacherProfileRepository.save(teacherProfile);
        }
    }

    private AiTeacherReviewResult callAiReviewTeacherProfile(
            TeacherProfile teacherProfile
    ) throws Exception {
        String prompt = buildPrompt(teacherProfile);

        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(Map.of("text", prompt));

        if (teacherProfile.getCertificates() != null) {
            for (TeacherCertificate certificate : teacherProfile.getCertificates()) {
                Map<String, Object> imagePart = buildImagePart(certificate.getCertificateUrl());

                if (imagePart != null) {
                    parts.add(imagePart);
                }
            }
        }

        Map<String, Object> content = Map.of("parts", parts);

        Map<String, Object> requestBody = Map.of(
                "contents",
                List.of(content)
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url + "?key=" + apiKey,
                HttpMethod.POST,
                entity,
                String.class
        );

        String responseBody = response.getBody();

        if (responseBody == null || responseBody.isBlank()) {
            throw new RuntimeException("Gemini không trả dữ liệu");
        }

        String aiText = extractGeminiText(responseBody);

        JsonNode json = objectMapper.readTree(extractJson(aiText));

        int score = json.path("score").asInt(0);
        String reason = json.path("reason").asText("AI không cung cấp lý do");

        score = Math.max(0, Math.min(score, 100));

        String decision = decideByScore(score);

        return new AiTeacherReviewResult(
                score,
                decision,
                reason
        );
    }

    private String buildPrompt(TeacherProfile teacherProfile) {
        User user = teacherProfile.getUser();

        String fullName = user != null ? safe(user.getFullName()) : "";
        String email = user != null ? safe(user.getEmail()) : "";

        int certificateCount = teacherProfile.getCertificates() == null
                ? 0
                : teacherProfile.getCertificates().size();

        return """
                Bạn là AI hỗ trợ kiểm duyệt hồ sơ đăng ký giáo viên tiếng Anh.

                Nhiệm vụ:
                - Đánh giá hồ sơ giáo viên dựa trên bio, kinh nghiệm, thông tin cá nhân và ảnh chứng chỉ đính kèm.
                - Đánh giá chứng chỉ có vẻ liên quan đến tiếng Anh, ngoại ngữ, sư phạm, giảng dạy hoặc chứng nhận năng lực hay không.
                - Đây chỉ là duyệt sơ bộ tự động, không cần xác thực pháp lý tuyệt đối.
                - Không bịa thông tin ngoài dữ liệu được cung cấp.

                Chấm điểm từ 0 đến 100:
                - 0-30: hồ sơ không nghiêm túc, thiếu thông tin, chứng chỉ không rõ hoặc không liên quan.
                - 31-59: hồ sơ yếu, kinh nghiệm mơ hồ, chứng chỉ chưa đủ thuyết phục.
                - 60-79: hồ sơ có tiềm năng nhưng cần admin xem xét thêm.
                - 80-100: hồ sơ tốt, thông tin rõ ràng, kinh nghiệm phù hợp, chứng chỉ có vẻ hợp lệ.

                Quy tắc:
                - Nếu score >= 80: hệ thống sẽ duyệt tự động.
                - Nếu 60 <= score < 80: hệ thống sẽ giữ pending cho admin xem.
                - Nếu score < 60: hệ thống sẽ từ chối.
                - Lý do phải viết bằng tiếng Việt, ngắn gọn, lịch sự.

                Chỉ trả về JSON hợp lệ.
                Không markdown.
                Không giải thích ngoài JSON.

                Format:
                {
                  "score": 85,
                  "reason": "Hồ sơ có bio rõ ràng, kinh nghiệm phù hợp và chứng chỉ liên quan đến tiếng Anh."
                }

                Thông tin hồ sơ:
                - Họ tên: %s
                - Email: %s
                - Số điện thoại: %s
                - Bio: %s
                - Kinh nghiệm: %s
                - Số lượng ảnh chứng chỉ: %d
                """.formatted(
                fullName,
                email,
                safe(teacherProfile.getPhone()),
                safe(teacherProfile.getBio()),
                safe(teacherProfile.getExperience()),
                certificateCount
        );
    }

    private Map<String, Object> buildImagePart(String certificateUrl) {
        try {
            File file = resolveCertificateFile(certificateUrl);

            if (file == null || !file.exists() || !file.isFile()) {
                return null;
            }

            String mimeType = Files.probeContentType(file.toPath());

            if (mimeType == null) {
                mimeType = guessMimeType(file.getName());
            }

            if (mimeType == null || !mimeType.startsWith("image/")) {
                return null;
            }

            byte[] bytes = Files.readAllBytes(file.toPath());
            String base64 = Base64.getEncoder().encodeToString(bytes);

            return Map.of(
                    "inline_data",
                    Map.of(
                            "mime_type", mimeType,
                            "data", base64
                    )
            );

        } catch (Exception e) {
            return null;
        }
    }

    private File resolveCertificateFile(String certificateUrl) {
        if (certificateUrl == null || certificateUrl.isBlank()) {
            return null;
        }

        String path = certificateUrl.trim().replace("\\", "/");

        while (path.startsWith("/")) {
            path = path.substring(1);
        }

        /*
         * DB đang lưu: images/2cb63bc7-f365-4c94-8a1d-ac21d8089fa1.jfif
         * ROOT_DIR: project/uploads/
         * File thật: project/uploads/images/2cb63bc7-f365-4c94-8a1d-ac21d8089fa1.jfif
         */
        return new File(ROOT_DIR + path);
    }

    private String guessMimeType(String fileName) {
        String lower = fileName.toLowerCase(Locale.ROOT);

        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return "image/jpeg";
        }

        if (lower.endsWith(".jfif")) {
            return "image/jpeg";
        }

        if (lower.endsWith(".png")) {
            return "image/png";
        }

        if (lower.endsWith(".webp")) {
            return "image/webp";
        }

        return null;
    }

    private void applyAiResultToTeacherProfile(
            TeacherProfile teacherProfile,
            AiTeacherReviewResult aiResult
    ) {
        if (!"PENDING".equalsIgnoreCase(teacherProfile.getApprovalStatus())) {
            return;
        }

        if ("APPROVED".equalsIgnoreCase(aiResult.decision())) {
            approveTeacherProfileByAi(teacherProfile);
            return;
        }

        if ("REJECTED".equalsIgnoreCase(aiResult.decision())) {
            rejectTeacherProfileByAi(teacherProfile, aiResult.reason());
            return;
        }

        /*
         * 60-79: giữ PENDING cho admin xem.
         * Có thể lưu note vào rejectReason không nên, vì hồ sơ chưa bị reject.
         */
        teacherProfile.setApprovalStatus("PENDING");
        teacherProfile.setReviewedAt(null);
        teacherProfile.setReviewedBy(null);
        teacherProfile.setRejectReason(null);
        teacherProfile.setUpdatedAt(LocalDateTime.now());

        teacherProfileRepository.save(teacherProfile);
    }

    private void approveTeacherProfileByAi(TeacherProfile teacherProfile) {
        teacherProfile.setApprovalStatus("APPROVED");
        teacherProfile.setReviewedAt(LocalDateTime.now());
        teacherProfile.setReviewedBy(null);
        teacherProfile.setRejectReason(null);
        teacherProfile.setUpdatedAt(LocalDateTime.now());

        Role teacherRole = roleRepository.findByRoleName("teacher")
                .orElseThrow(() -> new RuntimeException("Không tìm thấy role teacher"));

        User user = teacherProfile.getUser();
        user.setRole(teacherRole);

        userRepository.save(user);
        teacherProfileRepository.save(teacherProfile);
    }

    private void rejectTeacherProfileByAi(
            TeacherProfile teacherProfile,
            String reason
    ) {
        teacherProfile.setApprovalStatus("REJECTED");
        teacherProfile.setReviewedAt(LocalDateTime.now());
        teacherProfile.setReviewedBy(null);
        teacherProfile.setRejectReason(
                reason == null || reason.isBlank()
                        ? "Hồ sơ chưa đạt yêu cầu duyệt tự động."
                        : reason
        );
        teacherProfile.setUpdatedAt(LocalDateTime.now());

        teacherProfileRepository.save(teacherProfile);
    }

    private String decideByScore(int score) {
        if (score >= 80) {
            return "APPROVED";
        }

        if (score >= 60) {
            return "PENDING";
        }

        return "REJECTED";
    }

    private String extractGeminiText(String responseBody) throws Exception {
        JsonNode body = objectMapper.readTree(responseBody);

        JsonNode candidates = body.path("candidates");

        if (!candidates.isArray() || candidates.isEmpty()) {
            throw new RuntimeException("Gemini không trả candidates");
        }

        JsonNode parts = candidates.get(0)
                .path("content")
                .path("parts");

        if (!parts.isArray() || parts.isEmpty()) {
            throw new RuntimeException("Gemini không trả parts");
        }

        JsonNode textNode = parts.get(0).path("text");

        if (textNode.isMissingNode() || textNode.asText().isBlank()) {
            throw new RuntimeException("Gemini không trả text");
        }

        return textNode.asText();
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

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private record AiTeacherReviewResult(
            int score,
            String decision,
            String reason
    ) {
    }
}