package com.learning.english.dto.response;

import java.time.LocalDateTime;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSettingResponse {

    private Long settingId;

    private String settingKey;

    private String settingValue;

    private String description;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}