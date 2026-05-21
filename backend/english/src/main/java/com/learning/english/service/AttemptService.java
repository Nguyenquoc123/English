package com.learning.english.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.learning.english.dto.response.AttemptResponse;
import com.learning.english.entity.Attempt;
import com.learning.english.entity.User;
import com.learning.english.mapper.AttemptMapper;
import com.learning.english.repository.AttemptRepository;
import com.learning.english.repository.UserRepository;

@Service
public class AttemptService {
	@Autowired
	AttemptRepository attemptRepository;
	
	@Autowired
	AttemptMapper attemptMapper;
	
	@Autowired
	UserRepository userRepository;
	
	public List<AttemptResponse> layLichSuLamBai() {
		User user = getCurrentUser();
        List<Attempt> attempts = attemptRepository.findByUser_UserIdOrderByStartedAtDesc(user.getUserId());

        return attempts.stream()
                .map(attemptMapper::toAttemptResponse)
                .toList();
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
}
