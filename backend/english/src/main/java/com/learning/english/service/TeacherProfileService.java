package com.learning.english.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.learning.english.dto.response.TeacherProfileResponse;
import com.learning.english.entity.Role;
import com.learning.english.entity.TeacherCertificate;
import com.learning.english.entity.TeacherProfile;
import com.learning.english.entity.User;
import com.learning.english.mapper.TeacherProfileMapper;
import com.learning.english.repository.RoleRepository;
import com.learning.english.repository.TeacherProfileRepository;
import com.learning.english.repository.UserRepository;

@Service
public class TeacherProfileService {
	@Autowired
	TeacherProfileRepository teacherProfileRepository;
	
	@Autowired
	UserRepository userRepository;
	
	@Autowired
	FileService fileService;
	
	@Autowired
	TeacherProfileMapper teacherProfileMapper;
	
	@Autowired
	RoleRepository roleRepository;
	
	public TeacherProfileResponse dangKyLamGiaoVien(String bio, String experience, List<MultipartFile> certificateFiles) throws IOException {
	    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

	    if (authentication == null || !authentication.isAuthenticated()) {
	        throw new RuntimeException("Người dùng chưa đăng nhập");
	    }

	    String username = authentication.getName();

	    User user = userRepository.findByUsername(username)
	            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

	    if (bio == null || bio.trim().isEmpty()) {
	        throw new RuntimeException("Bio không được để trống");
	    }

	    if (experience == null || experience.trim().isEmpty()) {
	        throw new RuntimeException("Kinh nghiệm không được để trống");
	    }

	    if (certificateFiles == null || certificateFiles.isEmpty()) {
	        throw new RuntimeException("Vui lòng tải lên ít nhất 1 ảnh chứng chỉ");
	    }

	    TeacherProfile existingProfile = teacherProfileRepository.findByUser(user).orElse(null);

	    if (existingProfile != null) {
	        if ("PENDING".equalsIgnoreCase(existingProfile.getApprovalStatus())) {
	            throw new RuntimeException("Yêu cầu đăng ký giáo viên của bạn đang chờ duyệt");
	        }

	        if ("APPROVED".equalsIgnoreCase(existingProfile.getApprovalStatus())) {
	            throw new RuntimeException("Bạn đã là giáo viên");
	        }

	        if ("REJECTED".equalsIgnoreCase(existingProfile.getApprovalStatus())) {
	            existingProfile.setBio(bio);
	            existingProfile.setExperience(experience);
	            existingProfile.setApprovalStatus("PENDING");
	            existingProfile.setReviewedAt(null);
	            existingProfile.setReviewedBy(null);
	            existingProfile.setRejectReason(null);
	            existingProfile.setUpdatedAt(LocalDateTime.now());



	            for (MultipartFile file : certificateFiles) {
	                if (file == null || file.isEmpty()) {
	                    continue;
	                }

	                String imageUrl = fileService.saveFile(file, "images");

	                TeacherCertificate certificate = TeacherCertificate.builder()
	                        .teacherProfile(existingProfile)
	                        .certificateUrl(imageUrl)
	                        .build();

	                existingProfile.getCertificates().add(certificate);
	            }

	            TeacherProfile savedProfile = teacherProfileRepository.save(existingProfile);
	            return teacherProfileMapper.toTeacherProfileResponse(savedProfile);
	        }
	    }

	    TeacherProfile teacherProfile = TeacherProfile.builder()
	            .user(user)
	            .approvalStatus("PENDING")
	            .bio(bio)
	            .experience(experience)
	            .createdAt(LocalDateTime.now())
	            .certificates(new ArrayList<>())
	            .createdAt(LocalDateTime.now())
	            .updatedAt(LocalDateTime.now())
	            .build();

	    for (MultipartFile file : certificateFiles) {
	        if (file == null || file.isEmpty()) {
	            continue;
	        }

	        String imageUrl = fileService.saveFile(file, "images");

	        TeacherCertificate certificate = TeacherCertificate.builder()
	                .teacherProfile(teacherProfile)
	                .certificateUrl(imageUrl)
	                .build();

	        teacherProfile.getCertificates().add(certificate);
	    }

	    TeacherProfile savedProfile = teacherProfileRepository.save(teacherProfile);
	    return teacherProfileMapper.toTeacherProfileResponse(teacherProfile);
	}
	
	public TeacherProfileResponse duyetDangKyLamGiaoVien(Long teacherProfileId, String approvalStatus, String rejectReason) {
	    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

	    if (authentication == null || !authentication.isAuthenticated()) {
	        throw new RuntimeException("Người dùng chưa đăng nhập");
	    }

	    String username = authentication.getName();

	    User admin = userRepository.findByUsername(username)
	            .orElseThrow(() -> new RuntimeException("Không tìm thấy admin"));
	    
	    if("admin".equals(admin.getStatus()))
	    	throw new RuntimeException("Không đủ quyền");

	    TeacherProfile teacherProfile = teacherProfileRepository.findById(teacherProfileId)
	            .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ đăng ký giáo viên"));

	    if (!"pending".equalsIgnoreCase(teacherProfile.getApprovalStatus())) {
	        throw new RuntimeException("Hồ sơ này không ở trạng thái chờ duyệt");
	    }

	    if (approvalStatus == null || approvalStatus.trim().isEmpty()) {
	        throw new RuntimeException("Trạng thái duyệt không được để trống");
	    }

	    if (!"approved".equalsIgnoreCase(approvalStatus) && !"rejected".equalsIgnoreCase(approvalStatus)) {
	        throw new RuntimeException("Trạng thái duyệt chỉ được là APPROVED hoặc REJECTED");
	    }

	    teacherProfile.setApprovalStatus(approvalStatus.toUpperCase());
	    teacherProfile.setReviewedAt(LocalDateTime.now());
	    teacherProfile.setReviewedBy(admin);

	    if ("rejected".equalsIgnoreCase(approvalStatus)) {
	        if (rejectReason == null || rejectReason.trim().isEmpty()) {
	            throw new RuntimeException("Vui lòng nhập lý do từ chối");
	        }
	        teacherProfile.setRejectReason(rejectReason.trim());
	    } else {
	        teacherProfile.setRejectReason(null);
	        
	        Optional<Role> role = roleRepository.findByRoleName("teacher");
	        if(role.isEmpty())
	        	throw new RuntimeException("Không tìm thấy roles.");
	        User teacher = teacherProfile.getUser();
	        teacher.setRole(role.get());
	        userRepository.save(teacher);
	    }

	    TeacherProfile savedProfile = teacherProfileRepository.save(teacherProfile);
	    return teacherProfileMapper.toTeacherProfileResponse(savedProfile);
	}
}
