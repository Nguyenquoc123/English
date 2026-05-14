package com.learning.english.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.learning.english.dto.request.CourseRejectRequest;
import com.learning.english.dto.request.CourseRequest;
import com.learning.english.dto.response.CourseComboboxResponse;
import com.learning.english.dto.response.CourseDetailResponse;
import com.learning.english.dto.response.CourseResponse;
import com.learning.english.dto.response.StudentCourseDetailResponse;
import com.learning.english.entity.Course;
import com.learning.english.entity.Level;
import com.learning.english.entity.User;
import com.learning.english.mapper.CourseMapper;
import com.learning.english.repository.CourseRepository;
import com.learning.english.repository.CourseReviewRepository;
import com.learning.english.repository.EnrollmentRepository;
import com.learning.english.repository.LessonRepository;
import com.learning.english.repository.LevelRepository;
import com.learning.english.repository.UserRepository;

@Service
public class CourseService {

	@Autowired
	CourseRepository courseRepository;

	@Autowired
	UserRepository userRepository;

	@Autowired
	LevelRepository levelRepository;

	@Autowired
	CourseMapper courseMapper;

	@Autowired
	FileService fileService;

	@Autowired
	LessonRepository lessonRepository;

	@Autowired
	CourseReviewRepository courseReviewRepository;

	@Autowired
	EnrollmentRepository enrollmentRepository;

