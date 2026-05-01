package com.learning.english.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.learning.english.dto.request.CourseRequest;
import com.learning.english.dto.response.CourseResponse;
import com.learning.english.entity.Course;
import com.learning.english.entity.Level;
import com.learning.english.entity.User;
import com.learning.english.mapper.CourseMapper;
import com.learning.english.repository.CourseRepository;
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
	
	public List<CourseResponse> dsAllKhoaHoc_Status(String status) {
		return courseRepository.findAllByStatusNot(status).stream().map(courseMapper::toCourseResponse).toList();
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
        Course course = Course.builder()
                .teacher(user)
                .level(level)
                .title(request.getTitle())
                .description(request.getDescription())
                .thumbnailUrl(thumbnailUrl)
                .price(request.getPrice())
                .courseType(request.getCourseType())
                .status("PENDING")
                .examPrice(request.getExamPrice())
                .submittedAt(now)
                .reviewedAt(null)
                .reviewedBy(null)
                .rejectReason(null)
                .createdAt(now)
                .updatedAt(now)
                .build();

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
        
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));
        
        course.setReviewedAt(LocalDateTime.now());
        course.setRejectReason(rejectReason);
        course.setStatus(approvalStatus);
        course.setReviewedBy(user);
        
        course = courseRepository.save(course);
        
        return courseMapper.toCourseResponse(course);
	}
}
