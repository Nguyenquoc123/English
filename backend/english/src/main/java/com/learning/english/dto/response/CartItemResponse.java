package com.learning.english.dto.response;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {

    private Long cartItemId;

    private Long courseId;

    private String title;

    private String shortDescription;

    private String thumbnailUrl;

    private BigDecimal price;

    private String teacherName;

    private String levelName;
}
