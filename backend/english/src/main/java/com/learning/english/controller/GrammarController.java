package com.learning.english.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.learning.english.dto.request.GrammarRequest;
import com.learning.english.dto.response.GrammarResponse;
import com.learning.english.service.GrammarService;

@RestController
@RequestMapping("/grammar")
public class GrammarController {

    @Autowired
    private GrammarService grammarService;

    @PostMapping("/{lessonId}/grammars")
    public GrammarResponse themNguPhap(
            @PathVariable Long lessonId,
            @RequestBody GrammarRequest request
    ) {
        return grammarService.themNguPhap(lessonId, request);
    }

    @GetMapping("/{lessonId}/grammars")
    public List<GrammarResponse> layDanhSachNguPhapTheoLesson(
            @PathVariable Long lessonId
    ) {
        return grammarService.layDanhSachNguPhapTheoLesson(lessonId);
    }
    
    @GetMapping("/{grammarId}")
    public GrammarResponse layChiTietNguPhap(
            @PathVariable Long grammarId
    ) {
        return grammarService.layChiTietNguPhapTheoId(grammarId);
    }
    
    @GetMapping("/{grammarId}/admin")
    public GrammarResponse layChiTietNguPhapByAdmin(
            @PathVariable Long grammarId
    ) {
        return grammarService.layChiTietNguPhapTheoIdByAdmin(grammarId);
    }
}