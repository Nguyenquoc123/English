package com.learning.english.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.learning.english.dto.request.LessonRequest;
import com.learning.english.dto.request.LessonUpdateRequest;
import com.learning.english.dto.response.LessonResponse;
import com.learning.english.entity.Course;
import com.learning.english.entity.Lesson;
import com.learning.english.entity.Level;
import com.learning.english.mapper.LessonMapper;
import com.learning.english.repository.CourseRepository;
import com.learning.english.repository.LessonRepository;
import com.learning.english.repository.LevelRepository;

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
	
	public List<LessonResponse> dsLessonCuaKhoaHoc(Long courseId){
		return lessonRepository.findByCourse_CourseId(courseId).stream().map(lessonMapper::toLessonResponse).toList();
	}
	
	public List<LessonResponse> dsLessonCuaKhoaHoc_Status(Long courseId, String status){
		return lessonRepository.findByCourse_CourseIdAndStatus(courseId, status).stream().map(lessonMapper::toLessonResponse).toList();
	}
	
	
	
	public LessonResponse themLesson(LessonRequest request) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		
		if(authentication == null || !authentication.isAuthenticated())
			throw new RuntimeException("Người dùng chưa đăng nhập");
		Course course = null;

		if (request.getCourseId() != null) {
		    course = courseRepository.findById(request.getCourseId())
		            .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));
		}
		
		Lesson lesson = Lesson.builder()
				.course(course)
				.createdAt(LocalDateTime.now())
				.description(request.getDescription())
				.status(request.getStatus())
				.title(request.getTitle())
				.updatedAt(LocalDateTime.now())
				.lessonOrder(request.getLessonOrder())
				.lessonType(request.getLessonType())
				.build();
		
		lesson = lessonRepository.save(lesson);
		return lessonMapper.toLessonResponse(lesson);
	}
	
	public LessonResponse updateLesson(LessonUpdateRequest request) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		
		if(authentication == null || !authentication.isAuthenticated())
			throw new RuntimeException("Người dùng chưa đăng nhập");
		
		Lesson lesson = lessonRepository.findById(request.getLessonId()).orElseThrow(() -> new  RuntimeException("Không tìm thấy lesson"));
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
}
