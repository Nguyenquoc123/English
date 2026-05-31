package com.learning.english.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentBankAccountRequest {
    private String bankName;
    private String accountNumber;
    private String accountName;
    private Boolean isDefault;
}
