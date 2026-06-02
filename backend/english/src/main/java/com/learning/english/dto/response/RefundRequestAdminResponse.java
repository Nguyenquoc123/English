package com.learning.english.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
public class RefundRequestAdminResponse {
    private Long refundRequestId;
    private Long transactionItemId;
    private Long courseId;
    private String courseTitle;
    private Long teacherId;
    private String teacherName;
    private Long studentId;
    private String studentUsername;
    private String studentFullName;
    private String studentEmail;
    private String studentPhone;
    private String refundBankName;
    private String refundAccountNumber;
    private String refundAccountName;
    private BigDecimal amount;
    private String reasonCode;
    private String reasonLabel;
    private String reason;
    private String detailDescription;
    private String status;
    private LocalDateTime purchaseAt;
    private LocalDateTime refundDeadlineAt;
    private Long remainingSecondsAtRequest;
    private BigDecimal progressPercent;
    private Integer completedLessons;
    private Integer totalLessons;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    private String rejectReason;
    private String qrPay;
    private String paymentCode;
}
