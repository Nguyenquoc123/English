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
import com.learning.english.entity.Enrollment;
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
	
	@Autowired
	CourseCertificateService courseCertificateService;
	
	public List<CourseReviewResponse> layDanhGiaKhoaHoc(Long courseId){
		return courseReviewRepository.findReviewsByCourseId(courseId).stream().map(courseReviewMapper::toCourseReviewResponse).toList();
	}
	
	public CourseReviewResponse taoDanhGia(Long courseId, CourseReviewRequest request){
		Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));
		User user = getCurrentUser();
		Enrollment enrollment = enrollmentRepository.findByUserUserIdAndCourseCourseId(user.getUserId(), courseId).orElse(null);
		
        if (enrollment == null) {
            throw new RuntimeException("Bạn cần mua khóa học trước khi đánh giá.");
        }
        else if(!enrollment.getHasCourseAccess())
        	throw new RuntimeException("Không thể thêm đánh giá vì quyền học của bạn đang bị khóa!.");
        
        double tienDo = courseCertificateService.tienDoHoc(user.getUserId(), courseId);
        if(tienDo < 20)
        	throw new RuntimeException("Vui lòng học ít nhất 20% bài học để có thể đánh giá khóa học.");
        
        CourseReview courseReviewOld = courseReviewRepository.findByCourseCourseIdAndUserUserId(courseId, user.getUserId()).orElse(null);
        if(courseReviewOld != null)
        	throw new RuntimeException("Bạn đã đánh giá khóa học này rồi!.");
        
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
	
	public CourseReviewResponse updateDanhGia(Long courseId, Long courseReviewId, CourseReviewRequest request){
		
		CourseReview courseReview = courseReviewRepository.findById(courseReviewId).orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá"));
		
		User user = getCurrentUser();
		if(courseReview.getUser().getUserId() != user.getUserId())
			throw new RuntimeException("Đánh giá này không phải của bạn!");
		Enrollment enrollment = enrollmentRepository.findByUserUserIdAndCourseCourseId(user.getUserId(), courseId).orElse(null);
		
        if (enrollment == null) {
            throw new RuntimeException("Bạn cần mua khóa học trước khi đánh giá.");
        }
        else if(!enrollment.getHasCourseAccess())
        	throw new RuntimeException("Không thể chỉnh sủa đánh giá vì quyền học của bạn đang bị khóa!.");
        
        courseReview.setRating(request.getRating());
        courseReview.setComment(request.getComment());
        
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
