package com.learning.english.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentRefundStatusResponse {
    private Long courseId;
    private Long transactionId;
    private String status;
    private String accessStatus;
    private String refundReason;
    private String refundRejectReason;
    private LocalDateTime refundRequestedAt;
    private LocalDateTime refundReviewedAt;
    private boolean canRequestRefund;
    private LocalDateTime purchaseAt;
    private LocalDateTime refundDeadlineAt;
    private Long remainingSeconds;
    private BigDecimal progressPercent;
    private Integer completedLessons;
    private Integer totalLessons;
    @Builder.Default
    private List<String> ineligibilityReasons = new ArrayList<>();
}
