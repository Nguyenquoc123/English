package com.learning.english.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateSystemSettingRequest {

    @NotBlank(message = "Giá trị cấu hình không được để trống")
    private String settingValue;
}