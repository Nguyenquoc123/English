package com.learning.english.dto.request;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseRequest {

    private Long levelId;

    private String title;

    private String description;
    
    private String shortDescription;

    private BigDecimal price;

    private String courseType;

    private BigDecimal examPrice;
}