package com.learning.english.dto.request;

import java.math.BigDecimal;

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
public class CourseDuyetRequest {
	private String approvalStatus; // APPROVED hoặc REJECTED
    private String rejectReason;
}
