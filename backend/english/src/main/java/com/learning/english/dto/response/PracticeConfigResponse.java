package com.learning.english.dto.response;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.LocalDateTime;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PracticeConfigResponse {

    private Long configId;

    private Long lessonId;

    private String practiceType;

    private Boolean isEnabled;

    private Long questionCount;
    
    private LocalDateTime lanCuoi;
    
    private Long soLanLam;
    
    private BigDecimal diemCaoNhat;
}