	public Page<CourseResponse> dsAllKhoaHocCuaTeacherPhanTrang(String status, String keyword, Long levelId, int page,
			int size) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()) {
			throw new RuntimeException("Người dùng chưa đăng nhập");
		}

		String username = authentication.getName();
		keyword = normalize(keyword);

		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
		return courseRepository.searchCourses(username, status, keyword, levelId, pageable)
				.map(courseMapper::toCourseResponse);
	}
	
	public List<CourseComboboxResponse> dsAllKhoaHocCuaTeacher() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()) {
			throw new RuntimeException("Người dùng chưa đăng nhập");
		}

		String username = authentication.getName();
		
		return courseRepository.dsKhoaHocCuaTeacher(username).stream().map(courseMapper::toComboboxResponse).toList();
		
	}

	public Page<CourseResponse> dsAllKhoaHocPublic(String keyword, Long levelId, int page, int size) {
		keyword = normalize(keyword);

		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

		return courseRepository.searchCourses(null, "Published", keyword, levelId, pageable)
				.map(courseMapper::toCourseResponse);
	}

	private String normalize(String value) {
		if (value == null || value.trim().isEmpty()) {
			return null;
		}
		return value.trim();
	}

	public Page<CourseResponse> dsAllKhoaHoc(String status, String keyword, Long levelId, int page, int size) {
		keyword = normalize(keyword);

		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
		return courseRepository.searchCourses(null, status, keyword, levelId, pageable)
				.map(courseMapper::toCourseResponse);
	}

	public CourseDetailResponse getCourseDetail(Long courseId) {
		List<Object[]> rows = courseRepository.chiTietKhoaHoc(courseId);

		if (rows.isEmpty()) {
			throw new RuntimeException("Không tìm thấy khóa học");
		}

		Object[] row = rows.get(0);

		return courseMapper.mapToCourseDetailResponse(row);
	}

	public CourseResponse taoKhoaHoc(CourseRequest request, MultipartFile thumbnailFile) throws IOException {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()) {
			throw new RuntimeException("Người dùng chưa đăng nhập");
		}

		String username = authentication.getName();

		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với username = " + username));

		Level level = levelRepository.findById(request.getLevelId())
				.orElseThrow(() -> new RuntimeException("Không tìm thấy level với id = " + request.getLevelId()));

		LocalDateTime now = LocalDateTime.now();

		String thumbnailUrl = null;

		if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
			thumbnailUrl = fileService.saveFile(thumbnailFile, "images");
		}
		Course course = Course.builder().teacher(user).level(level).title(request.getTitle())
				.description(request.getDescription()).shortDescription(request.getShortDescription())
				.thumbnailUrl(thumbnailUrl).price(request.getPrice()).courseType(request.getCourseType())
				.status("Draft").examPrice(request.getExamPrice()).submittedAt(now).reviewedAt(null).reviewedBy(null)
				.rejectReason(null).createdAt(now).updatedAt(now).build();

		Course savedCourse = courseRepository.save(course);

		return courseMapper.toCourseResponse(savedCourse);
	}

	public CourseResponse duyetKhoaHoc(Long courseId, String approvalStatus, String rejectReason) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()) {
			throw new RuntimeException("Người dùng chưa đăng nhập");
		}

		String username = authentication.getName();

		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với username = " + username));

		Course course = courseRepository.findById(courseId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

		course.setReviewedAt(LocalDateTime.now());
		course.setRejectReason(rejectReason);
		course.setStatus(approvalStatus);
		course.setReviewedBy(user);

		course = courseRepository.save(course);

		return courseMapper.toCourseResponse(course);
	}

	public CourseResponse guiDuyetKhoaHoc(Long courseId) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()) {
			throw new RuntimeException("Người dùng chưa đăng nhập");
		}

		String username = authentication.getName();

		Course course = courseRepository.findCourseOfTeacher(courseId, username)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học hoặc bạn không có quyền thao tác"));

		if (!"Draft".equals(course.getStatus()) && !"Rejected".equals(course.getStatus())) {
			throw new RuntimeException("Chỉ có khóa học Draft hoặc Rejected mới được gửi duyệt");
		}

		course.setStatus("Pending");
		course.setSubmittedAt(LocalDateTime.now());

		// Nếu khóa học từng bị từ chối thì khi gửi duyệt lại nên xóa lý do từ chối cũ
		course.setRejectReason(null);

		course.setUpdatedAt(LocalDateTime.now());

		Course savedCourse = courseRepository.save(course);

		return courseMapper.toCourseResponse(savedCourse);
	}

	public CourseResponse duyetKhoaHoc(Long courseId) {
		User admin = getCurrentUser();

		Course course = courseRepository.findCourseForAdminReview(courseId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

		if (!"Pending".equals(course.getStatus())) {
			throw new RuntimeException("Chỉ có khóa học đang chờ duyệt mới được duyệt");
		}

		LocalDateTime now = LocalDateTime.now();

		course.setStatus("Published");
		course.setSubmittedAt(now);
		course.setReviewedAt(now);
		course.setReviewedBy(admin);
		course.setRejectReason(null);
		course.setUpdatedAt(now);

		Course savedCourse = courseRepository.save(course);

		return courseMapper.toCourseResponse(savedCourse);
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

	public CourseResponse tuChoiKhoaHoc(Long courseId, CourseRejectRequest request) {
		User admin = getCurrentUser();

		Course course = courseRepository.findCourseForAdminReview(courseId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

		if (!"Pending".equals(course.getStatus())) {
			throw new RuntimeException("Chỉ có khóa học đang chờ duyệt mới được từ chối");
		}

		if (request.getRejectReason() == null || request.getRejectReason().isBlank()) {
			throw new RuntimeException("Lý do từ chối không được để trống");
		}

		LocalDateTime now = LocalDateTime.now();

		course.setStatus("Rejected");
		course.setReviewedAt(now);
		course.setReviewedBy(admin);
		course.setRejectReason(request.getRejectReason().trim());
		course.setUpdatedAt(now);

		Course savedCourse = courseRepository.save(course);

		return courseMapper.toCourseResponse(savedCourse);
	}

	public StudentCourseDetailResponse layChiTietKhoaHocChoHocVien(Long courseId) {
		User user = getCurrentUser();
		Course course = courseRepository.findPublishedCourseDetail(courseId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

		boolean isEnrolled = false;

		if (user != null) {
			isEnrolled = enrollmentRepository
					.existsByUserUserIdAndCourseCourseIdAndHasCourseAccessTrue(user.getUserId(), courseId);
		}

		Long lessonCount = lessonRepository.countLessonsByCourseId(courseId);
		Long studentCount = enrollmentRepository.countByCourseCourseIdAndHasCourseAccessTrue(courseId);
		Double rating = courseReviewRepository.avgRatingByCourseId(courseId);
		Long reviewCount = courseReviewRepository.countReviewsByCourseId(courseId);

		Long teacherId = course.getTeacher() != null ? course.getTeacher().getUserId() : null;

		Long teacherCourseCount = 0L;

		if (teacherId != null) {
			teacherCourseCount = courseRepository.countPublishedCourseByTeacher(teacherId);
		}

		return StudentCourseDetailResponse.builder().courseId(course.getCourseId()).title(course.getTitle())
				.shortDescription(course.getShortDescription()).description(course.getDescription())
				.thumbnailUrl(course.getThumbnailUrl())
				.levelId(course.getLevel() != null ? course.getLevel().getLevelId() : null)
				.levelName(course.getLevel() != null ? course.getLevel().getLevelName() : null)
				.accessType(course.getCourseType()).courseType(course.getCourseType()).price(course.getPrice())
				.originalPrice(null).status(course.getStatus()).teacherId(teacherId)
				.teacherName(course.getTeacher() != null ? course.getTeacher().getFullName() : null)
				.teacherAvatarUrl(course.getTeacher() != null ? course.getTeacher().getAvatarUrl() : null)
				.teacherBio(null).teacherCourseCount(teacherCourseCount).lessonCount(lessonCount)
				.studentCount(studentCount).rating(roundRating(rating)).reviewCount(reviewCount)
				.isEnrolled(isEnrolled || "FREE".equals(course.getCourseType())).build();
//				.isEnrolled(true).build();
	}

	private Double roundRating(Double rating) {
		if (rating == null) {
			return 0.0;
		}

		return Math.round(rating * 10.0) / 10.0;
	}
}
