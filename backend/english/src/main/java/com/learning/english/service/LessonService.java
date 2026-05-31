package com.learning.english.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.learning.english.dto.request.LessonRequest;
import com.learning.english.dto.request.LessonUpdateRequest;
import com.learning.english.dto.response.CourseLessonListResponse;
import com.learning.english.dto.response.LessonListItemResponse;
import com.learning.english.dto.response.LessonListResponse;
import com.learning.english.dto.response.LessonResponse;
import com.learning.english.dto.response.StudentLessonDetailResponse;
import com.learning.english.dto.response.StudentLessonResponse;
import com.learning.english.dto.response.TeacherLessonDetailResponse;
import com.learning.english.dto.response.VideoProgressResponse;
import com.learning.english.entity.Course;
import com.learning.english.entity.CourseItem;
import com.learning.english.entity.Grammar;
import com.learning.english.entity.Lesson;
import com.learning.english.entity.Level;
import com.learning.english.entity.Question;
import com.learning.english.entity.User;
import com.learning.english.entity.Video;
import com.learning.english.entity.VideoProgress;
import com.learning.english.entity.Vocabulary;
import com.learning.english.mapper.LessonMapper;
import com.learning.english.mapper.TeacherLessonDetailMapper;
import com.learning.english.repository.AttemptRepository;
import com.learning.english.repository.CourseItemRepository;
import com.learning.english.repository.CourseRepository;
import com.learning.english.repository.EnrollmentRepository;
import com.learning.english.repository.GrammarRepository;

import com.learning.english.repository.LessonRepository;
import com.learning.english.repository.LevelRepository;
import com.learning.english.repository.QuestionRepository;
import com.learning.english.repository.UserRepository;
import com.learning.english.repository.VideoProgressRepository;
import com.learning.english.repository.VideoRepository;
import com.learning.english.repository.VocabularyRepository;

