package com.learning.english.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.learning.english.dto.response.CartItemResponse;
import com.learning.english.entity.CartItem;
import com.learning.english.entity.Course;
import com.learning.english.entity.User;
import com.learning.english.mapper.CartItemMapper;
import com.learning.english.repository.CartItemRepository;

import com.learning.english.repository.CourseRepository;
import com.learning.english.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class CartService {
	
	@Autowired
	CourseRepository courseRepository;
	
	@Autowired
	UserRepository userRepository;
	
	@Autowired
	CartItemRepository cartItemRepository;
	
	@Autowired
	CartItemMapper cartItemMapper;
	
	public void themVaoGioHang(Long courseId) {
		Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));
		User user = getCurrentUser();
		
		
		boolean check = cartItemRepository.existsByUser_UserIdAndCourse_CourseId(user.getUserId(), courseId);
		if(check)
			throw new RuntimeException("Sản phẩm đã có trong giỏ hàng");
		
		CartItem cartItem = CartItem.builder()
				.course(course)
				.user(user)
				.build();
		
		cartItem = cartItemRepository.save(cartItem);
		
	}
	
	public List<CartItemResponse> dsKhoaHocInGioHang(){
		User user = getCurrentUser();
		return cartItemRepository.dsKhoaHocInGioHang(user.getUserId()).stream().map(cartItemMapper::toCartItemResponse).toList();
	}
	
	@Transactional
	public void xoaKhoiGioHang(Long cartItemId) {
		User user = getCurrentUser();
		CartItem cartItem = cartItemRepository.findById(cartItemId).orElseThrow(() ->  new RuntimeException("Không tìm thấy sản phẩm trong giỏ hàng!"));
		if(cartItem.getUser().getUserId() != user.getUserId())
			throw new RuntimeException("Bạn không thể xóa giỏ hàng không phải của mình");
		
		
		cartItemRepository.delete(cartItem);
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
