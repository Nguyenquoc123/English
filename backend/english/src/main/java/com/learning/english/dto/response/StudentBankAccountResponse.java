package com.learning.english.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentBankAccountResponse {
    private Long studentBankAccountId;
    private String bankName;
    private String accountNumber;
    private String accountName;
    private Boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
