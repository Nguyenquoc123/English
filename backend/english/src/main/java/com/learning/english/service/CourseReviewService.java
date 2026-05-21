package com.learning.english.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.learning.english.dto.request.CourseReviewRequest;

import com.learning.english.dto.response.CourseReviewResponse;
import com.learning.english.entity.Course;
import com.learning.english.entity.CourseReview;
import com.learning.english.entity.User;
import com.learning.english.mapper.CourseReviewMapper;
import com.learning.english.repository.CourseRepository;
import com.learning.english.repository.CourseReviewRepository;
import com.learning.english.repository.EnrollmentRepository;

import com.learning.english.repository.UserRepository;

@Service
public class CourseReviewService {

	
	@Autowired
	CourseReviewMapper courseReviewMapper;
	
	@Autowired
	CourseReviewRepository courseReviewRepository;
	
	@Autowired
	CourseRepository courseRepository;
	
	@Autowired
	EnrollmentRepository enrollmentRepository;
	
	@Autowired
	UserRepository userRepository;
	
	public List<CourseReviewResponse> layDanhGiaKhoaHoc(Long courseId){
		return courseReviewRepository.findReviewsByCourseId(courseId).stream().map(courseReviewMapper::toCourseReviewResponse).toList();
	}
	
	public CourseReviewResponse taoDanhGia(Long courseId, CourseReviewRequest request){
		Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));
		User user = getCurrentUser();
		boolean hasBoughtCourse = enrollmentRepository
                .existsByUserUserIdAndCourseCourseIdAndHasCourseAccessTrue(user.getUserId(), courseId);

        if (!hasBoughtCourse) {
            throw new RuntimeException("Bạn cần mua khóa học trước khi đánh giá.");
        }
        
        CourseReview courseReview = CourseReview.builder()
        		.course(course)
        		.user(user)
        		.comment(request.getComment())
        		.rating(request.getRating())
        		.createdAt(LocalDateTime.now())
        		.updatedAt(LocalDateTime.now())
        		.build();
        
        courseReview = courseReviewRepository.save(courseReview);
        
        return courseReviewMapper.toCourseReviewResponse(courseReview);
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
}
