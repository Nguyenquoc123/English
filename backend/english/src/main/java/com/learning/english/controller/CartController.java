package com.learning.english.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learning.english.dto.response.CartItemResponse;
import com.learning.english.service.CartService;

@RestController
@RequestMapping("/gio-hang")
public class CartController {
	@Autowired
	CartService cartService;
	
	@PostMapping("/them/{courseId}")
	public ResponseEntity<?> themVaoGioHang(@PathVariable Long courseId){
		cartService.themVaoGioHang(courseId);
		Map<String, Object> response = new HashMap<>();
		response.put("message", "Đã thêm vào giỏ hàng");

		return ResponseEntity.ok(response);
	}
	
	@DeleteMapping("/xoa/{cartItemId}")
	public ResponseEntity<?> xoaKhoiGioHang(@PathVariable Long cartItemId){
		cartService.xoaKhoiGioHang(cartItemId);
		Map<String, Object> response = new HashMap<>();
		response.put("message", "Đã xóa khóa học khỏi giỏ hàng");

		return ResponseEntity.ok(response);
	}
	
	@GetMapping("/khoa-hoc")
	public ResponseEntity<List<CartItemResponse>> dsKhoaHocInGioHang(){
		return ResponseEntity.ok(cartService.dsKhoaHocInGioHang());
	}
	
	
}
