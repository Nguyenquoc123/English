package com.learning.english.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.learning.english.dto.request.AiGeneratedPracticeJson;
import com.learning.english.dto.request.CreatePersonalPracticeAiRequest;
import com.learning.english.dto.request.GeminiRequest;
import com.learning.english.dto.response.GeminiResponse;
import com.learning.english.dto.response.PersonalPracticeResponse;
import com.learning.english.dto.response.PracticeQuestionResponse;
import com.learning.english.dto.response.QuestionOptionResponse;
import com.learning.english.dto.response.QuestionResponse;
import com.learning.english.entity.PersonalPractice;
import com.learning.english.entity.Question;
import com.learning.english.entity.QuestionOption;
import com.learning.english.entity.User;
import com.learning.english.mapper.PersonalPracticeMapper;
import com.learning.english.mapper.PracticeConfigMapper;
import com.learning.english.mapper.QuestionMapper;
import com.learning.english.repository.PersonalPracticeRepository;
import com.learning.english.repository.QuestionOptionRepository;
import com.learning.english.repository.QuestionRepository;
import com.learning.english.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class PersonalPracticeService {
	@Autowired
	PersonalPracticeRepository personalPracticeRepository;

	@Value("${gemini.api.key}")
	private String geminiApiKey;

	@Value("${gemini.api.url}")
	private String geminiApiUrl;

	@Autowired
	QuestionRepository questionRepository;

	@Autowired
	QuestionOptionRepository questionOptionRepository;

	@Autowired
	UserRepository userRepository;

	@Autowired
	PersonalPracticeMapper personalPracticeMapper;

	@Autowired
	PracticeConfigMapper practiceConfigMapper;

	private final ObjectMapper objectMapper = new ObjectMapper();
	private final RestTemplate restTemplate = new RestTemplate();

	public List<PersonalPracticeResponse> layDanhSachBaiOnTap(String keyword, String type) {
		User user = getCurrentUser();
		return personalPracticeRepository.findPersonalPractices(user.getUserId(), keyword, type).stream()
				.map(personalPracticeMapper::toPersonalPracticeResponse).toList();
	}

	public List<PracticeQuestionResponse> layDSCauHoiBaiOnTapCaNhan(Long personalPracticeId) {
		PersonalPractice personalPractice = personalPracticeRepository.findById(personalPracticeId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy bài ôn tập"));
		User user = getCurrentUser();
		if(user.getUserId() != personalPractice.getUser().getUserId())
			throw new RuntimeException("Bạn không có quyền truy cập bài ôn tập này");
		
		return questionRepository.findByPersonalPractice_PersonalPracticeId(personalPracticeId).stream()
				.map(practiceConfigMapper::toPracticeQuestionResponse).toList();
	}

	@Transactional
	public PersonalPracticeResponse taoBaiOnTapBangAi(CreatePersonalPracticeAiRequest request) {
		validateQuestionType(request.getType());

		String aiJsonText = callGeminiForQuestions(request);

		AiGeneratedPracticeJson generatedJson = parseAiJson(aiJsonText);

		User user = getCurrentUser();

		if (generatedJson.getQuestions() == null || generatedJson.getQuestions().isEmpty()) {
			throw new RuntimeException("AI không tạo được câu hỏi phù hợp.");
		}

		PersonalPractice practice = personalPracticeRepository.save(PersonalPractice.builder().user(user)
				.title(request.getTitle()).type(request.getType()).questionLimit(request.getQuestionLimit())
				.status("ACTIVE").createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build());

		List<QuestionResponse> questionResponses = new ArrayList<>();

		int limit = Math.min(request.getQuestionLimit(), generatedJson.getQuestions().size());

		for (int i = 0; i < limit; i++) {
			AiGeneratedPracticeJson.AiQuestion aiQuestion = generatedJson.getQuestions().get(i);

			String questionType = aiQuestion.getQuestionType();

			if (questionType == null || questionType.isBlank()) {
				questionType = request.getType();
			}

			validateQuestionType(questionType);

			Question savedQuestion = questionRepository
					.save(Question.builder().personalPractice(practice).createdBy(user).questionType(questionType)
							.content(aiQuestion.getContent()).correctText(aiQuestion.getCorrectText())
							.explanation(aiQuestion.getExplanation()).defaultPoint(BigDecimal.ONE).status("Published")
							.sourceType("AI").createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build());

			List<QuestionOptionResponse> optionResponses = new ArrayList<>();

			if (aiQuestion.getOptions() != null && !aiQuestion.getOptions().isEmpty()) {

				for (AiGeneratedPracticeJson.AiOption aiOption : aiQuestion.getOptions()) {
					QuestionOption savedOption = questionOptionRepository
							.save(QuestionOption.builder().question(savedQuestion).optionText(aiOption.getOptionText())
									.isCorrect(Boolean.TRUE.equals(aiOption.getIsCorrect()))
									.createdAt(LocalDateTime.now()).build());

					optionResponses.add(QuestionOptionResponse.builder().optionId(savedOption.getOptionId())
							.optionText(savedOption.getOptionText()).isCorrect(savedOption.getIsCorrect()).build());

				}
			}

			questionResponses.add(QuestionResponse.builder().questionId(savedQuestion.getQuestionId())
					.questionType(savedQuestion.getQuestionType()).content(savedQuestion.getContent())
					.correctText(savedQuestion.getCorrectText()).explanation(savedQuestion.getExplanation())
					.options(optionResponses).build());
		}

		return PersonalPracticeResponse.builder().personalPracticeId(practice.getPersonalPracticeId())
				.userId(practice.getUser().getUserId()).title(practice.getTitle())
				.questionLimit(practice.getQuestionLimit()).type(practice.getType()).status(practice.getStatus())
				.createdAt(practice.getCreatedAt())
//                .questions(questionResponses)
				.build();
	}

	private String callGeminiForQuestions(CreatePersonalPracticeAiRequest request) throws RestClientException {
		String prompt = buildPrompt(request);

		GeminiRequest requestBody = GeminiRequest.builder()
				.systemInstruction(
						GeminiRequest.SystemInstruction.builder().parts(List.of(GeminiRequest.Part.builder().text("""
								Bạn là AI tạo câu hỏi ôn tập tiếng Anh.
								Chỉ trả về JSON hợp lệ.
								Không giải thích bên ngoài JSON.
								Không dùng markdown.
								Không dùng ```json.
								""").build())).build())
				.contents(List.of(GeminiRequest.Content.builder().role("user")
						.parts(List.of(GeminiRequest.Part.builder().text(prompt).build())).build()))
				.generationConfig(
						GeminiRequest.GenerationConfig.builder().temperature(0.5).maxOutputTokens(3000).build())
				.build();

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		headers.set("x-goog-api-key", geminiApiKey);

		HttpEntity<GeminiRequest> entity = new HttpEntity<>(requestBody, headers);

		ResponseEntity<GeminiResponse> response = restTemplate.exchange(geminiApiUrl, HttpMethod.POST, entity,
				GeminiResponse.class);

		GeminiResponse body = response.getBody();

		if (body == null || body.getCandidates() == null || body.getCandidates().isEmpty()
				|| body.getCandidates().get(0).getContent() == null
				|| body.getCandidates().get(0).getContent().getParts() == null
				|| body.getCandidates().get(0).getContent().getParts().isEmpty()) {
			throw new RuntimeException("Gemini không trả về dữ liệu câu hỏi.");
		}

		return body.getCandidates().get(0).getContent().getParts().get(0).getText();
	}

	private String buildPrompt(CreatePersonalPracticeAiRequest request) {
		return """
				Hãy tạo bài ôn tập tiếng Anh theo thông tin sau:

				Tên bài: %s
				Dạng câu hỏi: %s
				Số lượng câu hỏi: %d
				Mô tả nội dung: %s

				Yêu cầu JSON trả về đúng format sau:

				{
				  "questions": [
				    {
				      "questionType": "%s",
				      "content": "Nội dung câu hỏi",
				      "correctText": "Đáp án đúng dạng text",
				      "explanation": "Giải thích ngắn gọn bằng tiếng Việt",
				      "options": [
				        {
				          "optionText": "Đáp án A",
				          "isCorrect": false
				        },
				        {
				          "optionText": "Đáp án B",
				          "isCorrect": true
				        },
				        {
				          "optionText": "Đáp án C",
				          "isCorrect": false
				        },
				        {
				          "optionText": "Đáp án D",
				          "isCorrect": false
				        }
				      ]
				    }
				  ]
				}

				Quy tắc:
				- Chỉ trả về JSON hợp lệ.
				- Không thêm chữ giải thích ngoài JSON.
				- questionType phải là: %s.
				- Nếu dạng MULTIPLE_CHOICE hoặc LISTENING_CHOICE thì mỗi câu phải có 4 options và đúng 1 đáp án isCorrect=true.
				- Nếu dạng WRITING_SHORT thì options là [] và correctText là câu trả lời mẫu.
				- Nếu dạng ARRANGE_SENTENCE thì content là câu bị xáo trộn, correctText là câu đúng.
				- Nếu dạng LISTENING_FILL_BLANK thì content có chỗ trống bằng ký hiệu ____.
				- explanation viết bằng tiếng Việt dễ hiểu.
				"""
				.formatted(request.getTitle(), request.getType(), request.getQuestionLimit(), request.getDescription(),
						request.getType(), request.getType());
	}

	private AiGeneratedPracticeJson parseAiJson(String aiText) {
		try {
			String cleanedJson = aiText.replace("```json", "").replace("```", "").trim();

			return objectMapper.readValue(cleanedJson, AiGeneratedPracticeJson.class);
		} catch (Exception e) {
			throw new RuntimeException("AI trả về JSON không hợp lệ. Vui lòng thử lại.");
		}
	}

	private void validateQuestionType(String type) {
		List<String> validTypes = List.of("MULTIPLE_CHOICE", "LISTENING_CHOICE", "LISTENING_FILL_BLANK",
				"ARRANGE_SENTENCE", "WRITING_SHORT");

		if (!validTypes.contains(type)) {
			throw new RuntimeException("Dạng câu hỏi không hợp lệ: " + type);
		}
	}

	private User getCurrentUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()
				|| "anonymousUser".equals(authentication.getName())) {
			throw new RuntimeException("Người dùng chưa đăng nhập");
		}

		String username = authentication.getName();

		return userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
	}
}
