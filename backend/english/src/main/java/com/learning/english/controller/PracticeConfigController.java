package com.learning.english.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.learning.english.dto.response.PracticeConfigResponse;
import com.learning.english.dto.response.StudentPracticeResponse;
import com.learning.english.service.PracticeConfigService;

import java.util.List;

@RestController
@RequestMapping("/practice-configs")
public class PracticeConfigController {

    @Autowired
    private PracticeConfigService practiceConfigService;
    
    

    @GetMapping("/{lessonId}")
    public List<PracticeConfigResponse> layCacBaiOnTapChoHocVien(
            @PathVariable Long lessonId
    ) {
        return practiceConfigService.layCauHinhOnTapChoHocVien(lessonId);
    }
    
    
    @GetMapping("/{lessonId}/practice/{practiceType}/student")
    public StudentPracticeResponse layDanhSachCauHoiOnTapChoHocVien(
            @PathVariable Long lessonId,
            @PathVariable String practiceType
    ) {
        return practiceConfigService.layDanhSachCauHoiOnTapChoHocVien(
                lessonId,
                practiceType
        );
    }
}