package com.learning.english.dto.response;



import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherWithdrawalResponse {

    private Long withdrawalId;

    private BigDecimal amount;

    private BigDecimal totalAmount;

    private String bankName;

    private String accountNumber;

    private String bankAccountNumber;

    private String accountName;

    private String bankAccountName;

    private String status;

    private LocalDateTime requestedAt;

    private LocalDateTime createdAt;

    private LocalDateTime reviewedAt;

    private LocalDateTime processedAt;

    private String rejectReason;

    private String note;
}