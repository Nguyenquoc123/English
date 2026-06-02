package com.learning.english.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDashboardResponse {

    private TeacherDashboardSummaryResponse summary;

    private TeacherDashboardChartResponse charts;

    private List<TeacherDashboardCourseResponse> courses;
}