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
public class NotificationSseResponse {

	private String transactionCode;

	private String status;

	private BigDecimal amount;

	private LocalDateTime paidAt;

	private String message;
}