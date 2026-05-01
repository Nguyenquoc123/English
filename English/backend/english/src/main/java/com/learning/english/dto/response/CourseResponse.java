package com.learning.english.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseResponse {

    private Long courseId;

    private Long teacherId;
    private String teacherName;

    private Long levelId;
    private String levelName;

    private String title;
    private String description;
    private String thumbnailUrl;
    private BigDecimal price;
    private String courseType;
    private String status;
    private BigDecimal examPrice;

    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private Long reviewedBy;
    private String rejectReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}