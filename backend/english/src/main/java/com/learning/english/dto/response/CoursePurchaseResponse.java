package com.learning.english.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoursePurchaseResponse {

    private Long enrollmentId;

    private Long courseId;

    private Long userId;

    private String accessStatus;

    private String message;
}