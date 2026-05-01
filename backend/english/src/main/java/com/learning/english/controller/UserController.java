package com.learning.english.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.learning.english.dto.request.StudentUpdateRequest;
import com.learning.english.dto.response.StudentProfileResponse;
import com.learning.english.service.UserService;

@RestController
@RequestMapping("/")
public class UserController {
	@Autowired
	UserService userService;
	
	@GetMapping("/hosocanhan")
	ResponseEntity<StudentProfileResponse> getHoSoCaNhan(){
		return ResponseEntity.ok(userService.getHoSoCaNhan());
	}
	
	@PutMapping(value = "/hosocanhan", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<StudentProfileResponse> updateHoSoCaNhan(
	        @RequestParam("fullName") String fullName,
	        @RequestParam("email") String email,
	        @RequestParam(value = "avatarFile", required = false) MultipartFile avatarFile) throws IOException {
	    return ResponseEntity.ok(userService.updateHoSoCaNhan(fullName, email, avatarFile));
	}
}
