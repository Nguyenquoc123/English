package com.learning.english.controller;

import com.learning.english.dto.request.ExamQuestionAttachRequest;
import com.learning.english.dto.request.ExamQuestionCreateRequest;
import com.learning.english.dto.request.ExamSubmitRequest;
import com.learning.english.dto.request.PracticeSubmitRequest;
import com.learning.english.dto.response.PracticeSubmitResponse;
import com.learning.english.dto.response.StudentExamQuestionResponse;
import com.learning.english.dto.response.TeacherExamQuestionResponse;
import com.learning.english.service.ExamQuestionService;
import com.learning.english.service.PracticeAttemptService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/exam-questions")
public class ExamQuestionController {

	@Autowired
	private ExamQuestionService examQuestionService;
	
	@Autowired
	PracticeAttemptService practiceAttemptService;

	@PostMapping(value = "/exams/{examId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public TeacherExamQuestionResponse taoCauHoiMoiVaThemVaoDeThi(@PathVariable Long examId,
			@RequestPart("data") ExamQuestionCreateRequest request,
			@RequestPart(value = "mediaFile", required = false) MultipartFile mediaFile) {
		return examQuestionService.taoCauHoiMoiVaThemVaoDeThi(examId, request, mediaFile);
	}

	@PostMapping("/exams/{examId}/attach")
	public List<TeacherExamQuestionResponse> ganCauHoiCoSanVaoDeThi(@PathVariable Long examId,
			@RequestBody ExamQuestionAttachRequest request) {
		return examQuestionService.ganCauHoiCoSanVaoDeThi(examId, request);
	}

	@GetMapping("/{examId}/ds")
	public StudentExamQuestionResponse layCauHoiBaiThi(@PathVariable Long examId) {
		return examQuestionService.layDanhSachCauHoiBaiThiChoHocVien(examId);
	}
	
	@PostMapping("/exam-submit")
    public PracticeSubmitResponse nopBaiOnTap(
            @RequestBody ExamSubmitRequest request
    ) {
        return practiceAttemptService.nopBaiThi(request);
    }
}