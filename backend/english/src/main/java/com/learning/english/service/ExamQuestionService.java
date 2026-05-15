package com.learning.english.service;

import com.learning.english.dto.request.ExamQuestionAttachRequest;
import com.learning.english.dto.request.ExamQuestionCreateRequest;
import com.learning.english.dto.request.QuestionOptionRequest;
import com.learning.english.dto.response.PracticeQuestionResponse;
import com.learning.english.dto.response.QuestionResponse;
import com.learning.english.dto.response.StudentExamQuestionResponse;
import com.learning.english.dto.response.StudentPracticeResponse;
import com.learning.english.dto.response.TeacherExamQuestionResponse;
import com.learning.english.entity.*;
import com.learning.english.mapper.ExamMapper;
import com.learning.english.mapper.PracticeConfigMapper;
import com.learning.english.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ExamQuestionService {

	@Autowired
	private ExamRepository examRepository;

	@Autowired
	private ExamQuestionRepository examQuestionRepository;

	@Autowired
	private QuestionRepository questionRepository;

	@Autowired
	private QuestionOptionRepository questionOptionRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private ExamMapper examMapper;

	@Autowired
	AttemptRepository attemptRepository;

	@Autowired
	EnrollmentRepository enrollmentRepository;

	@Autowired
	PracticeConfigMapper practiceConfigMapper;

	@Transactional
	public TeacherExamQuestionResponse taoCauHoiMoiVaThemVaoDeThi(Long examId, ExamQuestionCreateRequest request,
			MultipartFile mediaFile) {
		User teacher = getCurrentUser();

		validateCreateRequest(examId, request);

		Exam exam = examRepository.findExamForTeacherAction(examId, teacher.getUserId())
				.orElseThrow(() -> new RuntimeException("Không tìm thấy bài thi hoặc bạn không có quyền thêm câu hỏi"));

		String mediaUrl = null;

		if (mediaFile != null && !mediaFile.isEmpty()) {
			mediaUrl = saveAudioFile(mediaFile);
		}

		LocalDateTime now = LocalDateTime.now();

		Question question = Question.builder().questionType(request.getQuestionType().trim().toUpperCase())
				.content(request.getContent().trim()).correctText(normalizeBlankToNull(request.getCorrectText()))
				.explanation(normalizeBlankToNull(request.getExplanation())).mediaUrl(mediaUrl)
				.defaultPoint(request.getDefaultPoint() == null ? BigDecimal.ONE : request.getDefaultPoint())
				.status(request.getStatus() == null || request.getStatus().isBlank() ? "Published"
						: request.getStatus())
				.sourceType(request.getSourceType() == null || request.getSourceType().isBlank() ? "TEACHER_CREATED"
						: request.getSourceType())
				.createdBy(teacher).createdAt(now).updatedAt(now).build();

		Question savedQuestion = questionRepository.save(question);

		if (isChoiceType(savedQuestion.getQuestionType())) {
			saveQuestionOptions(savedQuestion, request.getOptions());
		}

		Integer nextOrder = getNextQuestionOrder(examId);

		ExamQuestion examQuestion = ExamQuestion.builder().exam(exam).question(savedQuestion).questionOrder(nextOrder)
				.point(request.getPoint() == null ? BigDecimal.ONE : request.getPoint()).createdAt(now).build();

		ExamQuestion savedExamQuestion = examQuestionRepository.save(examQuestion);

		return buildTeacherExamQuestionResponse(savedExamQuestion);
	}

	@Transactional
	public List<TeacherExamQuestionResponse> ganCauHoiCoSanVaoDeThi(Long examId, ExamQuestionAttachRequest request) {
		User teacher = getCurrentUser();

		validateAttachRequest(examId, request);

		Exam exam = examRepository.findExamForTeacherAction(examId, teacher.getUserId())
				.orElseThrow(() -> new RuntimeException("Không tìm thấy bài thi hoặc bạn không có quyền thêm câu hỏi"));

		String questionType = request.getQuestionType().trim().toUpperCase();

		List<Question> questions = questionRepository.findTeacherQuestionsByIdsAndType(request.getQuestionIds(),
				teacher.getUserId(), questionType);

		if (questions.size() != request.getQuestionIds().size()) {
			throw new RuntimeException(
					"Một số câu hỏi không tồn tại, không thuộc giáo viên hiện tại hoặc không đúng dạng câu hỏi");
		}

		Map<Long, Question> questionMap = new HashMap<>();

		for (Question question : questions) {
			questionMap.put(question.getQuestionId(), question);
		}

		Integer currentMaxOrder = examQuestionRepository.findMaxQuestionOrderByExamId(examId);
		int nextOrder = currentMaxOrder == null ? 1 : currentMaxOrder + 1;

		LocalDateTime now = LocalDateTime.now();

		List<ExamQuestion> savedExamQuestions = new ArrayList<>();

		for (Long questionId : request.getQuestionIds()) {
			if (examQuestionRepository.existsByExamExamIdAndQuestionQuestionId(examId, questionId)) {
				continue;
			}

			Question question = questionMap.get(questionId);

			ExamQuestion examQuestion = ExamQuestion.builder().exam(exam).question(question).questionOrder(nextOrder)
					.point(request.getPoint() == null ? safePoint(question.getDefaultPoint()) : request.getPoint())
					.createdAt(now).build();

			savedExamQuestions.add(examQuestionRepository.save(examQuestion));

			nextOrder++;
		}

		if (savedExamQuestions.isEmpty()) {
			throw new RuntimeException("Các câu hỏi đã được thêm vào đề thi trước đó");
		}

		return savedExamQuestions.stream().map(this::buildTeacherExamQuestionResponse).toList();
	}

	private TeacherExamQuestionResponse buildTeacherExamQuestionResponse(ExamQuestion examQuestion) {
		Question question = examQuestion.getQuestion();

		return TeacherExamQuestionResponse.builder().examQuestionId(examQuestion.getExamQuestionId())
				.questionId(question.getQuestionId()).questionOrder(examQuestion.getQuestionOrder())
				.point(examQuestion.getPoint()).questionType(question.getQuestionType()).content(question.getContent())
				.mediaUrl(question.getMediaUrl()).status(question.getStatus()).explanation(question.getExplanation())
				.build();
	}

	private void saveQuestionOptions(Question question, List<QuestionOptionRequest> optionRequests) {
		if (optionRequests == null || optionRequests.isEmpty()) {
			throw new RuntimeException("Câu hỏi lựa chọn cần có danh sách đáp án");
		}

		List<QuestionOption> options = new ArrayList<>();

		for (QuestionOptionRequest optionRequest : optionRequests) {
			if (optionRequest.getOptionText() == null || optionRequest.getOptionText().isBlank()) {
				continue;
			}

			QuestionOption option = QuestionOption.builder().question(question)
					.optionText(optionRequest.getOptionText().trim())
					.isCorrect(Boolean.TRUE.equals(optionRequest.getIsCorrect())).createdAt(LocalDateTime.now())
					.build();

			options.add(option);
		}

		if (options.size() < 2) {
			throw new RuntimeException("Câu hỏi lựa chọn cần ít nhất 2 đáp án");
		}

		boolean hasCorrect = options.stream().anyMatch(option -> Boolean.TRUE.equals(option.getIsCorrect()));

		if (!hasCorrect) {
			throw new RuntimeException("Vui lòng chọn đáp án đúng");
		}

		questionOptionRepository.saveAll(options);
	}

	private Integer getNextQuestionOrder(Long examId) {
		Integer maxOrder = examQuestionRepository.findMaxQuestionOrderByExamId(examId);

		if (maxOrder == null) {
			return 1;
		}

		return maxOrder + 1;
	}

	private void validateCreateRequest(Long examId, ExamQuestionCreateRequest request) {
		if (request == null) {
			throw new RuntimeException("Dữ liệu câu hỏi không hợp lệ");
		}

		if (request.getExamId() != null && !request.getExamId().equals(examId)) {
			throw new RuntimeException("examId trong URL và body không khớp");
		}

		if (request.getQuestionType() == null || request.getQuestionType().isBlank()) {
			throw new RuntimeException("questionType không được để trống");
		}

		if (request.getContent() == null || request.getContent().isBlank()) {
			throw new RuntimeException("Nội dung câu hỏi không được để trống");
		}

		if (request.getPoint() == null || request.getPoint().compareTo(BigDecimal.ZERO) <= 0) {
			throw new RuntimeException("Điểm trong bài thi phải lớn hơn 0");
		}

		String questionType = request.getQuestionType().trim().toUpperCase();

		if (isChoiceType(questionType)) {
			if (request.getOptions() == null || request.getOptions().isEmpty()) {
				throw new RuntimeException("Câu hỏi lựa chọn cần có đáp án");
			}
		}

		if (isTextAnswerType(questionType)) {
			if (request.getCorrectText() == null || request.getCorrectText().isBlank()) {
				throw new RuntimeException("Vui lòng nhập đáp án đúng hoặc đáp án mẫu");
			}
		}
	}

	private void validateAttachRequest(Long examId, ExamQuestionAttachRequest request) {
		if (request == null) {
			throw new RuntimeException("Dữ liệu gắn câu hỏi không hợp lệ");
		}

		if (request.getExamId() != null && !request.getExamId().equals(examId)) {
			throw new RuntimeException("examId trong URL và body không khớp");
		}

		if (request.getQuestionType() == null || request.getQuestionType().isBlank()) {
			throw new RuntimeException("questionType không được để trống");
		}

		if (request.getQuestionIds() == null || request.getQuestionIds().isEmpty()) {
			throw new RuntimeException("Vui lòng chọn ít nhất 1 câu hỏi");
		}

		if (request.getPoint() == null || request.getPoint().compareTo(BigDecimal.ZERO) <= 0) {
			throw new RuntimeException("Điểm trong bài thi phải lớn hơn 0");
		}
	}

	private boolean isChoiceType(String questionType) {
		return "MULTIPLE_CHOICE".equalsIgnoreCase(questionType) || "LISTENING_CHOICE".equalsIgnoreCase(questionType);
	}

	private boolean isTextAnswerType(String questionType) {
		return "LISTENING_FILL_BLANK".equalsIgnoreCase(questionType)
				|| "ARRANGE_SENTENCE".equalsIgnoreCase(questionType) || "WRITING_SHORT".equalsIgnoreCase(questionType);
	}

	private BigDecimal safePoint(BigDecimal point) {
		return point == null ? BigDecimal.ONE : point;
	}

	private String normalizeBlankToNull(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}

		return value.trim();
	}

	private String saveAudioFile(MultipartFile file) {
		try {
			String originalFilename = file.getOriginalFilename();

			String extension = "";

			if (originalFilename != null && originalFilename.contains(".")) {
				extension = originalFilename.substring(originalFilename.lastIndexOf("."));
			}

			String fileName = UUID.randomUUID() + extension;

			Path uploadDir = Paths.get("D:/uploads/audios");

			if (!Files.exists(uploadDir)) {
				Files.createDirectories(uploadDir);
			}

			Path filePath = uploadDir.resolve(fileName);

			file.transferTo(filePath.toFile());

			return "audios/" + fileName;
		} catch (Exception e) {
			throw new RuntimeException("Không thể lưu file audio");
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

	public List<TeacherExamQuestionResponse> layDanhSachCauHoiTrongKyThiCuaTeacher(Long examId) {
		User teacher = getCurrentUser();

		boolean exists = examRepository.existsExamOfTeacher(examId, teacher.getUserId());

		if (!exists) {
			throw new RuntimeException("Không tìm thấy kỳ thi hoặc bạn không có quyền xem kỳ thi này");
		}

		List<Object[]> rows = examQuestionRepository.findTeacherExamQuestions(examId, teacher.getUserId());

		return examMapper.toTeacherExamQuestionResponses(rows);
	}

	public StudentExamQuestionResponse layDanhSachCauHoiBaiThiChoHocVien(Long examId) {

		User user = getCurrentUser();

		Exam exam = examRepository.findPublishedExamForStudent(examId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy bài thi"));

		Long courseId = exam.getCourse().getCourseId();

		/*
		 * Check học viên đã mua khóa học chưa
		 */
		if (!enrollmentRepository.existsByUserUserIdAndCourseCourseIdAndHasExamAccessTrue(user.getUserId(), courseId)) {
			throw new RuntimeException("Bạn cần thanh toán để làm bài thi này");
		}

		/*
		 * Check thời gian mở bài thi
		 */
		LocalDateTime now = LocalDateTime.now();

		if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) {
			throw new RuntimeException("Bài thi chưa bắt đầu");
		}

		if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) {
			throw new RuntimeException("Bài thi đã kết thúc");
		}

		/*
		 * Check số lần làm bài
		 */
		Long attemptCount = attemptRepository.countByExamExamIdAndUserUserId(examId, user.getUserId());

		if (exam.getMaxAttempts() != null && exam.getMaxAttempts() > 0 && attemptCount >= exam.getMaxAttempts()) {
			throw new RuntimeException("Bạn đã vượt quá số lần làm bài");
		}

		List<ExamQuestion> examQuestions = examQuestionRepository.findStudentQuestionsByExamId(examId);

		List<PracticeQuestionResponse> questions = practiceConfigMapper.toExamQuestionResponses(examQuestions);

//		Long totalPoint = examQuestions.stream().map(ExamQuestion::getPoint).filter(Objects::nonNull).reduce(0L,
//				Long::sum);

		return StudentExamQuestionResponse.builder()

				.examId(exam.getExamId())

				.courseId(courseId)

				.courseTitle(exam.getCourse().getTitle())

				.title(exam.getTitle())

				.description(exam.getDescription())

				.durationMinutes(exam.getDurationMinutes())

				.maxAttempts(exam.getMaxAttempts())

				.questionCount(questions.size())

//				.totalPoint(totalPoint)

				.questions(questions)

				.build();
	}
}