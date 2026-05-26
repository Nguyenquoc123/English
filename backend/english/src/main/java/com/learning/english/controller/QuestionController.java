package com.learning.english.controller;

import com.learning.english.dto.request.QuestionAttachRequest;
import com.learning.english.dto.request.QuestionManyRequest;
import com.learning.english.dto.request.QuestionRequest;
import com.learning.english.dto.response.QuestionBankItemResponse;
import com.learning.english.dto.response.QuestionResponse;
import com.learning.english.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @GetMapping("/my-bank")
    public List<QuestionBankItemResponse> layNganHangCauHoiCuaToi(
            @RequestParam String questionType,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long levelId
    ) {
        return questionService.layNganHangCauHoiCuaGiaoVien(questionType, keyword, levelId);
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