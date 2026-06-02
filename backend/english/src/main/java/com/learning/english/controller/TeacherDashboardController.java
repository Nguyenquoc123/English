package com.learning.english.controller;

import com.learning.english.dto.response.TeacherDashboardChartResponse;
import com.learning.english.dto.response.TeacherDashboardCourseResponse;
import com.learning.english.dto.response.TeacherDashboardResponse;
import com.learning.english.dto.response.TeacherDashboardSummaryResponse;
import com.learning.english.service.TeacherDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/teacher/dashboard")
public class TeacherDashboardController {

    private final TeacherDashboardService teacherDashboardService;

    @GetMapping
    public TeacherDashboardResponse getDashboard(
            @RequestParam(defaultValue = "7D") String range
    ) {
        return teacherDashboardService.getDashboard(range);
    }

    @GetMapping("/summary")
    public TeacherDashboardSummaryResponse getSummary(
            @RequestParam(defaultValue = "7D") String range
    ) {
        return teacherDashboardService.getSummary(range);
    }

    @GetMapping("/charts")
    public TeacherDashboardChartResponse getCharts(
            @RequestParam(defaultValue = "7D") String range
    ) {
        return teacherDashboardService.getCharts(range);
    }

    @GetMapping("/courses")
    public List<TeacherDashboardCourseResponse> getCourses(
            @RequestParam(defaultValue = "7D") String range
    ) {
        return teacherDashboardService.getCourses(range);
    }
}