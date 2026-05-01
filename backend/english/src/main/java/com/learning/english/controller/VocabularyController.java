package com.learning.english.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learning.english.dto.request.VocabularyManyRequest;
import com.learning.english.dto.response.VocabularyResponse;
import com.learning.english.service.VocabularyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/tu-vung")
public class VocabularyController {

    @Autowired
    VocabularyService vocabularyService;

    @PostMapping(
            value = "/them-tu-vung",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<List<VocabularyResponse>> themNhieuTuVungCoFile(
            @RequestPart("data") String data,
            @RequestPart(value = "audioFiles", required = false) List<MultipartFile> audioFiles,
            @RequestPart(value = "imageFiles", required = false) List<MultipartFile> imageFiles
    ) throws Exception {

        ObjectMapper objectMapper = new ObjectMapper();

        VocabularyManyRequest request = objectMapper.readValue(data, VocabularyManyRequest.class);

        return ResponseEntity.ok(
                vocabularyService.themNhieuTuVungCoFile(request, audioFiles, imageFiles)
        );
    }

    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<VocabularyResponse>> layDanhSachTuVungTheoLesson(
            @PathVariable Long lessonId
    ) {
        return ResponseEntity.ok(vocabularyService.layDanhSachTuVungTheoLesson(lessonId));
    }
}