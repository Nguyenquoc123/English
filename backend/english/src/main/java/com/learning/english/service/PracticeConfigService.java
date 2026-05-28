package com.learning.english.service;

import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.learning.english.dto.response.PracticeConfigResponse;
import com.learning.english.dto.response.PracticeQuestionResponse;
import com.learning.english.dto.response.StudentPracticeResponse;
import com.learning.english.entity.Course;
import com.learning.english.entity.Lesson;
import com.learning.english.entity.LessonQuestion;
import com.learning.english.entity.User;
import com.learning.english.mapper.PracticeConfigMapper;
import com.learning.english.repository.CourseItemRepository;
import com.learning.english.repository.CourseRepository;
import com.learning.english.repository.EnrollmentRepository;
import com.learning.english.repository.LessonQuestionRepository;
import com.learning.english.repository.LessonRepository;
import com.learning.english.repository.PracticeConfigRepository;
import com.learning.english.repository.UserRepository;

@Service
public class PracticeConfigService {
	@Autowired
	PracticeConfigRepository practiceConfigRepository;

	@Autowired
	LessonRepository lessonRepository;

	@Autowired
	PracticeConfigMapper practiceConfigMapper;

	@Autowired
	EnrollmentRepository enrollmentRepository;

	@Autowired
	UserRepository userRepository;
	
	@Autowired
	LessonQuestionRepository lessonQuestionRepository;
	
	@Autowired
	CourseRepository courseRepository;
	
	@Autowired
	CourseItemRepository courseItemRepository;
	

	public List<PracticeConfigResponse> layCauHinhOnTapChoHocVien(Long lessonId) {

	    User user = getCurrentUser();

	    Lesson lesson = lessonRepository.findPublishedLessonWithCourseByLessonId(lessonId)
	            .orElseThrow(() -> new RuntimeException(
	                    "Không tìm thấy bài học hoặc bài học chưa được xuất bản"
	            ));

	    Long courseId = lesson.getCourse().getCourseId();

	    boolean hasAccess = checkHasLessonAccess(
	            user.getUserId(),
	            courseId,
	            lessonId
	    );

	    if (!hasAccess) {
	        throw new RuntimeException("Bạn cần mua khóa học để xem bài ôn tập của lesson này");
	    }

	    List<Object[]> rows = practiceConfigRepository
	            .findStudentPracticeConfigsByLessonId(lessonId, user.getUserId());

	    return practiceConfigMapper.toPracticeConfigResponses(rows);
	}
	
	private boolean checkHasLessonAccess(Long userId, Long courseId, Long lessonId) {

	    Course course = courseRepository.findById(courseId)
	            .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

	    if ("FREE".equalsIgnoreCase(course.getCourseType())) {
	        return true;
	    }

	    boolean enrolled = enrollmentRepository
	            .existsByUserUserIdAndCourseCourseIdAndHasCourseAccessTrue(
	                    userId,
	                    courseId
	            );

	    if (enrolled) {
	        return true;
	    }

	    return courseItemRepository
	            .existsByCourseCourseIdAndLessonLessonIdAndIsFreePreviewTrue(
	                    courseId,
	                    lessonId
	            );
	}

	private boolean coQuyenHocLesson(Long userId, Long courseId, Lesson lesson) {
		String courseType = lesson.getCourse().getCourseType();

		if ("FREE".equalsIgnoreCase(courseType)) {
			return true;
		}

		return enrollmentRepository.existsByUserUserIdAndCourseCourseIdAndHasCourseAccessTrue(userId, courseId);
	}
	
	private static final Set<String> VALID_PRACTICE_TYPES = Set.of(
            "MULTIPLE_CHOICE",
            "LISTENING_CHOICE",
            "LISTENING_FILL_BLANK",
            "ARRANGE_SENTENCE",
            "WRITING_SHORT",
            "FLASHCARD"
    );

	public StudentPracticeResponse layDanhSachCauHoiOnTapChoHocVien(
	        Long lessonId,
	        String practiceType
	) {
	    User user = getCurrentUser();

	    String normalizedPracticeType = normalizePracticeType(practiceType);

	    Lesson lesson = lessonRepository.findPublishedLessonWithCourseByLessonId(lessonId)
	            .orElseThrow(() -> new RuntimeException(
	                    "Không tìm thấy bài học hoặc bài học chưa được xuất bản"
	            ));

	    Long courseId = lesson.getCourse().getCourseId();

	    boolean hasAccess = checkHasLessonAccess(
	            user.getUserId(),
	            courseId,
	            lessonId
	    );

	    if (!hasAccess) {
	        throw new RuntimeException("Bạn cần mua khóa học để làm bài ôn tập này");
	    }

	    if (!"FLASHCARD".equalsIgnoreCase(normalizedPracticeType)) {
	        boolean enabled = practiceConfigRepository
	                .existsByLessonLessonIdAndPracticeTypeAndIsEnabledTrue(
	                        lessonId,
	                        normalizedPracticeType
	                );

	        if (!enabled) {
	            throw new RuntimeException("Dạng ôn tập này chưa được bật cho lesson");
	        }
	    }

	    List<LessonQuestion> lessonQuestions =
	            lessonQuestionRepository.findStudentQuestionsByLessonIdAndPracticeType(
	                    lessonId,
	                    normalizedPracticeType
	            );

	    List<PracticeQuestionResponse> questions =
	            practiceConfigMapper.toPracticeQuestionResponses(lessonQuestions);

	    return StudentPracticeResponse.builder()
	            .lessonId(lesson.getLessonId())
	            .lessonTitle(lesson.getTitle())
	            .practiceType(normalizedPracticeType)
	            .questions(questions)
	            .build();
	}
    
    

    private String normalizePracticeType(String practiceType) {
        if (practiceType == null || practiceType.isBlank()) {
            throw new RuntimeException("practiceType không được để trống");
        }

        String normalized = practiceType.trim().toUpperCase();

        if (!VALID_PRACTICE_TYPES.contains(normalized)) {
            throw new RuntimeException("Dạng ôn tập không hợp lệ: " + practiceType);
        }

        return normalized;
    }

    

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new RuntimeException("Người dùng chưa đăng nhập");
        }

        String username = authentication.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }
}
