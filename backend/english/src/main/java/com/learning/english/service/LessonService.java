package com.learning.english.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.learning.english.dto.request.LessonRequest;
import com.learning.english.dto.request.LessonUpdateRequest;
import com.learning.english.dto.response.CourseLessonListResponse;
import com.learning.english.dto.response.LessonListItemResponse;
import com.learning.english.dto.response.LessonResponse;
import com.learning.english.dto.response.StudentLessonDetailResponse;
import com.learning.english.dto.response.StudentLessonResponse;
import com.learning.english.dto.response.TeacherLessonDetailResponse;
import com.learning.english.entity.Course;
import com.learning.english.entity.Grammar;
import com.learning.english.entity.Lesson;
import com.learning.english.entity.Level;
import com.learning.english.entity.Question;
import com.learning.english.entity.User;
import com.learning.english.entity.Video;
import com.learning.english.entity.Vocabulary;
import com.learning.english.mapper.LessonMapper;
import com.learning.english.mapper.TeacherLessonDetailMapper;
import com.learning.english.repository.CourseRepository;
import com.learning.english.repository.EnrollmentRepository;
import com.learning.english.repository.GrammarRepository;
import com.learning.english.repository.LessonRepository;
import com.learning.english.repository.LevelRepository;
import com.learning.english.repository.QuestionRepository;
import com.learning.english.repository.UserRepository;
import com.learning.english.repository.VideoRepository;
import com.learning.english.repository.VocabularyRepository;

@Service
public class LessonService {
	@Autowired
	LessonRepository lessonRepository;

	@Autowired
	CourseRepository courseRepository;

	@Autowired
	LevelRepository levelRepository;

	@Autowired
	LessonMapper lessonMapper;

	@Autowired
	VideoRepository videoRepository;

	@Autowired
	GrammarRepository grammarRepository;

	@Autowired
	VocabularyRepository vocabularyRepository;

	@Autowired
	QuestionRepository questionRepository;

	@Autowired
	UserRepository userRepository;

	@Autowired
	TeacherLessonDetailMapper teacherLessonDetailMapper;

	@Autowired
	EnrollmentRepository enrollmentRepository;

	public List<LessonResponse> dsLessonCuaKhoaHoc(Long courseId) {
		return lessonRepository.findByCourse_CourseId(courseId).stream().map(lessonMapper::toLessonResponse).toList();
	}

	public List<LessonResponse> dsLessonCuaKhoaHoc_Status(Long courseId, String status) {
		return lessonRepository.findByCourse_CourseIdAndStatus(courseId, status).stream()
				.map(lessonMapper::toLessonResponse).toList();
	}

	public CourseLessonListResponse getLessonsByCourse(Long courseId, String keyword, String status) {
		if (keyword != null && keyword.trim().isEmpty()) {
			keyword = null;
		}

		if (status != null && status.trim().isEmpty()) {
			status = null;
		}

		Course course = courseRepository.findById(courseId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học!"));

		List<Object[]> rows = lessonRepository.searchLessonListRaw(courseId, keyword, status);

		List<LessonListItemResponse> lessons = rows.stream().map(lessonMapper::toLessonListItemResponse).toList();

		return CourseLessonListResponse.builder().courseId(courseId).courseTitle(course.getTitle()).lessons(lessons)
				.build();
	}

	public LessonResponse themLesson(LessonRequest request) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated())
			throw new RuntimeException("Người dùng chưa đăng nhập");
		Course course = null;

