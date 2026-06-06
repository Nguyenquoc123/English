package com.learning.english.dto.response;



import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class RefundRequestHistoryResponse {

    private Long refundRequestId;

    private Long courseId;
    private String courseTitle;
    private String courseThumbnailUrl;
    private String shortDescription;

    private Long transactionItemId;
    private BigDecimal refundAmount;

    private String reasonCode;
    private String reason;
    private String detailDescription;

    private Integer completedLessons;
    private Integer totalLessons;
    private BigDecimal progressPercent;

    private LocalDateTime purchaseAt;
    private LocalDateTime paidAt;
    private LocalDateTime refundDeadlineAt;

    private String status;

    private String reviewNote;
    private String rejectReason;

    private LocalDateTime reviewedAt;
    private Long reviewedById;
    private String reviewedByName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String refundBankName;
    private String refundAccountNumber;
    

    
}