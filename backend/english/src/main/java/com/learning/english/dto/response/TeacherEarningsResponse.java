package com.learning.english.dto.response;



import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherEarningsResponse {

    private BigDecimal availableAmount;

    private BigDecimal pendingAmount;

    private BigDecimal totalAmount;

    private List<TeacherWithdrawalResponse> withdrawals;

    
}