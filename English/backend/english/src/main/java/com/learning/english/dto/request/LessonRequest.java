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
    


//    @NotBlank(message = "Trạng thái không được để trống")
    private String status;
}