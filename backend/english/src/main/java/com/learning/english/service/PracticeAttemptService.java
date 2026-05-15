package com.learning.english.service;

import com.learning.english.dto.request.ExamSubmitRequest;
import com.learning.english.dto.request.PracticeAnswerRequest;
import com.learning.english.dto.request.PracticeSubmitRequest;
import com.learning.english.dto.response.PracticeSubmitResponse;
import com.learning.english.entity.*;
import com.learning.english.mapper.PracticeAttemptMapper;
import com.learning.english.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PracticeAttemptService {

	@Autowired
	private AttemptRepository attemptRepository;

	@Autowired
	private AttemptDetailRepository attemptDetailRepository;

	@Autowired
	private QuestionRepository questionRepository;

	@Autowired
	private LessonRepository lessonRepository;

	@Autowired
	private PracticeConfigRepository lessonPracticeConfigRepository;

	@Autowired
	private EnrollmentRepository enrollmentRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PracticeAttemptMapper practiceAttemptMapper;

	@Autowired
	ExamRepository examRepository;

	private static final Set<String> VALID_PRACTICE_TYPES = Set.of("MULTIPLE_CHOICE", "LISTENING_CHOICE",
			"LISTENING_FILL_BLANK", "ARRANGE_SENTENCE", "WRITING_SHORT", "FLASHCARD");

	@Transactional
	public PracticeSubmitResponse submitAttemptCore(User user, Lesson lesson, Exam exam, String practiceType,
			String attemptType, List<Question> questions, List<PracticeAnswerRequest> answers) {

		Map<Long, Question> questionMap = questions.stream()
				.collect(Collectors.toMap(Question::getQuestionId, Function.identity()));

		Map<Long, PracticeAnswerRequest> answerMap = answers.stream().filter(answer -> answer.getQuestionId() != null)
				.collect(Collectors.toMap(PracticeAnswerRequest::getQuestionId, Function.identity(),
						(oldValue, newValue) -> newValue));

		LocalDateTime now = LocalDateTime.now();

		Attempt attempt = Attempt.builder()

				.user(user)

				.lesson(lesson)

				.exam(exam)

				.attemptType(attemptType)

				.practiceType(practiceType)

				.startedAt(now)

				.submittedAt(now)

				.score(BigDecimal.ZERO)

				.totalCorrect(0)

				.totalQuestions(questions.size())

				.durationSeconds(null)

				.resultStatus("Completed")

				.createdAt(now)

				.build();

		Attempt savedAttempt = attemptRepository.save(attempt);

		List<AttemptDetail> details = new ArrayList<>();

		BigDecimal totalScore = BigDecimal.ZERO;

		int totalCorrect = 0;

		for (Question question : questions) {

			PracticeAnswerRequest answer = answerMap.get(question.getQuestionId());

			CheckAnswerResult checkResult = checkAnswer(question, answer);

			if (Boolean.TRUE.equals(checkResult.isCorrect())) {

				totalCorrect++;

				totalScore = totalScore.add(checkResult.earnedPoint());
			}

			AttemptDetail detail = AttemptDetail.builder()

					.attempt(savedAttempt)

					.question(question)

					.selectedOption(checkResult.selectedOption())

					.answerText(answer != null ? answer.getAnswerText() : null)

					.isCorrect(checkResult.isCorrect())

					.earnedPoint(checkResult.earnedPoint())

					.createdAt(now)

					.build();

			details.add(detail);
		}

		List<AttemptDetail> savedDetails = attemptDetailRepository.saveAll(details);

		savedAttempt.setScore(totalScore);

		savedAttempt.setTotalCorrect(totalCorrect);

		savedAttempt.setTotalQuestions(questions.size());

		savedAttempt.setResultStatus("Completed");

		savedAttempt.setSubmittedAt(now);

		Attempt finalAttempt = attemptRepository.save(savedAttempt);

		PracticeSubmitResponse response = practiceAttemptMapper.toPracticeSubmitResponse(finalAttempt);

		response.setDetails(practiceAttemptMapper.toPracticeSubmitDetailResponses(savedDetails));

		return response;
	}

//	@Transactional
//	public PracticeSubmitResponse nopBaiOnTap(PracticeSubmitRequest request) {
//		User user = getCurrentUser();
//
//		validateSubmitRequest(request);
//
//		String practiceType = normalizePracticeType(request.getPracticeType());
//
//		Lesson lesson = lessonRepository.findPublishedLessonWithCourseByLessonId(request.getLessonId())
//				.orElseThrow(() -> new RuntimeException("Không tìm thấy bài học hoặc bài học chưa được xuất bản"));
//
//		Long courseId = lesson.getCourse().getCourseId();
//
//		if (!coQuyenHocLesson(user.getUserId(), courseId, lesson)) {
//			throw new RuntimeException("Bạn cần mua khóa học để nộp bài ôn tập này");
//		}
//
//		if (!"FLASHCARD".equalsIgnoreCase(practiceType)) {
//			boolean enabled = lessonPracticeConfigRepository
//					.existsByLessonLessonIdAndPracticeTypeAndIsEnabledTrue(lesson.getLessonId(), practiceType);
//
//			if (!enabled) {
//				throw new RuntimeException("Dạng ôn tập này chưa được bật cho lesson");
//			}
//		}
//
//		List<Question> questions = questionRepository
//				.findPublishedPracticeQuestionsByLessonAndType(lesson.getLessonId(), practiceType);
//
//		if (questions == null || questions.isEmpty()) {
//			throw new RuntimeException("Bài ôn tập này chưa có câu hỏi");
//		}
//
//		Map<Long, Question> questionMap = questions.stream()
//				.collect(Collectors.toMap(Question::getQuestionId, Function.identity()));
//
//		Map<Long, PracticeAnswerRequest> answerMap = request.getAnswers().stream()
//				.filter(answer -> answer.getQuestionId() != null).collect(Collectors.toMap(
//						PracticeAnswerRequest::getQuestionId, Function.identity(), (oldValue, newValue) -> newValue));
//
//		LocalDateTime now = LocalDateTime.now();
//
//		Attempt attempt = Attempt.builder().user(user).lesson(lesson).exam(null).attemptType("PRACTICE")
//				.practiceType(practiceType).startedAt(now).submittedAt(now).score(BigDecimal.ZERO).totalCorrect(0)
//				.totalQuestions(questions.size()).durationSeconds(null).resultStatus("Completed").createdAt(now)
//				.build();
//
//		Attempt savedAttempt = attemptRepository.save(attempt);
//
//		List<AttemptDetail> details = new ArrayList<>();
//
//		BigDecimal totalScore = BigDecimal.ZERO;
//		int totalCorrect = 0;
//
//		for (Question question : questions) {
//			PracticeAnswerRequest answer = answerMap.get(question.getQuestionId());
//
//			CheckAnswerResult checkResult = checkAnswer(question, answer);
//
//			if (Boolean.TRUE.equals(checkResult.isCorrect())) {
//				totalCorrect++;
//				totalScore = totalScore.add(checkResult.earnedPoint());
//			}
//
//			AttemptDetail detail = AttemptDetail.builder().attempt(savedAttempt).question(question)
//					.selectedOption(checkResult.selectedOption())
//					.answerText(answer != null ? answer.getAnswerText() : null).isCorrect(checkResult.isCorrect())
//					.earnedPoint(checkResult.earnedPoint()).createdAt(now).build();
//
//			details.add(detail);
//		}
//
//		List<AttemptDetail> savedDetails = attemptDetailRepository.saveAll(details);
//
//		savedAttempt.setScore(totalScore);
//		savedAttempt.setTotalCorrect(totalCorrect);
//		savedAttempt.setTotalQuestions(questions.size());
//		savedAttempt.setResultStatus("Completed");
//		savedAttempt.setSubmittedAt(now);
//
//		Attempt finalAttempt = attemptRepository.save(savedAttempt);
//
//		PracticeSubmitResponse response = practiceAttemptMapper.toPracticeSubmitResponse(finalAttempt);
//
//		response.setDetails(practiceAttemptMapper.toPracticeSubmitDetailResponses(savedDetails));
//
//		return response;
//	}

	@Transactional
	public PracticeSubmitResponse nopBaiOnTap(PracticeSubmitRequest request) {

		User user = getCurrentUser();

		validateSubmitRequest(request);

		String practiceType = normalizePracticeType(request.getPracticeType());

		Lesson lesson = lessonRepository.findPublishedLessonWithCourseByLessonId(request.getLessonId())
				.orElseThrow(() -> new RuntimeException("Không tìm thấy bài học"));

		List<Question> questions = questionRepository
				.findPublishedPracticeQuestionsByLessonAndType(lesson.getLessonId(), practiceType);

		return submitAttemptCore(user, lesson, null, practiceType, "PRACTICE", questions, request.getAnswers());
	}

	@Transactional
	public PracticeSubmitResponse nopBaiThi(ExamSubmitRequest request) {

		User user = getCurrentUser();

		Exam exam = examRepository.findPublishedExamForStudent(request.getExamId())
				.orElseThrow(() -> new RuntimeException("Không tìm thấy bài thi"));

		/*
		 * Check số lần làm
		 */
		Long totalAttempts = attemptRepository.countByExamExamIdAndUserUserId(exam.getExamId(), user.getUserId());

		if (exam.getMaxAttempts() != null && totalAttempts >= exam.getMaxAttempts()) {

			throw new RuntimeException("Bạn đã vượt quá số lần làm bài");
		}

		/*
		 * Lấy câu hỏi bài thi
		 */
		List<Question> questions = questionRepository.findPublishedQuestionsByExamId(exam.getExamId());

		return submitAttemptCore(user, null, exam, null, "EXAM", questions, request.getAnswers());
	}

	private CheckAnswerResult checkAnswer(Question question, PracticeAnswerRequest answer) {
		if (answer == null) {
			return new CheckAnswerResult(false, BigDecimal.ZERO, null);
		}

		String questionType = question.getQuestionType();

		if ("MULTIPLE_CHOICE".equalsIgnoreCase(questionType) || "LISTENING_CHOICE".equalsIgnoreCase(questionType)) {
			return checkChoiceAnswer(question, answer.getSelectedOptionId());
		}

		if ("LISTENING_FILL_BLANK".equalsIgnoreCase(questionType) || "ARRANGE_SENTENCE".equalsIgnoreCase(questionType)
				|| "WRITING_SHORT".equalsIgnoreCase(questionType)) {
			return checkTextAnswer(question, answer.getAnswerText());
		}

		return new CheckAnswerResult(false, BigDecimal.ZERO, null);
	}

	private CheckAnswerResult checkChoiceAnswer(Question question, Long selectedOptionId) {
		if (selectedOptionId == null || question.getOptions() == null) {
			return new CheckAnswerResult(false, BigDecimal.ZERO, null);
		}

		QuestionOption selectedOption = question.getOptions().stream()
				.filter(option -> Objects.equals(option.getOptionId(), selectedOptionId)).findFirst().orElse(null);

		if (selectedOption == null) {
			return new CheckAnswerResult(false, BigDecimal.ZERO, null);
		}

		boolean correct = Boolean.TRUE.equals(selectedOption.getIsCorrect());

		BigDecimal earnedPoint = correct ? safePoint(question.getDefaultPoint()) : BigDecimal.ZERO;

		return new CheckAnswerResult(correct, earnedPoint, selectedOption);
	}

	private CheckAnswerResult checkTextAnswer(Question question, String answerText) {
		if (answerText == null || answerText.isBlank()) {
			return new CheckAnswerResult(false, BigDecimal.ZERO, null);
		}

		String correctText = question.getCorrectText();

		if (correctText == null || correctText.isBlank()) {
			/*
			 * Với WRITING_SHORT nếu muốn giáo viên/AI chấm sau thì để false hoặc null. Hiện
			 * tại mình chấm theo exact correctText.
			 */
			return new CheckAnswerResult(false, BigDecimal.ZERO, null);
		}

		boolean correct = normalizeAnswer(answerText).equals(normalizeAnswer(correctText));

		BigDecimal earnedPoint = correct ? safePoint(question.getDefaultPoint()) : BigDecimal.ZERO;

		return new CheckAnswerResult(correct, earnedPoint, null);
	}

	private String normalizeAnswer(String value) {
		if (value == null) {
			return "";
		}

		String normalized = Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "");

		return normalized.toLowerCase().trim().replaceAll("\\s+", " ").replaceAll("[\\p{Punct}]", "");
	}

	private BigDecimal safePoint(BigDecimal point) {
		return point != null ? point : BigDecimal.ONE;
	}

	private void validateSubmitRequest(PracticeSubmitRequest request) {
		if (request == null) {
			throw new RuntimeException("Dữ liệu nộp bài không hợp lệ");
		}

		if (request.getLessonId() == null) {
			throw new RuntimeException("lessonId không được để trống");
		}

		if (request.getPracticeType() == null || request.getPracticeType().isBlank()) {
			throw new RuntimeException("practiceType không được để trống");
		}

		if (request.getAnswers() == null) {
			throw new RuntimeException("Danh sách câu trả lời không được null");
		}
	}

	private String normalizePracticeType(String practiceType) {
		String normalized = practiceType.trim().toUpperCase();

		if (!VALID_PRACTICE_TYPES.contains(normalized)) {
			throw new RuntimeException("Dạng ôn tập không hợp lệ: " + practiceType);
		}

		return normalized;
	}

	private boolean coQuyenHocLesson(Long userId, Long courseId, Lesson lesson) {
		String courseType = lesson.getCourse().getCourseType();

		if ("FREE".equalsIgnoreCase(courseType)) {
			return true;
		}

		return enrollmentRepository.existsByUserUserIdAndCourseCourseIdAndHasCourseAccessTrue(userId, courseId);
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

	private record CheckAnswerResult(Boolean isCorrect, BigDecimal earnedPoint, QuestionOption selectedOption) {
	}

	public PracticeSubmitResponse layKetQuaBaiOnTap(Long attemptId) {
		User user = getCurrentUser();

		Attempt attempt = attemptRepository.findPracticeResultByAttemptId(attemptId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy kết quả bài ôn tập"));

		if (!"PRACTICE".equalsIgnoreCase(attempt.getAttemptType())) {
			throw new RuntimeException("Lượt làm này không phải bài ôn tập");
		}

		if (!attempt.getUser().getUserId().equals(user.getUserId())) {
			throw new RuntimeException("Bạn không có quyền xem kết quả bài ôn tập này");
		}

		List<AttemptDetail> details = attemptDetailRepository.findPracticeResultDetailsByAttemptId(attemptId);

		PracticeSubmitResponse response = practiceAttemptMapper.toPracticeSubmitResponse(attempt);

		response.setDetails(practiceAttemptMapper.toPracticeSubmitDetailResponses(details));

		return response;
	}
}