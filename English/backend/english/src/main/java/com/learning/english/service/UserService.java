package com.learning.english.service;


import java.io.IOException;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.learning.english.dto.request.StudentUpdateRequest;
import com.learning.english.dto.response.StudentProfileResponse;
import com.learning.english.dto.response.TeacherProfileResponse;
import com.learning.english.entity.TeacherProfile;
import com.learning.english.entity.User;
import com.learning.english.mapper.UserMapper;
import com.learning.english.repository.UserRepository;

@Service
public class UserService {
	@Autowired
	UserRepository userRepository;
	
	@Autowired
	UserMapper userMapper;
	
	@Autowired
	FileService fileService;
	
	public StudentProfileResponse getHoSoCaNhan() {
		 Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

	     if (authentication == null || !authentication.isAuthenticated()) {
	    	 throw new RuntimeException("Người dùng chưa đăng nhập");
	     }
	     
	     String username = authentication.getName();

	     User user = userRepository.findByUsername(username)
	                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

	     return userMapper.toStudentProfileResponse(user);
	}
	
	public StudentProfileResponse updateHoSoCaNhan(String fullName, String email, MultipartFile avatarFile) throws IOException {
	    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

	    if (authentication == null || !authentication.isAuthenticated()) {
	        throw new RuntimeException("Người dùng chưa đăng nhập");
	    }

	    String username = authentication.getName();

	    User user = userRepository.findByUsername(username)
	            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

	    if (userRepository.existsByEmailAndUserIdNot(email.trim(), user.getUserId())) {
	        throw new RuntimeException("Email đã tồn tại");
	    }

	    user.setEmail(email);
	    user.setFullName(fullName);

	    if (avatarFile != null && !avatarFile.isEmpty()) {
	        String avatarUrl = fileService.saveFile(avatarFile, "images");
	        user.setAvatarUrl(avatarUrl);
	    }

	    user.setUpdatedAt(LocalDateTime.now());
	    user = userRepository.save(user);

	    return userMapper.toStudentProfileResponse(user);
	}
	
	
	
	
	
}
