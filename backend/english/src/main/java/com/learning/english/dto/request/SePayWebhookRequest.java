package com.learning.english.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SePayWebhookRequest {

    private Long id;

    private String gateway;

    private String transactionDate;

    private String accountNumber;

    private String subAccount;

    private String code;

    private String content;

    private String transferType;

    private String description;

    private Long transferAmount;

    private Long accumulated;

    private String referenceCode;
}