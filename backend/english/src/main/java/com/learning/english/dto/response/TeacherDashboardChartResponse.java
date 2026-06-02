package com.learning.english.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDashboardChartResponse {

    private List<TeacherDashboardChartItemResponse> revenueChart;

    private List<TeacherDashboardChartItemResponse> studentChart;
}