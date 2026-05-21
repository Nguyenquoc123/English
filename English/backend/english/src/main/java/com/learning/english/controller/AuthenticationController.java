package com.learning.english.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learning.english.dto.request.UserLoginRequest;
import com.learning.english.dto.request.UserRequest;
import com.learning.english.dto.request.XacMinhOTPRequest;
import com.learning.english.dto.response.AuthenticationResponse;
import com.learning.english.service.AuthenticationService;

@RestController
@RequestMapping("/")
public class AuthenticationController {
	@Autowired
	AuthenticationService userService;
	
	@PostMapping("/register")
	ResponseEntity<AuthenticationResponse> register(@RequestBody UserRequest userRequest){
		return ResponseEntity.ok(userService.dangKy(userRequest));
	}
	
	@PostMapping("/xacminh")
	ResponseEntity<AuthenticationResponse> xacMinh(@RequestBody XacMinhOTPRequest request){
		return ResponseEntity.ok(userService.xacMinhOTP(request));
	}
	
	@PostMapping("/login")
	ResponseEntity<AuthenticationResponse> login(@RequestBody UserLoginRequest request){
		return ResponseEntity.ok(userService.dangNhap(request));
	}
}
