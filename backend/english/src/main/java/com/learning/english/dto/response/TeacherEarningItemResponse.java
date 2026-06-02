package com.learning.english.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherEarningItemResponse {
    private Long earningId;
    private String courseTitle;
    private BigDecimal netAmount;
    private String status;
    private LocalDateTime createdAt;
}
