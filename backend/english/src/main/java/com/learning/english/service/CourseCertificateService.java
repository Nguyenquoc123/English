package com.learning.english.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.learning.english.constant.EnrollmentAccessStatus;
import com.learning.english.dto.request.CertificateIssueRequest;
import com.learning.english.dto.response.CertificateStatusResponse;
import com.learning.english.dto.response.CourseCertificateResponse;
import com.learning.english.entity.Course;
import com.learning.english.entity.CourseCertificate;
import com.learning.english.entity.CourseItem;
import com.learning.english.entity.Enrollment;
import com.learning.english.entity.User;
import com.learning.english.repository.AttemptRepository;
import com.learning.english.repository.CourseCertificateRepository;
import com.learning.english.repository.CourseItemRepository;
import com.learning.english.repository.CourseRepository;
import com.learning.english.repository.EnrollmentRepository;
import com.learning.english.repository.RefundRequestRepository;
import com.learning.english.repository.UserRepository;
import com.learning.english.repository.VideoProgressRepository;
import com.learning.english.repository.VideoRepository;

@Service
public class CourseCertificateService {

    private static final Set<String> BLOCKING_REFUND_STATUSES = Set.of("PENDING");
    private static final Pattern SAFE_NAME_PATTERN = Pattern.compile("^[\\p{L}\\p{M}\\s'.-]{2,255}$");

    @Autowired
    CourseRepository courseRepository;
    @Autowired
    CourseItemRepository courseItemRepository;
    @Autowired
    EnrollmentRepository enrollmentRepository;
    @Autowired
    RefundRequestRepository refundRequestRepository;
    @Autowired
    CourseCertificateRepository courseCertificateRepository;
    @Autowired
    VideoRepository videoRepository;
    @Autowired
    VideoProgressRepository videoProgressRepository;
    @Autowired
    AttemptRepository attemptRepository;
    @Autowired
    UserRepository userRepository;

    @Transactional(readOnly = true)
    public CertificateStatusResponse getStatus(Long courseId) {
        User user = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));
