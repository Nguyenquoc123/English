package com.learning.english.service;

import com.learning.english.dto.request.QuestionAttachRequest;
import com.learning.english.dto.request.QuestionRequest;
import com.learning.english.dto.request.QuestionOptionRequest;
import com.learning.english.dto.response.QuestionBankItemResponse;
import com.learning.english.dto.response.QuestionResponse;
import com.learning.english.entity.*;
import com.learning.english.mapper.QuestionMapper;
import com.learning.english.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class QuestionService {

    private static final String MULTIPLE_CHOICE = "MULTIPLE_CHOICE";
    private static final String LISTENING_CHOICE = "LISTENING_CHOICE";
    private static final String LISTENING_FILL_BLANK = "LISTENING_FILL_BLANK";
    private static final String ARRANGE_SENTENCE = "ARRANGE_SENTENCE";
    private static final String WRITING_SHORT = "WRITING_SHORT";

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private LessonQuestionRepository lessonQuestionRepository;

    @Autowired
    private PracticeConfigRepository practiceConfigRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuestionMapper questionMapper;

    @Autowired
    private FileService fileService;

    public List<QuestionBankItemResponse> layNganHangCauHoiCuaGiaoVien(String questionType) {
        String username = getCurrentUsername();

        validateQuestionType(questionType);

        return questionRepository.findMyQuestionBankByType(username, questionType)
                .stream()
                .map(questionMapper::toQuestionBankItemResponse)
                .toList();
    }

    @Transactional
    public QuestionResponse taoCauHoiVaGanVaoLesson(
            Long lessonId,
            QuestionRequest request,
            MultipartFile mediaFile
    ) throws IOException {

        String username = getCurrentUsername();

        validateQuestionType(request.getQuestionType());

        Lesson lesson = lessonRepository.findLessonOfTeacher(lessonId, username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lesson hoặc bạn không có quyền thao tác"));

        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        validateCreateRequest(request, mediaFile);

        String mediaUrl = request.getMediaUrl();

        if (mediaFile != null && !mediaFile.isEmpty()) {
            mediaUrl = fileService.saveFile(mediaFile, "audio");
        }

        LocalDateTime now = LocalDateTime.now();

        Question question = Question.builder()
                .createdBy(teacher)
                .questionType(request.getQuestionType())
                .content(request.getContent().trim())
                .mediaUrl(mediaUrl)
                .correctText(trimToNull(request.getCorrectText()))
                .explanation(trimToNull(request.getExplanation()))
                .defaultPoint(
                        request.getDefaultPoint() == null
                                ? BigDecimal.ONE
                                : request.getDefaultPoint()
                )
                .status(
                        request.getStatus() == null || request.getStatus().isBlank()
                                ? "Published"
                                : request.getStatus()
                )
                .sourceType(
                        request.getSourceType() == null || request.getSourceType().isBlank()
                                ? "TEACHER_CREATED"
                                : request.getSourceType()
                )
                .createdAt(now)
                .updatedAt(now)
                .build();

        if (isChoiceType(request.getQuestionType())) {
            for (QuestionOptionRequest optionRequest : request.getOptions()) {
                QuestionOption option = QuestionOption.builder()
                        .optionText(optionRequest.getOptionText().trim())
                        .isCorrect(Boolean.TRUE.equals(optionRequest.getIsCorrect()))
                        .createdAt(now)
                        .build();

                question.addOption(option);
            }
        }

        Question savedQuestion = questionRepository.save(question);

        ganQuestionVaoLessonNeuChuaGan(lesson, savedQuestion);

        ensurePracticeConfigExists(lesson, request.getQuestionType());

        return questionMapper.toQuestionResponse(savedQuestion);
    }

    @Transactional
    public List<QuestionResponse> ganCauHoiCuVaoLesson(
            Long lessonId,
            QuestionAttachRequest request
    ) {
        String username = getCurrentUsername();

        validateQuestionType(request.getQuestionType());

        if (request.getQuestionIds() == null || request.getQuestionIds().isEmpty()) {
            throw new RuntimeException("Danh sách câu hỏi không được rỗng");
        }

        Lesson lesson = lessonRepository.findLessonOfTeacher(lessonId, username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lesson hoặc bạn không có quyền thao tác"));

        List<Question> questions = questionRepository.findMyQuestionsByIdsAndType(
                username,
                request.getQuestionType(),
                request.getQuestionIds()
        );

        if (questions.size() != request.getQuestionIds().size()) {
            throw new RuntimeException("Một số câu hỏi không tồn tại, không thuộc bạn, hoặc không đúng loại câu hỏi");
        }

        List<QuestionResponse> result = new ArrayList<>();

        for (Question question : questions) {
            ganQuestionVaoLessonNeuChuaGan(lesson, question);
            result.add(questionMapper.toQuestionResponse(question));
        }

        ensurePracticeConfigExists(lesson, request.getQuestionType());

        return result;
    }

    private void ganQuestionVaoLessonNeuChuaGan(Lesson lesson, Question question) {
        boolean exists = lessonQuestionRepository.existsByLesson_LessonIdAndQuestion_QuestionId(
                lesson.getLessonId(),
                question.getQuestionId()
        );

        if (exists) {
            return;
        }

        LessonQuestion lessonQuestion = LessonQuestion.builder()
                .lesson(lesson)
                .question(question)
                .build();

        lessonQuestionRepository.save(lessonQuestion);
    }

    private void ensurePracticeConfigExists(Lesson lesson, String practiceType) {
        boolean exists = practiceConfigRepository.existsByLesson_LessonIdAndPracticeType(
                lesson.getLessonId(),
                practiceType
        );

        if (exists) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        LessonPracticeConfig config = LessonPracticeConfig.builder()
                .lesson(lesson)
                .practiceType(practiceType)
                .isEnabled(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        practiceConfigRepository.save(config);
    }

    private void validateCreateRequest(
            QuestionRequest request,
            MultipartFile mediaFile
    ) {
        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new RuntimeException("Nội dung câu hỏi không được để trống");
        }

        if (request.getDefaultPoint() != null &&
                request.getDefaultPoint().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Điểm mặc định phải lớn hơn 0");
        }

        if (isListeningType(request.getQuestionType())) {
            boolean hasMediaUrl = request.getMediaUrl() != null && !request.getMediaUrl().isBlank();
            boolean hasMediaFile = mediaFile != null && !mediaFile.isEmpty();

            if (!hasMediaUrl && !hasMediaFile) {
                throw new RuntimeException("Dạng nghe cần có file audio");
            }
        }

        if (isChoiceType(request.getQuestionType())) {
            validateOptions(request.getOptions());
        } else {
            if (request.getCorrectText() == null || request.getCorrectText().isBlank()) {
                throw new RuntimeException("Dạng câu hỏi này cần có đáp án đúng hoặc đáp án mẫu");
            }
        }
    }

    private void validateOptions(List<QuestionOptionRequest> options) {
        if (options == null || options.isEmpty()) {
            throw new RuntimeException("Câu hỏi chọn đáp án cần có danh sách đáp án");
        }

        List<QuestionOptionRequest> validOptions = options.stream()
                .filter(item -> item.getOptionText() != null && !item.getOptionText().isBlank())
                .toList();

        if (validOptions.size() < 2) {
            throw new RuntimeException("Câu hỏi chọn đáp án cần ít nhất 2 đáp án");
        }

        long correctCount = validOptions.stream()
                .filter(item -> Boolean.TRUE.equals(item.getIsCorrect()))
                .count();

        if (correctCount != 1) {
            throw new RuntimeException("Câu hỏi chọn đáp án cần đúng 1 đáp án đúng");
        }
    }

    private void validateQuestionType(String questionType) {
        if (questionType == null || questionType.isBlank()) {
            throw new RuntimeException("Loại câu hỏi không được để trống");
        }

        boolean valid = questionType.equals(MULTIPLE_CHOICE)
                || questionType.equals(LISTENING_CHOICE)
                || questionType.equals(LISTENING_FILL_BLANK)
                || questionType.equals(ARRANGE_SENTENCE)
                || questionType.equals(WRITING_SHORT);

        if (!valid) {
            throw new RuntimeException("Loại câu hỏi không hợp lệ: " + questionType);
        }
    }

    private boolean isChoiceType(String questionType) {
        return MULTIPLE_CHOICE.equals(questionType)
                || LISTENING_CHOICE.equals(questionType);
    }

    private boolean isListeningType(String questionType) {
        return LISTENING_CHOICE.equals(questionType)
                || LISTENING_FILL_BLANK.equals(questionType);
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Người dùng chưa đăng nhập");
        }

        return authentication.getName();
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
    
    
}