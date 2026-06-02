package com.learning.english.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDashboardChartItemResponse {

    private String label;

    private BigDecimal value;
}