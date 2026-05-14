package com.learning.english.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawalResponse {
    private Long withdrawalId;
    private Long teacherId;
    private String teacherName;
    private String teacherEmail;
    private Long bankAccountId;
    private String bankName;
    private String accountNumber;
    private String accountHolder;
    private BigDecimal amount;
    private String status;
    private String proofImageUrl;
    private LocalDateTime requestedAt;
    private LocalDateTime reviewedAt;
    private Long reviewedBy;
    private String rejectReason;
    private LocalDateTime paidAt;
}