		if (request.getCourseId() != null) {
			course = courseRepository.findById(request.getCourseId())
					.orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));
		}

		Integer maxLessonOrder = lessonRepository.findMaxLessonOrderByCourseId(request.getCourseId());

		Integer nextLessonOrder = maxLessonOrder == null ? 1 : maxLessonOrder + 1;

		Lesson lesson = Lesson.builder().course(course).createdAt(LocalDateTime.now())
				.description(request.getDescription()).status(request.getStatus()).title(request.getTitle())
				.updatedAt(LocalDateTime.now()).lessonOrder(nextLessonOrder).build();

		lesson = lessonRepository.save(lesson);
		return lessonMapper.toLessonResponse(lesson);
	}

	public LessonResponse updateLesson(LessonUpdateRequest request) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated())
			throw new RuntimeException("Người dùng chưa đăng nhập");

		Lesson lesson = lessonRepository.findById(request.getLessonId())
				.orElseThrow(() -> new RuntimeException("Không tìm thấy lesson"));
		lesson.setTitle(request.getTitle());
		lesson.setDescription(request.getDescription());
		lesson.setStatus(request.getStatus());
		lesson = lessonRepository.save(lesson);
		return lessonMapper.toLessonResponse(lesson);
	}

	public LessonResponse updateStatus(Long lessonId, String status) {
		Lesson lesson = lessonRepository.findById(lessonId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy lesson"));
		lesson.setStatus(status);
		lesson = lessonRepository.save(lesson);
		return lessonMapper.toLessonResponse(lesson);
	}

	public void deleteLesson(Long lessonId) {
		Lesson lesson = lessonRepository.findById(lessonId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy lesson"));

		lesson.setStatus("deleted");
		lessonRepository.save(lesson);
	}

	public TeacherLessonDetailResponse getTeacherLessonDetail(Long courseId, Long lessonId) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()) {
			throw new RuntimeException("Người dùng chưa đăng nhập");
		}

		String username = authentication.getName();

		Lesson lesson = lessonRepository.findTeacherLessonDetail(courseId, lessonId, username)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy bài học hoặc bạn không có quyền xem"));

		List<Video> videos = videoRepository.findByLesson_LessonIdOrderByVideoIdAsc(lessonId);

		List<Vocabulary> vocabularies = vocabularyRepository.findByLesson_LessonIdOrderByVocabularyIdAsc(lessonId);

		List<Grammar> grammars = grammarRepository.findByLesson_LessonIdOrderByGrammarIdAsc(lessonId);

		List<Question> questions = questionRepository.findQuestionsByLessonId(lessonId);

		return teacherLessonDetailMapper.toTeacherLessonDetailResponse(lesson, videos, vocabularies, grammars,
				questions);
	}

	public TeacherLessonDetailResponse getTeacherLessonDetailByAdmin(Long courseId, Long lessonId) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()) {
			throw new RuntimeException("Người dùng chưa đăng nhập");
		}

		String username = authentication.getName();

		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
		if (!"admin".equals(user.getRole().getRoleName()))
			throw new RuntimeException("Bạn không có quyền truy cập!");
		Lesson lesson = lessonRepository.findTeacherLessonDetailByAdmin(courseId, lessonId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy bài học!"));

		List<Video> videos = videoRepository.findByLesson_LessonIdOrderByVideoIdAsc(lessonId);

		List<Vocabulary> vocabularies = vocabularyRepository.findByLesson_LessonIdOrderByVocabularyIdAsc(lessonId);

		List<Grammar> grammars = grammarRepository.findByLesson_LessonIdOrderByGrammarIdAsc(lessonId);

		List<Question> questions = questionRepository.findQuestionsByLessonId(lessonId);

		return teacherLessonDetailMapper.toTeacherLessonDetailResponse(lesson, videos, vocabularies, grammars,
				questions);
	}

	public List<StudentLessonResponse> layDanhSachBaiHocChoHocVien(Long courseId) {
		Course course = courseRepository.findByCourseIdAndStatus(courseId, "Published")
				.orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

		boolean hasCourseAccess = checkHasCourseAccess(course);

		return lessonRepository.findAllByCourseCourseIdAndStatusOrderByLessonOrderAsc(courseId, "Published").stream()
				.map(lesson -> {
					StudentLessonResponse response = lessonMapper.toStudentLessonResponse(lesson);

					response.setIsLocked(!hasCourseAccess);

					return response;
				}).toList();
	}

	private boolean checkHasCourseAccess(Course course) {
		if ("FREE".equals(course.getCourseType())) {
			return true;
		}

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()
				|| "anonymousUser".equals(authentication.getName())) {
			return false;
		}

		User user = userRepository.findByUsername(authentication.getName()).orElse(null);

		if (user == null) {
			return false;
		}

		return enrollmentRepository.existsByUserUserIdAndCourseCourseIdAndHasCourseAccessTrue(user.getUserId(),
				course.getCourseId());
	}

	public StudentLessonDetailResponse layChiTietLessonChoHocVien(Long lessonId) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()) {
			throw new RuntimeException("Người dùng chưa đăng nhập");
		}

		String username = authentication.getName();

		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

		Lesson lesson = lessonRepository.findStudentLessonDetailByLessonId(lessonId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy bài học hoặc bài học chưa được xuất bản"));

		Long courseId = lesson.getCourse().getCourseId();

		boolean hasAccess = checkHasCourseAccess(user.getUserId(), courseId, lesson);

		if (!hasAccess) {
			throw new RuntimeException("Bạn cần mua khóa học để xem bài học này");
		}

		return lessonMapper.toStudentLessonDetailResponse(lesson);
	}

	private boolean checkHasCourseAccess(Long userId, Long courseId, Lesson lesson) {
		String courseType = lesson.getCourse().getCourseType();

		if ("FREE".equalsIgnoreCase(courseType)) {
			return true;
		}

		return enrollmentRepository.existsByUserUserIdAndCourseCourseIdAndHasCourseAccessTrue(
				userId,
				courseId
		);
	}
}