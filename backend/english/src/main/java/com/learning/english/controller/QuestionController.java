package com.learning.english.controller;

import com.learning.english.dto.request.CreateQuestionAiRequest;
import com.learning.english.dto.request.QuestionAttachRequest;
import com.learning.english.dto.request.QuestionManyRequest;
import com.learning.english.dto.request.QuestionRequest;
import com.learning.english.dto.response.QuestionBankItemResponse;
import com.learning.english.dto.response.QuestionResponse;
import com.learning.english.service.QuestionAIService;
import com.learning.english.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;
    
	@Autowired
    QuestionAIService questionAIService;

    @GetMapping("/my-bank")
    public List<QuestionBankItemResponse> layNganHangCauHoiCuaToi(
            @RequestParam String questionType,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long levelId
    ) {
        return questionService.layNganHangCauHoiCuaGiaoVien(questionType, keyword, levelId);
    }
	
	@GetMapping("/my-bank-page")
	public Page<QuestionResponse> layNganHangCauHoiCuaToi(
	        @RequestParam(required = false) String questionType,
	        @RequestParam(required = false) String keyword,
	        @RequestParam(required = false) Long levelId,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size
	) {
	    return questionService.layNganHangCauHoiCuaGiaoVien(
	            questionType,
	            keyword,
	            levelId,
	            page, size
	    );
	}

    @PostMapping("/lessons/{lessonId}")
    public QuestionResponse taoCauHoiVaGanVaoLesson(
            @PathVariable Long lessonId,
            @RequestPart("data") QuestionRequest request,
            @RequestPart(value = "mediaFile", required = false) MultipartFile mediaFile
    ) throws IOException {
        request.setLessonId(lessonId);

        return questionService.taoCauHoiVaGanVaoLesson(
                lessonId,
                request,
                mediaFile
        );
    }
    
    @PostMapping("/bank")
    public QuestionResponse themCauHoiVaoNganHang(
            @RequestPart("data") QuestionRequest request,
            @RequestPart(value = "mediaFile", required = false) MultipartFile mediaFile
    ) throws IOException {
        

        return questionService.themCauHoiVaoNganHang(
                request,
                mediaFile
        );
    }
    
    @PostMapping("/ai-generate")
    public ResponseEntity<List<QuestionResponse>> taoBaiOnTapBangAi(
            @RequestBody CreateQuestionAiRequest request
    ) {
        return ResponseEntity.ok(
        		questionAIService.taoBaiOnTapBangAi(request)
        );
    }
    
    @PostMapping("/bank/many")
    public List<QuestionResponse> themNhieuCauHoiVaoNganHang(
            @RequestBody QuestionManyRequest request
    ) {

        return questionService.taoNhieuCauHoiVaoNganHang(
                request.getQuestions()
        );
    }
    
    @PostMapping("/lessons/{lessonId}/many")
    public List<QuestionResponse> taoNhieuCauHoiVaGanVaoLesson(
            @PathVariable Long lessonId,
            @RequestBody QuestionManyRequest request
    ) {
        request.getQuestions().forEach(q -> q.setLessonId(lessonId));

        return questionService.taoNhieuCauHoiVaGanVaoLesson(
                lessonId,
                request.getQuestions()
        );
    }

    @PostMapping("/lessons/{lessonId}/attach")
    public List<QuestionResponse> ganCauHoiCuVaoLesson(
            @PathVariable Long lessonId,
            @RequestBody QuestionAttachRequest request
    ) {
        request.setLessonId(lessonId);

        return questionService.ganCauHoiCuVaoLesson(
                lessonId,
                request
        );
    }
}