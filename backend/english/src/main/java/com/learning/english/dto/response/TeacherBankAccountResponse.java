package com.learning.english.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherBankAccountResponse {
    private Long bankAccountId;
    private String bankName;
    private String accountNumber;
    private String accountName;
    private Boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
