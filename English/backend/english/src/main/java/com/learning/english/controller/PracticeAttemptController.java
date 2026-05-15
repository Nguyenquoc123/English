package com.learning.english.controller;

import com.learning.english.dto.request.PracticeSubmitRequest;
import com.learning.english.dto.response.PracticeSubmitResponse;
import com.learning.english.service.PracticeAttemptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/practice-attempts")
public class PracticeAttemptController {

    @Autowired
    private PracticeAttemptService practiceAttemptService;

    @PostMapping("/submit")
    public PracticeSubmitResponse nopBaiOnTap(
            @RequestBody PracticeSubmitRequest request
    ) {
        return practiceAttemptService.nopBaiOnTap(request);
    }
    
    @GetMapping("/{attemptId}/result")
    public PracticeSubmitResponse layKetQuaBaiOnTap(
            @PathVariable Long attemptId
    ) {
        return practiceAttemptService.layKetQuaBaiOnTap(attemptId);
    }
}