package com.learning.english.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.learning.english.dto.request.QuestionManyRequest;
import com.learning.english.dto.request.QuestionOptionRequest;
import com.learning.english.dto.request.QuestionRequest;
import com.learning.english.dto.response.QuestionResponse;
import com.learning.english.entity.Course;
import com.learning.english.entity.Lesson;
import com.learning.english.entity.Question;
import com.learning.english.entity.QuestionOption;
import com.learning.english.entity.User;
import com.learning.english.mapper.QuestionMapper;
import com.learning.english.repository.CourseRepository;
import com.learning.english.repository.LessonRepository;
import com.learning.english.repository.QuestionOptionRepository;
import com.learning.english.repository.QuestionRepository;
import com.learning.english.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class QuestionService {
	@Autowired
	QuestionRepository questionRepository;
	
	@Autowired
	QuestionOptionRepository questionOptionRepository;
	
	@Autowired
	UserRepository userRepository;
	
	@Autowired
	LessonRepository lessonRepository;
	
	@Autowired
	CourseRepository courseRepository;
	
	@Autowired
	QuestionMapper questionMapper;
	
	@Autowired
	FileService fileService;
	
	@Transactional
    public QuestionResponse themMotCauHoi(QuestionRequest request) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Người dùng chưa đăng nhập");
        }

        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
 

        Question question = buildQuestion(request, currentUser);

        Question savedQuestion = questionRepository.save(question);

        return questionMapper.toQuestionResponse(savedQuestion);
    }

	private Question buildQuestion(QuestionRequest request, User currentUser) {



	    Question question = Question.builder()
	            .createdBy(currentUser)
	            .questionType(request.getQuestionType())
	            .content(request.getContent())
	            .mediaUrl(request.getMediaUrl())
	            .correctText(request.getCorrectText())
	            .explanation(request.getExplanation())
	            .defaultPoint(request.getDefaultPoint())
	            .status(request.getStatus() != null ? request.getStatus() : "Published")
	            .sourceType(request.getSourceType() != null ? request.getSourceType() : "TEACHER")
	            .createdAt(LocalDateTime.now())
	            .updatedAt(LocalDateTime.now())
	            .build();

	    if (request.getOptions() != null && !request.getOptions().isEmpty()) {
	        for (QuestionOptionRequest optionRequest : request.getOptions()) {
	            QuestionOption option = QuestionOption.builder()
	                    .optionText(optionRequest.getOptionText())
	                    .isCorrect(Boolean.TRUE.equals(optionRequest.getIsCorrect()))
	                    .createdAt(LocalDateTime.now())
	                    .build();

	            question.addOption(option);
	        }
	    }

	    return question;
	}
	
	@Transactional
	public List<QuestionResponse> themNhieuCauHoiCoFile(QuestionManyRequest request,List<MultipartFile> mediaFiles) throws IOException {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Người dùng chưa đăng nhập");
        }

        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

	    if (request.getQuestions() == null || request.getQuestions().isEmpty()) {
	        throw new RuntimeException("Danh sách câu hỏi không được rỗng");
	    }

	    List<Question> questions = new ArrayList<>();

	    for (QuestionRequest questionRequest : request.getQuestions()) {

	        Integer mediaFileIndex = questionRequest.getMediaFileIndex();

	        if (mediaFileIndex != null) {
	            if (mediaFiles == null || mediaFileIndex < 0 || mediaFileIndex >= mediaFiles.size()) {
	                throw new RuntimeException("File đính kèm không hợp lệ tại mediaFileIndex = " + mediaFileIndex);
	            }

	            MultipartFile file = mediaFiles.get(mediaFileIndex);

	            if (file != null && !file.isEmpty()) {
	                String mediaUrl = fileService.saveFile(file, "media");
	                questionRequest.setMediaUrl(mediaUrl);
	            }
	        }

	        Question question = buildQuestion(questionRequest, currentUser);
	        questions.add(question);
	    }

	    List<Question> savedQuestions = questionRepository.saveAll(questions);

	    return savedQuestions.stream()
	            .map(questionMapper::toQuestionResponse)
	            .toList();
	}
}
