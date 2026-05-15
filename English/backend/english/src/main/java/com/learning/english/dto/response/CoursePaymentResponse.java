package com.learning.english.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoursePaymentResponse {

    private Long transactionId;

    private Long courseId;

    private String courseTitle;

    private Long userId;

    private String paymentCode;

    private BigDecimal amount;

    private String status;

    private String qrUrl;

    private String bankName;

    private String accountNumber;

    private String accountName;

    private LocalDateTime createdAt;
}