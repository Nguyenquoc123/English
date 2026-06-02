package com.learning.english.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherWithdrawalSummaryResponse {
    private BigDecimal totalRevenue;
    private BigDecimal availableBalance;
    private BigDecimal pendingWithdrawalAmount;
    private long pendingWithdrawalCount;
    private List<TeacherBankAccountResponse> bankAccounts;
}
