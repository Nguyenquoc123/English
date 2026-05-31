package com.learning.english.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundEligibilityResponse {
    private Long courseId;
    private Long transactionId;
    private boolean canRequestRefund;
    @Builder.Default
    private List<String> ineligibilityReasons = new ArrayList<>();
    private LocalDateTime purchaseAt;
    private LocalDateTime refundDeadlineAt;
    private Long remainingSeconds;
    private BigDecimal progressPercent;
    private Integer completedLessons;
    private Integer totalLessons;
    private String accessStatus;
}
