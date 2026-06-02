package com.learning.english.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class WithdrawalCreateRequest {
    private BigDecimal amount;
    private Long bankAccountId;
}
