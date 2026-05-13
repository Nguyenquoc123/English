package com.learning.english.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learning.english.dto.request.VocabularyManyRequest;
import com.learning.english.dto.request.VocabularyRequest;
import com.learning.english.dto.response.VocabularyResponse;
import com.learning.english.service.VocabularyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/tu-vung")
public class VocabularyController {

    @Autowired
    VocabularyService vocabularyService;
    
    @PostMapping("/{lessonId}/them-tu-vung")
    public VocabularyResponse themMotTuVung(
            @PathVariable Long lessonId,
            @RequestPart("data") VocabularyRequest request,
            @RequestPart(value = "audioFile", required = false) MultipartFile audioFile,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile
    ) throws IOException {
        return vocabularyService.themMotTuVungCoFile(
                lessonId,
                request,
                audioFile,
                imageFile
        );
    }

    @PostMapping(
            value = "/{lessonId}/them-nhieu-tu-vung",
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

    @GetMapping("/lessons/{lessonId}")
    public ResponseEntity<List<VocabularyResponse>> layDanhSachTuVungTheoLesson(
            @PathVariable Long lessonId
    ) {
        return ResponseEntity.ok(vocabularyService.layDanhSachTuVungTheoLesson(lessonId));
    }
}