//        if(course.getCourseType().equals("FREE")) 
//        	return null;
        
        CourseProgress progress = calculateProgress(user.getUserId(), courseId);
        CourseCertificate existing = courseCertificateRepository
                .findByUserUserIdAndCourseCourseId(user.getUserId(), courseId)
                .orElse(null);

        if (existing != null) {
            return CertificateStatusResponse.builder()
                    .courseId(courseId)
                    .courseTitle(course.getTitle())
                    .certificateEnabled(Boolean.TRUE.equals(course.getCertificateEnabled()))
                    .progressPercent(100)
                    .totalItems(progress.totalItems())
                    .completedItems(progress.completedItems())
                    .eligible(false)
                    .alreadyIssued(true)
                    .message("Bạn đã được cấp chứng chỉ cho khóa học này.")
                    .certificate(toResponse(existing))
                    .build();
        }

        String eligibilityMessage = resolveEligibilityMessage(user, course, progress);
        boolean eligible = eligibilityMessage == null;

        String displayMessage;
        if (eligible) {
            displayMessage = "Bạn đã hoàn thành khóa học. Hãy nhập họ và tên để nhận chứng chỉ.";
        } else if (progress.progressPercent() < 100) {
            displayMessage = "Bạn cần hoàn thành toàn bộ khóa học để nhận chứng chỉ.";
        } else {
            displayMessage = eligibilityMessage;
        }

        return CertificateStatusResponse.builder()
                .courseId(courseId)
                .courseTitle(course.getTitle())
                .certificateEnabled(Boolean.TRUE.equals(course.getCertificateEnabled()))
                .progressPercent(progress.progressPercent())
                .totalItems(progress.totalItems())
                .completedItems(progress.completedItems())
                .eligible(eligible)
                .alreadyIssued(false)
                .message(displayMessage)
                .certificate(null)
                .build();
    }

    @Transactional
    public CourseCertificateResponse issueCertificate(Long courseId, CertificateIssueRequest request) {
        User user = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

        if (courseCertificateRepository.existsByUserUserIdAndCourseCourseId(user.getUserId(), courseId)) {
            throw new RuntimeException("Bạn đã được cấp chứng chỉ cho khóa học này.");
        }

        CourseProgress progress = calculateProgress(user.getUserId(), courseId);
        String blockReason = resolveEligibilityMessage(user, course, progress);
        if (blockReason != null) {
            throw new RuntimeException(blockReason);
        }

        String studentName = sanitizeStudentName(request.getStudentNameOnCertificate());
        LocalDateTime now = LocalDateTime.now();

        CourseCertificate certificate = CourseCertificate.builder()
                .user(user)
                .course(course)
                .studentNameOnCertificate(studentName)
                .courseTitleSnapshot(course.getTitle())
                .certificateCode(generateUniqueCertificateCode())
                .issuedAt(now)
                .createdAt(now)
                .build();

        return toResponse(courseCertificateRepository.save(certificate));
    }

    @Transactional(readOnly = true)
    public CourseCertificateResponse getMyCertificate(Long courseId) {
        User user = getCurrentUser();
        CourseCertificate certificate = courseCertificateRepository
                .findByUserUserIdAndCourseCourseId(user.getUserId(), courseId)
                .orElseThrow(() -> new RuntimeException("Bạn chưa có chứng chỉ cho khóa học này."));
        return toResponse(certificate);
    }

    @Transactional(readOnly = true)
    public CourseCertificateResponse getByCodePublic(String certificateCode) {
        CourseCertificate certificate = courseCertificateRepository
                .findByCertificateCode(certificateCode.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chứng chỉ."));
        return toResponse(certificate);
    }

    private String resolveEligibilityMessage(User user, Course course, CourseProgress progress) {
        if (!Boolean.TRUE.equals(course.getCertificateEnabled())) {
            return "Khóa học này chưa bật chức năng cấp chứng chỉ.";
        }

        boolean isFreeCourse = "FREE".equalsIgnoreCase(course.getCourseType());
        Enrollment enrollment = enrollmentRepository
                .findByUserUserIdAndCourseCourseId(user.getUserId(), course.getCourseId())
                .orElse(null);

        if (!isFreeCourse) {
            if (enrollment == null || !Boolean.TRUE.equals(enrollment.getHasCourseAccess())) {
                return "Bạn cần mua khóa học để nhận chứng chỉ.";
            }
        } else if (enrollment == null || !Boolean.TRUE.equals(enrollment.getHasCourseAccess())) {
            return "Bạn cần đăng ký khóa học miễn phí trước khi nhận chứng chỉ.";
        }

        if (enrollment != null) {
            String accessStatus = enrollment.getAccessStatus();
            if (accessStatus != null) {
                if (EnrollmentAccessStatus.REFUNDED.equalsIgnoreCase(accessStatus)) {
                    return "Khóa học đã bị hoàn tiền, không thể nhận chứng chỉ.";
                }
                if (EnrollmentAccessStatus.REFUND_PENDING_LOCKED.equalsIgnoreCase(accessStatus)) {
                    return "Khóa học đang trong quá trình hoàn tiền, không thể nhận chứng chỉ.";
                }
            }
        }

        if (refundRequestRepository.existsByStudentUserIdAndCourseCourseIdAndStatusIn(
                user.getUserId(),
                course.getCourseId(),
                BLOCKING_REFUND_STATUSES)) {
            return "Khóa học đang trong quá trình hoàn tiền, không thể nhận chứng chỉ.";
        }

        if (progress.totalItems() == 0) {
            return "Khóa học chưa có nội dung học.";
        }

        if (progress.progressPercent() < 100) {
            return "Bạn cần hoàn thành toàn bộ khóa học để nhận chứng chỉ.";
        }

        return null;
    }
    
    public double tienDoHoc(Long userId, Long courseId) {
    	CourseProgress courseProgress =  calculateProgress(userId, courseId);
    	return courseProgress.progressPercent;
    }

    private CourseProgress calculateProgress(Long userId, Long courseId) {
        List<CourseItem> items = courseItemRepository.findPublishedCourseContentsByCourseId(courseId);
        long total = items.size();
        long completed = items.stream()
                .filter(item -> isCourseItemCompleted(userId, item))
                .count();

        int percent = 0;
        if (total > 0) {
            percent = (int) Math.round((completed * 100.0) / total);
        }

        return new CourseProgress(total, completed, percent);
    }

    private boolean isCourseItemCompleted(Long userId, CourseItem item) {
        if ("LESSON".equalsIgnoreCase(item.getItemType()) && item.getLesson() != null) {
            return isLessonCompleted(userId, item.getLesson().getLessonId());
        }
        if ("EXAM".equalsIgnoreCase(item.getItemType()) && item.getExam() != null) {
            return attemptRepository.existsByUserUserIdAndExamExamId(userId, item.getExam().getExamId());
        }
        return false;
    }

    private boolean isLessonCompleted(Long userId, Long lessonId) {
        long totalVideos = videoRepository.countVideos(lessonId);
        if (totalVideos == 0) {
            return false;
        }
        long completedVideos = videoProgressRepository.countCompletedVideos(userId, lessonId);
        return completedVideos == totalVideos;
    }

    private String sanitizeStudentName(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new RuntimeException("Vui lòng nhập họ và tên in trên chứng chỉ.");
        }

        String cleaned = raw
                .replaceAll("<[^>]*>", "")
                .replaceAll("[<>\"'`;\\\\/]", "")
                .trim()
                .replaceAll("\\s+", " ");

        if (cleaned.length() < 2 || cleaned.length() > 255) {
            throw new RuntimeException("Họ và tên phải từ 2 đến 255 ký tự.");
        }

        if (!SAFE_NAME_PATTERN.matcher(cleaned).matches()) {
            throw new RuntimeException("Họ và tên chứa ký tự không hợp lệ.");
        }

        return cleaned;
    }

    private String generateUniqueCertificateCode() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        for (int i = 0; i < 20; i++) {
            String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
            String code = "EL-" + datePart + "-" + suffix;
            if (!courseCertificateRepository.existsByCertificateCode(code)) {
                return code;
            }
        }
        throw new RuntimeException("Không thể tạo mã chứng chỉ, vui lòng thử lại.");
    }

    private CourseCertificateResponse toResponse(CourseCertificate certificate) {
        return CourseCertificateResponse.builder()
                .certificateId(certificate.getCertificateId())
                .courseId(certificate.getCourse().getCourseId())
                .studentNameOnCertificate(certificate.getStudentNameOnCertificate())
                .courseTitle(certificate.getCourseTitleSnapshot())
                .certificateCode(certificate.getCertificateCode())
                .issuedAt(certificate.getIssuedAt())
                .signerTitle("Chief Executive Officer (CEO)")
                .signerShortName("Đức")
                .signerFullName("Trần Đại Đức")
                .build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Người dùng chưa đăng nhập");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    private record CourseProgress(long totalItems, long completedItems, int progressPercent) {
    }
}
