package com.learning.english.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learning.english.dto.request.QuestionManyRequest;
import com.learning.english.dto.response.QuestionResponse;
import com.learning.english.service.QuestionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/cau-hoi")
public class QuestionController {

    @Autowired
    QuestionService questionService;

    @PostMapping(
            value = "/batch",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<List<QuestionResponse>> themNhieuCauHoiCoFile(
            @RequestPart("data") String data,
            @RequestPart(value = "mediaFiles", required = false) List<MultipartFile> mediaFiles
    ) throws Exception {

        ObjectMapper objectMapper = new ObjectMapper();

        QuestionManyRequest request = objectMapper.readValue(data, QuestionManyRequest.class);

        return ResponseEntity.ok(questionService.themNhieuCauHoiCoFile(request, mediaFiles));
    }
}