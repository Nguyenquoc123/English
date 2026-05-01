package com.learning.english.dto.request;

//import jakarta.validation.constraints.Min;
//import jakarta.validation.constraints.NotBlank;
//import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonRequest {

    private Long courseId;

    private String title;

    private String description;
    
    private String lessonType;

//    @NotNull(message = "Thứ tự bài học không được để trống")
//    @Min(value = 1, message = "Thứ tự bài học phải lớn hơn hoặc bằng 1")
    private Integer lessonOrder;

//    @NotBlank(message = "Trạng thái không được để trống")
    private String status;
}