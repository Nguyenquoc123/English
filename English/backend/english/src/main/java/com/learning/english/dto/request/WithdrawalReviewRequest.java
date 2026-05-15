package com.learning.english.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawalReviewRequest {
    private String status;
    private String rejectReason;
}
