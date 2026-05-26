package com.learning.english.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.learning.english.dto.request.TeacherProfileUpdateRequest;
import com.learning.english.dto.request.TeacherRegisterRequest;
import com.learning.english.dto.response.TeacherProfileResponse;
import com.learning.english.entity.Role;
import com.learning.english.entity.TeacherCertificate;
import com.learning.english.entity.TeacherProfile;
import com.learning.english.entity.User;
import com.learning.english.mapper.TeacherProfileMapper;
import com.learning.english.repository.RoleRepository;
import com.learning.english.repository.TeacherProfileRepository;
import com.learning.english.repository.UserRepository;

import jakarta.transaction.Transactional;

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

	@Autowired
	ApplicationEventPublisher applicationEventPublisher;

	@Transactional
	public TeacherProfileResponse dangKyLamGiaoVien(TeacherRegisterRequest request,
			List<MultipartFile> certificateFiles) throws IOException {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()) {
			throw new RuntimeException("Người dùng chưa đăng nhập");
		}

		String username = authentication.getName();

		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

		String phone = normalizePhone(request.getPhone());
		validatePhone(phone);

		if (request.getBio() == null || request.getBio().trim().isEmpty()) {
			throw new RuntimeException("Bio không được để trống");
		}

		if (request.getExperience() == null || request.getExperience().trim().isEmpty()) {
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
				existingProfile.setBio(request.getBio());
				existingProfile.setExperience(request.getExperience());
				existingProfile.setPhone(phone);
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

					TeacherCertificate certificate = TeacherCertificate.builder().teacherProfile(existingProfile)
							.certificateUrl(imageUrl).build();

					existingProfile.getCertificates().add(certificate);
				}

				TeacherProfile savedProfile = teacherProfileRepository.save(existingProfile);

				applicationEventPublisher.publishEvent(savedProfile.getTeacherProfileId());

				return teacherProfileMapper.toTeacherProfileResponse(savedProfile);

			}
		}

		TeacherProfile teacherProfile = TeacherProfile.builder().user(user).approvalStatus("PENDING")
				.bio(request.getBio()).experience(request.getExperience()).phone(phone).certificates(new ArrayList<>())
				.createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();

		for (MultipartFile file : certificateFiles) {
			if (file == null || file.isEmpty()) {
				continue;
			}

			String imageUrl = fileService.saveFile(file, "images");

			TeacherCertificate certificate = TeacherCertificate.builder().teacherProfile(teacherProfile)
					.certificateUrl(imageUrl).build();

			teacherProfile.getCertificates().add(certificate);
		}

		TeacherProfile savedProfile = teacherProfileRepository.save(teacherProfile);

		applicationEventPublisher.publishEvent(savedProfile.getTeacherProfileId());

		return teacherProfileMapper.toTeacherProfileResponse(savedProfile);
	}

	public TeacherProfileResponse getProfileDangKy() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()) {
			throw new RuntimeException("Người dùng chưa đăng nhập");
		}

		String username = authentication.getName();

		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

		TeacherProfile teacherProfile = teacherProfileRepository.findByUser(user)
				.orElseThrow(() -> new RuntimeException());
		return teacherProfileMapper.toTeacherProfileResponse(teacherProfile);
	}

	public TeacherProfileResponse duyetDangKyLamGiaoVien(Long teacherProfileId, String approvalStatus,
			String rejectReason) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()) {
			throw new RuntimeException("Người dùng chưa đăng nhập");
		}

		String username = authentication.getName();

		User admin = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy admin"));

		if ("admin".equals(admin.getStatus()))
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
			if (role.isEmpty())
				throw new RuntimeException("Không tìm thấy roles.");
			User teacher = teacherProfile.getUser();
			teacher.setRole(role.get());
			userRepository.save(teacher);
		}

		TeacherProfile savedProfile = teacherProfileRepository.save(teacherProfile);
		return teacherProfileMapper.toTeacherProfileResponse(savedProfile);
	}

	public Boolean daDangKyLamGiaoVien() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()) {
			throw new RuntimeException("Người dùng chưa đăng nhập");
		}

		String username = authentication.getName();

		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

		Boolean kq = teacherProfileRepository.existsByUser(user);

		return kq;
	}

	private String normalizePhone(String phone) {
		if (phone == null) {
			return "";
		}
		return phone.trim().replaceAll("[\\s.\\-]", "");
	}

	private void validatePhone(String phone) {
		if (phone == null || phone.isEmpty()) {
			throw new RuntimeException("Số điện thoại không được để trống");
		}
		if (!phone.matches("^(\\+84|84|0)[0-9]{9,10}$")) {
			throw new RuntimeException("Số điện thoại không hợp lệ (VD: 0912345678)");
		}
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

	@Transactional
	public TeacherProfileResponse updateHoSoGiaoVien(TeacherProfileUpdateRequest request) {
		User user = getCurrentUser();

		TeacherProfile teacherProfile = teacherProfileRepository.findByUser(user)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ giáo viên"));

		boolean emailExisted = userRepository.existsByEmailAndUserIdNot(request.getEmail().trim(), user.getUserId());

		if (emailExisted) {
			throw new RuntimeException("Email đã được sử dụng");
		}

		user.setEmail(request.getEmail().trim());
		user.setUpdatedAt(LocalDateTime.now());

		teacherProfile.setPhone(request.getPhone().trim());
		teacherProfile.setBio(request.getBio().trim());
		teacherProfile.setExperience(request.getExperience());
		teacherProfile.setUpdatedAt(LocalDateTime.now());

		/*
		 * Nếu bạn muốn giáo viên sửa hồ sơ xong phải duyệt lại, mở phần này ra:
		 *
		 * teacherProfile.setApprovalStatus("PENDING");
		 * teacherProfile.setReviewedAt(null); teacherProfile.setReviewedBy(null);
		 * teacherProfile.setRejectReason(null);
		 */

		userRepository.save(user);
		TeacherProfile savedProfile = teacherProfileRepository.save(teacherProfile);

		return teacherProfileMapper.toTeacherProfileResponse(teacherProfile);
	}
}