package com.learning.english.service;


import java.io.IOException;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.learning.english.dto.request.ChangePasswordRequest;
import com.learning.english.dto.request.StudentUpdateRequest;
import com.learning.english.dto.response.StudentProfileResponse;
import com.learning.english.dto.response.TeacherProfileResponse;
import com.learning.english.entity.TeacherProfile;
import com.learning.english.entity.User;
import com.learning.english.mapper.UserMapper;
import com.learning.english.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class UserService {
	@Autowired
	UserRepository userRepository;

	@Autowired
	UserMapper userMapper;

	@Autowired
	FileService fileService;

	@Autowired
	org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
	
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

	@Transactional
    public void doiMatKhau(ChangePasswordRequest request) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

	    if (authentication == null || !authentication.isAuthenticated()) {
	        throw new RuntimeException("Người dùng chưa đăng nhập");
	    }

	    String username = authentication.getName();

	    User user = userRepository.findByUsername(username)
	            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
	    System.out.println("Cái gì đó " + request.getCurrentPassword());
        validateChangePasswordRequest(request);

        boolean currentPasswordCorrect = passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword()
        );

        if (!currentPasswordCorrect) {
            throw new RuntimeException("Mật khẩu hiện tại không chính xác");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu mới không được trùng với mật khẩu hiện tại");
        }

        String encodedNewPassword = passwordEncoder.encode(request.getNewPassword());

        user.setPassword(encodedNewPassword);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
    }

    private void validateChangePasswordRequest(ChangePasswordRequest request) {
        if (request == null) {
            throw new RuntimeException("Dữ liệu đổi mật khẩu không hợp lệ");
        }

        if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
            throw new RuntimeException("Mật khẩu hiện tại không được để trống");
        }

        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new RuntimeException("Mật khẩu mới không được để trống");
        }

        if (request.getConfirmPassword() == null || request.getConfirmPassword().isBlank()) {
            throw new RuntimeException("Vui lòng nhập lại mật khẩu mới");
        }

        if (request.getNewPassword().length() < 8) {
            throw new RuntimeException("Mật khẩu mới phải có ít nhất 8 ký tự");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu nhập lại không khớp");
        }

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new RuntimeException("Mật khẩu mới không được trùng với mật khẩu hiện tại");
        }
    }
}
