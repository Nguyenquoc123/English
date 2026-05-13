package com.learning.english.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learning.english.dto.response.LevelResponse;
import com.learning.english.service.LevelService;

@RestController
@RequestMapping("/level")
public class LevelController {
	@Autowired
	LevelService levelService;
	
	@GetMapping("/all-level")
	public ResponseEntity<List<LevelResponse>> getAllLevel(){
		return ResponseEntity.ok(levelService.getAllLevel()); 
	}
}