import jakarta.transaction.Transactional;

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

	@Autowired
	CourseItemRepository courseItemRepository;

	@Autowired
	VideoProgressRepository videoProgressRepository;

	@Autowired
	AttemptRepository attemptRepository;

	// role teacher
	public List<LessonListResponse> layDanhSachNoiDungKhoaHoc(Long courseId, String keyword, String status) {
		if (courseId == null) {
			throw new RuntimeException("Course id không được để trống");
		}

		boolean courseExists = courseRepository.existsById(courseId);

		if (!courseExists) {
			throw new RuntimeException("Không tìm thấy khóa học với id = " + courseId);
		}

		return courseItemRepository.findCourseContentsByCourseId(courseId, keyword, status).stream()
				.map(lessonMapper::toLessonListResponse).filter(Objects::nonNull).toList();
	}

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

	@Transactional
	public LessonResponse themLesson(LessonRequest request) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()) {
			throw new RuntimeException("Người dùng chưa đăng nhập");
		}

		Course course = courseRepository.findById(request.getCourseId())
				.orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

		Integer maxItemOrder = courseItemRepository.findMaxItemOrderByCourseId(request.getCourseId());
		Integer nextItemOrder = maxItemOrder == null ? 1 : maxItemOrder + 1;

		LocalDateTime now = LocalDateTime.now();

		Lesson lesson = Lesson.builder().course(course).title(request.getTitle().trim())
				.description(request.getDescription().trim()).status(request.getStatus()).createdAt(now).updatedAt(now)
				
				.build();

		Lesson savedLesson = lessonRepository.save(lesson);

		CourseItem courseItem = CourseItem.builder().course(course).itemType("LESSON").lesson(savedLesson).exam(null)
				.isFreePreview(request.isFreePreview())
				.itemOrder(nextItemOrder).build();

		courseItemRepository.save(courseItem);

		return lessonMapper.toLessonResponse(savedLesson);
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
		System.out.println("=========================================");
		System.out.println(request.getIsFreePreview());
		
		CourseItem courseItem = courseItemRepository.findByLesson_LessonId(lesson.getLessonId()).orElseThrow(() -> new RuntimeException("Có lỗi xảy ra"));
		courseItem.setIsFreePreview(request.getIsFreePreview());
		courseItemRepository.save(courseItem);;
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
	
	public LessonResponse layChiTietLessonChoTeacher(Long lessonId) {
	    return courseItemRepository
	            .findLessonResponseByLessonId(lessonId)
	            .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học"));
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

	public List<StudentLessonResponse> layNoiDungKhoaHocChoStudent(Long courseId) {

	    User user = getCurrentUser();

	    Course course = courseRepository.findById(courseId)
	            .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

	    boolean isFreeCourse = "FREE".equalsIgnoreCase(course.getCourseType());

	    boolean enrolled = enrollmentRepository
	            .existsByUserUserIdAndCourseCourseIdAndHasCourseAccessTrue(
	                    user.getUserId(), courseId
	            );

	    boolean hasFullCourseAccess = isFreeCourse || enrolled;

	    List<CourseItem> courseItems =
	            courseItemRepository.findPublishedCourseContentsByCourseId(courseId);

	    List<StudentLessonResponse> responses = new ArrayList<>();

	    boolean previousCompleted = true;
	    boolean foundCurrent = false;

	    for (CourseItem item : courseItems) {

	        boolean completed = kiemTraCourseItemDaHoanThanh(user.getUserId(), item);

	        boolean isPreview = Boolean.TRUE.equals(item.getIsFreePreview());

	        boolean locked = false;
	        boolean current = false;
	        String lockReason = null;

	        if (hasFullCourseAccess) {

	            // Người đã mua hoặc khóa FREE: học theo tiến độ
	            locked = !previousCompleted;

	            if (locked) {
	                lockReason = "Bạn cần hoàn thành nội dung trước đó";
	            } else if (!completed && !foundCurrent) {
	                current = true;
	                foundCurrent = true;
	            }

	            previousCompleted = completed;

	        } else {

	            // Chưa mua khóa PAID: chỉ mở các item preview
	            if (isPreview) {
	                locked = false;

	                if (!completed && !foundCurrent) {
	                    current = true;
	                    foundCurrent = true;
	                }
	            } else {
	                locked = true;
	                lockReason = "Bạn cần mua khóa học";
	            }

	            // Quan trọng:
	            // Chưa mua thì KHÔNG nên dùng completed để mở khóa các bài sau.
	            // Preview nào được mở là do isFreePreview quyết định.
	        }

	        if ("LESSON".equalsIgnoreCase(item.getItemType())) {
	            responses.add(
	                    lessonMapper.toLessonResponse(
	                            item, completed, locked, current, lockReason
	                    )
	            );
	        }

	        if ("EXAM".equalsIgnoreCase(item.getItemType())) {
	            responses.add(
	                    lessonMapper.toExamResponse(
	                            item, completed, locked, current, lockReason
	                    )
	            );
	        }
	    }

	    return responses;
	}

	private boolean kiemTraCourseItemDaHoanThanh(Long userId, CourseItem item) {

		if ("LESSON".equalsIgnoreCase(item.getItemType())) {

			return kiemTraHoanThanhLesson(userId, item.getLesson().getLessonId());
		}

		if ("EXAM".equalsIgnoreCase(item.getItemType())) {

			return attemptRepository.existsByUserUserIdAndExamExamId(userId, item.getExam().getExamId());
		}

		return false;
	}

	private boolean kiemTraHoanThanhLesson(Long userId, Long lessonId) {

		long totalVideos = videoRepository.countVideos(lessonId);

		

		long completedVideos = videoProgressRepository.countCompletedVideos(userId, lessonId);
		System.out.println(totalVideos + "      " + completedVideos);
		return completedVideos >= totalVideos;
	}

	@Transactional
	public VideoProgressResponse luuTienDoVideo(Long videoId, Integer watchedSeconds) {

	    User user = getCurrentUser();

	    Video video = videoRepository.findById(videoId)
	            .orElseThrow(() -> new RuntimeException("Không tìm thấy video"));

	    Long courseId = video.getLesson().getCourse().getCourseId();
	    Long lessonId = video.getLesson().getLessonId();

	    boolean hasAccess = checkHasLessonAccess(user.getUserId(), courseId, lessonId);

	    if (!hasAccess) {
	        throw new RuntimeException("Bạn cần mua khóa học để xem video này");
	    }

	    VideoProgress progress = videoProgressRepository
	            .findByUserUserIdAndVideoVideoId(user.getUserId(), videoId)
	            .orElse(VideoProgress.builder()
	                    .user(user)
	                    .video(video)
	                    .watchedseconds(0)
	                    .iscompleted(false)
	                    .createdAt(LocalDateTime.now())
	                    .build());

	    if (watchedSeconds != null && watchedSeconds > progress.getWatchedseconds()) {
	        progress.setWatchedseconds(watchedSeconds);
	    }

	    double percent = 0;

	    if (video.getDurationSeconds() != null && video.getDurationSeconds() > 0) {
	        percent = (double) progress.getWatchedseconds() / video.getDurationSeconds();
	    }

	    if (percent >= 0.7) {
	        progress.setIscompleted(true);
	    }

	    progress.setUpdatedAt(LocalDateTime.now());

	    progress = videoProgressRepository.save(progress);

	    boolean isVideoCompleted = Boolean.TRUE.equals(progress.getIscompleted());

	    boolean lessonCompleted =
	            kiemTraHoanThanhLesson(user.getUserId(), lessonId);

	    boolean shouldReloadLessons = lessonCompleted;

	    return VideoProgressResponse.builder()
	            .videoCompleted(isVideoCompleted)
	            .lessonCompleted(lessonCompleted)
	            .shouldReloadLessons(shouldReloadLessons)
	            .build();
	}

	private User getCurrentUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()) {
			throw new RuntimeException("Người dùng chưa đăng nhập");
		}

		String username = authentication.getName();

		return userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
	}

	public boolean checkHasCourseAccess(Course course) {
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

	    if (authentication == null || !authentication.isAuthenticated()
	            || "anonymousUser".equals(authentication.getName())) {
	        throw new RuntimeException("Người dùng chưa đăng nhập");
	    }

	    String username = authentication.getName();

	    User user = userRepository.findByUsername(username)
	            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

	    Lesson lesson = lessonRepository.findStudentLessonDetailByLessonId(lessonId)
	            .orElseThrow(() -> new RuntimeException(
	                    "Không tìm thấy bài học hoặc bài học chưa được xuất bản"
	            ));

	    Long courseId = lesson.getCourse().getCourseId();

	    boolean hasAccess = checkHasLessonAccess(user.getUserId(), courseId, lessonId);

	    if (!hasAccess) {
	        throw new RuntimeException("Bạn cần mua khóa học để xem bài học này");
	    }

	    return lessonMapper.toStudentLessonDetailResponse(lesson);
	}
	
	private boolean checkHasLessonAccess(Long userId, Long courseId, Long lessonId) {

	    Course course = courseRepository.findById(courseId)
	            .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

	    if ("FREE".equalsIgnoreCase(course.getCourseType())) {
	        return true;
	    }

	    boolean enrolled = enrollmentRepository
	            .existsByUserUserIdAndCourseCourseIdAndHasCourseAccessTrue(
	                    userId, courseId
	            );

	    if (enrolled) {
	        return true;
	    }

	    return courseItemRepository
	            .existsByCourseCourseIdAndLessonLessonIdAndIsFreePreviewTrue(courseId, lessonId);
	}

	private boolean checkHasCourseAccess(Long userId, Long courseId, Lesson lesson) {
		String courseType = lesson.getCourse().getCourseType();

		if ("FREE".equalsIgnoreCase(courseType)) {
			return true;
		}

		return enrollmentRepository.existsByUserUserIdAndCourseCourseIdAndHasCourseAccessTrue(userId, courseId);
	}
}