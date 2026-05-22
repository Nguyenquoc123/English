package com.learning.english.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.learning.english.constant.ApprovalStatus;
import com.learning.english.dto.request.TeacherRegisterRequest;
import com.learning.english.dto.response.TeacherApplicationSummaryResponse;
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

	@Autowired
	NotificationService notificationService;

	@Transactional
	public TeacherProfileResponse dangKyLamGiaoVien(TeacherRegisterRequest request,
			List<MultipartFile> certificateFiles) throws IOException {
		User user = getCurrentUser();

		if (!"student".equalsIgnoreCase(user.getRole().getRoleName())) {
			throw new RuntimeException("Chỉ học viên mới có thể đăng ký trở thành giáo viên");
		}

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
			if (ApprovalStatus.isPending(existingProfile.getApprovalStatus())) {
				throw new RuntimeException("Yêu cầu đăng ký giáo viên của bạn đang chờ duyệt");
			}

			if (ApprovalStatus.isApproved(existingProfile.getApprovalStatus())) {
				throw new RuntimeException("Bạn đã là giáo viên");
			}

			if (ApprovalStatus.isRejected(existingProfile.getApprovalStatus())) {
				existingProfile.setBio(request.getBio());
				existingProfile.setExperience(request.getExperience());
				existingProfile.setPhone(phone);
				existingProfile.setApprovalStatus(ApprovalStatus.PENDING);
				existingProfile.setReviewedAt(null);
				existingProfile.setReviewedBy(null);
				existingProfile.setRejectReason(null);
				existingProfile.setUpdatedAt(LocalDateTime.now());
				existingProfile.getCertificates().clear();

				addCertificates(existingProfile, certificateFiles);

				user.setPhone(phone);
				user.setUpdatedAt(LocalDateTime.now());
				userRepository.save(user);

				TeacherProfile savedProfile = teacherProfileRepository.save(existingProfile);
				return teacherProfileMapper.toTeacherProfileResponse(savedProfile);
			}
		}

		TeacherProfile teacherProfile = TeacherProfile.builder().user(user)
				.approvalStatus(ApprovalStatus.PENDING).bio(request.getBio()).experience(request.getExperience())
				.phone(phone).certificates(new ArrayList<>()).createdAt(LocalDateTime.now())
				.updatedAt(LocalDateTime.now()).build();

		addCertificates(teacherProfile, certificateFiles);

		user.setPhone(phone);
		user.setUpdatedAt(LocalDateTime.now());
		userRepository.save(user);

		TeacherProfile savedProfile = teacherProfileRepository.save(teacherProfile);
		return teacherProfileMapper.toTeacherProfileResponse(savedProfile);
	}

	public TeacherProfileResponse getProfileDangKy() {
		User user = getCurrentUser();
		TeacherProfile teacherProfile = teacherProfileRepository.findByUser(user)
				.orElseThrow(() -> new RuntimeException("Chưa có hồ sơ đăng ký giáo viên"));
		return teacherProfileMapper.toTeacherProfileResponse(teacherProfile);
	}

	@Transactional
	public TeacherProfileResponse duyetDangKyLamGiaoVien(Long teacherProfileId, String approvalStatus,
			String rejectReason) {
		User admin = getCurrentUser();

		if (admin.getRole() == null || !"admin".equalsIgnoreCase(admin.getRole().getRoleName())) {
			throw new RuntimeException("Không đủ quyền thực hiện thao tác này");
		}

		TeacherProfile teacherProfile = teacherProfileRepository.findById(teacherProfileId)
				.orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ đăng ký giáo viên"));

		if (!ApprovalStatus.isPending(teacherProfile.getApprovalStatus())) {
			throw new RuntimeException("Hồ sơ này không ở trạng thái chờ duyệt");
		}

		if (approvalStatus == null || approvalStatus.trim().isEmpty()) {
			throw new RuntimeException("Trạng thái duyệt không được để trống");
		}

		if (!ApprovalStatus.isApproved(approvalStatus) && !ApprovalStatus.isRejected(approvalStatus)) {
			throw new RuntimeException("Trạng thái duyệt chỉ được là APPROVED hoặc REJECTED");
		}

		teacherProfile.setApprovalStatus(approvalStatus.toUpperCase());
		teacherProfile.setReviewedAt(LocalDateTime.now());
		teacherProfile.setReviewedBy(admin);
		teacherProfile.setUpdatedAt(LocalDateTime.now());

		User applicant = teacherProfile.getUser();

		if (ApprovalStatus.isRejected(approvalStatus)) {
			if (rejectReason == null || rejectReason.trim().isEmpty()) {
				throw new RuntimeException("Vui lòng nhập lý do từ chối");
			}
			teacherProfile.setRejectReason(rejectReason.trim());

			notificationService.notifyUser(applicant,
					"Hồ sơ đăng ký giáo viên bị từ chối",
					"Lý do: " + rejectReason.trim() + ". Bạn có thể cập nhật hồ sơ và gửi lại.",
					admin);
		} else {
			teacherProfile.setRejectReason(null);

			Role role = roleRepository.findByRoleName("teacher")
					.orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò giáo viên"));
			applicant.setRole(role);
			userRepository.save(applicant);

			notificationService.notifyUser(applicant,
					"Hồ sơ đăng ký giáo viên đã được duyệt",
					"Chúc mừng! Bạn đã được cấp quyền giáo viên. Hãy đăng nhập lại hoặc vào khu vực giáo viên để bắt đầu tạo khóa học.",
					admin);
		}

		TeacherProfile savedProfile = teacherProfileRepository.save(teacherProfile);
		return teacherProfileMapper.toTeacherProfileResponse(savedProfile);
	}

	public TeacherApplicationSummaryResponse getApplicationSummary() {
		User user = getCurrentUser();
		return teacherProfileRepository.findByUser(user)
				.map(profile -> TeacherApplicationSummaryResponse.builder()
						.registered(true)
						.approvalStatus(profile.getApprovalStatus())
						.phone(resolvePhoneForUser(user, profile))
						.build())
				.orElseGet(() -> TeacherApplicationSummaryResponse.builder()
						.registered(false)
						.approvalStatus(null)
						.phone(user.getPhone())
						.build());
	}

	private String resolvePhoneForUser(User user, TeacherProfile profile) {
		if (profile.getPhone() != null && !profile.getPhone().isBlank()) {
			return profile.getPhone();
		}
		if (user.getPhone() != null && !user.getPhone().isBlank()) {
			return user.getPhone();
		}
		return null;
	}

	private void addCertificates(TeacherProfile teacherProfile, List<MultipartFile> certificateFiles)
			throws IOException {
		for (MultipartFile file : certificateFiles) {
			if (file == null || file.isEmpty()) {
				continue;
			}

			String imageUrl = fileService.saveFile(file, "images");

			TeacherCertificate certificate = TeacherCertificate.builder().teacherProfile(teacherProfile)
					.certificateUrl(imageUrl).build();

			teacherProfile.getCertificates().add(certificate);
		}

		if (teacherProfile.getCertificates().isEmpty()) {
			throw new RuntimeException("Vui lòng tải lên ít nhất 1 ảnh chứng chỉ hợp lệ");
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
}
