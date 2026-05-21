package com.learning.english.controller;


import com.learning.english.dto.request.CreatePersonalPracticeAiRequest;
import com.learning.english.dto.response.PersonalPracticeResponse;
import com.learning.english.dto.response.PracticeQuestionResponse;
import com.learning.english.service.PersonalPracticeService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/personal-practices")
@RestController

public class PersonalPracticeController {
	@Autowired
    PersonalPracticeService personalPracticeService;

	@GetMapping
	public List<PersonalPracticeResponse> getPersonalPractices(
	        @RequestParam(required = false) String keyword,
	        @RequestParam(required = false) String type
	) {
	    return personalPracticeService.layDanhSachBaiOnTap(keyword, type);
	}
	
	@GetMapping("/{personalPracticeId}")
	public List<PracticeQuestionResponse> getChiTietBaiOnTapCaNhan(
	        @PathVariable Long personalPracticeId
	) {
	    return personalPracticeService.layDSCauHoiBaiOnTapCaNhan(personalPracticeId);
	}
	
    @PostMapping("/ai-generate")
    public ResponseEntity<PersonalPracticeResponse> taoBaiOnTapBangAi(
            @RequestBody CreatePersonalPracticeAiRequest request
    ) {
        return ResponseEntity.ok(
                personalPracticeService.taoBaiOnTapBangAi(request)
        );
    }
}