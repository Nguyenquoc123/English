package com.learning.english.dto.response;

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
public class TeacherApplicationSummaryResponse {

    private boolean registered;
    private String approvalStatus;
    private String phone;
}
