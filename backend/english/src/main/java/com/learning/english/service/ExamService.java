package com.learning.english.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.learning.english.dto.request.ExamCreateRequest;
import com.learning.english.dto.response.ExamListResponse;
import com.learning.english.dto.response.ExamResponse;
import com.learning.english.dto.response.StudentExamListResponse;
import com.learning.english.dto.response.TeacherExamDetailResponse;
import com.learning.english.entity.Course;
import com.learning.english.entity.Exam;
import com.learning.english.entity.User;
import com.learning.english.mapper.ExamMapper;
import com.learning.english.repository.AttemptRepository;
import com.learning.english.repository.CourseRepository;
import com.learning.english.repository.EnrollmentRepository;
import com.learning.english.repository.ExamRepository;
import com.learning.english.repository.UserRepository;

@Service
public class ExamService {
	@Autowired
	private ExamRepository examRepository;

	@Autowired
	private AttemptRepository attemptRepository;

	@Autowired
	private EnrollmentRepository enrollmentRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private ExamMapper examMapper;
	
	@Autowired
	CourseRepository courseRepository;

	public List<StudentExamListResponse> layDanhSachBaiThiChoHocVien(Long courseId, String keyword, String status) {
		User user = getCurrentUser();

		String normalizedKeyword = normalizeString(keyword);
		String normalizedStatus = normalizeString(status);

		List<Object[]> rows = examRepository.findStudentExamList(courseId, normalizedKeyword, normalizedStatus);

		return rows.stream().map(row -> buildResponse(row, user.getUserId())).toList();
	}

	public List<ExamListResponse> layDanhSachBaiThiByTeacher(Long courseId, String keyword, String status) {

		String normalizedKeyword = normalizeString(keyword);
		String normalizedStatus = normalizeString(status);

		User user = getCurrentUser();
		List<Object[]> rows = examRepository.findExamListByTeacher(user.getUserId(), courseId, normalizedKeyword,
				normalizedStatus);

		return rows.stream().map(examMapper::toExamListResponse).toList();
	}

	public ExamResponse taoBaiThi(ExamCreateRequest request) {
		User user = getCurrentUser();
		Course course = courseRepository.findById(request.getCourseId())
				.orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));
		boolean check = courseRepository.existsByCourseIdAndTeacherUserId(request.getCourseId(), user.getUserId());
		if (!check)
			throw new RuntimeException("Bạn không sở hữu khóa học này");

		Exam exam = Exam.builder().createdBy(user).course(course).createdAt(LocalDateTime.now())
				.description(request.getDescription()).durationMinutes(request.getDurationMinutes())
				.endTime(request.getEndTime()).startTime(request.getStartTime()).maxAttempts(request.getMaxAttempts())
				.status(request.getStatus()).title(request.getTitle()).updatedAt(LocalDateTime.now()).build();

		exam = examRepository.save(exam);
		return examMapper.toExamResponse(exam);
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

	private StudentExamListResponse buildResponse(Object[] row, Long userId) {
		StudentExamListResponse response = examMapper.toStudentExamListResponse(row);

		Long attemptedCount = attemptRepository.countByUserUserIdAndExamExamIdAndAttemptType(userId,
				response.getExamId(), "EXAM");

		if (attemptedCount == null) {
			attemptedCount = 0L;
		}

		Integer maxAttempts = response.getMaxAttempts();

		if (maxAttempts == null || maxAttempts <= 0) {
			maxAttempts = 1;
		}

		Long remainingAttempts = Math.max(maxAttempts - attemptedCount, 0);

		boolean hasExamAccess = enrollmentRepository.existsByUserUserIdAndCourseCourseIdAndHasExamAccessTrue(userId,
				response.getCourseId());

		String message = buildCanTakeExamMessage(response, hasExamAccess, remainingAttempts);

		response.setAttemptedCount(attemptedCount);
		response.setRemainingAttempts(remainingAttempts);
		response.setCanTakeExam(message == null);
		response.setMessage(message == null ? "Có thể làm bài" : message);

		return response;
	}

	private String buildCanTakeExamMessage(StudentExamListResponse exam, boolean hasExamAccess,
			Long remainingAttempts) {
		if (!hasExamAccess) {
			return "Bạn chưa có quyền tham gia bài thi";
		}

		if (!"Open".equalsIgnoreCase(exam.getStatus())) {
			return "Bài thi hiện chưa mở";
		}

		LocalDateTime now = LocalDateTime.now();

		if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) {
			return "Bài thi chưa đến thời gian mở";
		}

		if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) {
			return "Bài thi đã hết thời gian làm";
		}

		if (exam.getQuestionCount() == null || exam.getQuestionCount() <= 0) {
			return "Bài thi chưa có câu hỏi";
		}

		if (remainingAttempts == null || remainingAttempts <= 0) {
			return "Bạn đã làm bài thi này";
		}

		return null;
	}

	private String normalizeString(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}

		return value.trim();
	}
	
	
	
	
	public TeacherExamDetailResponse layChiTietKyThiCuaTeacher(Long examId) {
		User teacher = getCurrentUser();
		
	    List<Object[]> rows = examRepository.findExamDetailByTeacher(examId, teacher.getUserId());

	    if (rows == null || rows.isEmpty()) {
	        throw new RuntimeException("Không tìm thấy kỳ thi hoặc bạn không có quyền xem kỳ thi này");
	    }

	    Object[] row = rows.get(0);

	    return examMapper.toTeacherExamDetailResponse(row);
	}
}
