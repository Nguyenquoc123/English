package com.learning.english.dto.response;

import lombok.*;

import java.math.BigDecimal;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionAdminResponse {

    private Long transactionId;

    private Long refundRequestId;

    private Long userId;

    private String username;

    private String email;

    private String targetType;

    private Long targetId;

    private String targetName;

    private BigDecimal amount;

    private String status;

    private String refundReason;

    private String refundBankName;

    private String refundAccountNumber;

    private String refundAccountName;

    private String refundRejectReason;

    private String refundReviewedByUsername;

    private LocalDateTime refundRequestedAt;

    private LocalDateTime refundReviewedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
