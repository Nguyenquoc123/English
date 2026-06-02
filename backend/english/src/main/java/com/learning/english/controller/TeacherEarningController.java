package com.learning.english.controller;



import com.learning.english.dto.response.TeacherEarningsResponse;
import com.learning.english.service.TeacherEarningsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/teacher/earnings")
public class TeacherEarningController {

    private final TeacherEarningsService teacherEarningsService;

    @GetMapping
    public TeacherEarningsResponse getTeacherEarnings() {
        return teacherEarningsService.getTeacherEarnings();
    }
}