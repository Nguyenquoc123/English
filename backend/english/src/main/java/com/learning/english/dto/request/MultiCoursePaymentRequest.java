package com.learning.english.dto.request;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MultiCoursePaymentRequest {
    private List<Long> courseIds;
}