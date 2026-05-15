package com.learning.english.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseRejectRequest {

    private String rejectReason;
}