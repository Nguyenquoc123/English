package com.learning.english.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learning.english.dto.response.AttemptResponse;
import com.learning.english.service.AttemptService;

@RestController
@RequestMapping("/lich-su-lam-bai")
public class AttempController {
	@Autowired
	AttemptService attemptService;

	@GetMapping
	public List<AttemptResponse> layLichSuLamBai() {
		return attemptService.layLichSuLamBai();
	}
}
